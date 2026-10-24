/**
 * DayOne server.
 *
 * Serves three things from one process: the API the voice agent calls while
 * someone is on the phone, the websites it publishes, and the marketing front
 * end. Express supplies the Clerk authentication/proxy middleware; the
 * existing API handlers and JSON-file storage remain unchanged.
 */
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import express from 'express'
import cors from 'cors'
import { clerkMiddleware, getAuth } from '@clerk/express'
import { publishableKeyFromHost } from '@clerk/shared/keys'
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from './middlewares/clerk-proxy.mjs'

import config from './config.mjs'
import { initStore, sessions, sites, deliveries } from './store.mjs'
import { json, html, text, readJson, serveStatic, match } from './http.mjs'
import { respond, openingLine } from './conversation.mjs'
import { publishBrief, publicOrigin } from './publish.mjs'
import { normaliseBrief } from './brief.mjs'
import { checkInput } from './guardrail.mjs'
import { sendLink } from './sms.mjs'
import { AGENT_PROMPT, FIRST_MESSAGE, toolDefinitions } from './agent.mjs'
import { DIRECTIONS } from './gen/directions.mjs'
import { handleBrowserAgent } from './browser-agent.mjs'
import { configureDayOneAgents } from './elevenlabs.mjs'
import { handleDashboard } from './dashboard.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const FRONTEND_DIR = join(here, '..', '..', 'dist')

/* ---------- Session helpers ---------- */

const newSession = (id) => ({
  id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  turn: 0,
  asking: 'what',
  brief: {},
  history: [],
})

async function loadSession(id) {
  if (!id) return newSession(randomUUID())
  return (await sessions.get(id)) || newSession(id)
}

const save = async (s) => {
  s.updatedAt = new Date().toISOString()
  await sessions.put(s.id, s)
  return s
}

/** Tool calls must carry the shared secret once one is configured. */
function authorised(req) {
  if (!config.toolSecret) return false
  const given = req.headers['x-dayone-secret'] || req.headers['x-api-key'] || ''
  const want = config.toolSecret
  if (given.length !== want.length) return false
  let diff = 0
  for (let i = 0; i < want.length; i++) diff |= given.charCodeAt(i) ^ want.charCodeAt(i)
  return diff === 0
}

/* ---------- Routes ---------- */

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const method = req.method.toUpperCase()
  const origin = publicOrigin(req)

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type, x-dayone-secret, x-dayone-session',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
    })
    return res.end()
  }

  /* Health */
  if (path === '/health' || path === '/api/health') {
    return json(res, 200, {
      ok: true,
      service: 'dayone',
      time: new Date().toISOString(),
      publicUrl: origin,
      sms: config.sms.provider,
      llm: config.llmReady ? config.llm.model : 'off',
      toolsProtected: true,
      toolsConfigured: Boolean(config.toolSecret),
      directions: Object.keys(DIRECTIONS),
    })
  }

  if (await handleDashboard(req, res, path, origin)) return
  if (await handleBrowserAgent(req, res, path, origin)) return

  if (path === '/api/voice/setup' && method === 'POST') {
    if (!config.toolSecret) return json(res, 503, { error: 'Set TOOL_SECRET before configuring agents.' })
    if (!authorised(req)) return json(res, 401, { error: 'Bad or missing x-dayone-secret' })
    try {
      const agents = await configureDayOneAgents(config.publicUrl)
      return json(res, 200, { ok: true, agents, smsProvider: config.sms.provider })
    } catch (err) {
      return json(res, err.status || 502, { error: err.status ? err.message : 'Could not connect agents. Check ElevenLabs access and the service environment.' })
    }
  }

  /* ---- Published sites ---- */
  const siteHit = match('/s/:slug', path)
  if (siteHit && method === 'GET') {
    const site = await sites.get(siteHit.slug)
    if (!site) return html(res, 404, notFoundPage(origin))
    return html(res, 200, site.html, { 'cache-control': 'public, max-age=60' })
  }

  /* ---- Web chat ---- */
  if (path === '/api/chat' && method === 'POST') {
    const body = await readJson(req)
    let session = await loadSession(body.sessionId)

    if (!body.message) {
      await save(session)
      return json(res, 200, { sessionId: session.id, reply: openingLine(), ready: false })
    }
    if (session.refused)
      return json(res, 200, { sessionId: session.id, reply: 'I cannot help with that one.', ready: false, blocked: true, refused: true })

    const turn = respond(session, body.message)
    session = turn.session

    if (!turn.ready) {
      await save(session)
      return json(res, 200, {
        sessionId: session.id,
        reply: turn.reply,
        ready: false,
        blocked: !!turn.blocked,
        refused: !!session.refused,
        brief: session.brief,
      })
    }

    const site = await publishBrief(session.brief, { sessionId: session.id, origin })
    session.slug = site.slug
    await save(session)
    return json(res, 200, {
      sessionId: session.id,
      reply: turn.reply,
      ready: true,
      url: site.url,
      slug: site.slug,
      direction: site.meta.directionName,
      brief: session.brief,
    })
  }

  /* ---- Voice agent tools ---- */
  if (path.startsWith('/api/voice/tools/') && method === 'POST') {
    if (!authorised(req)) return json(res, 401, { error: 'Bad or missing x-dayone-secret' })

    const body = await readJson(req)
    const convoId = String(body.conversation_id || body.conversationId || '').trim()
    if (!convoId) return json(res, 400, { error: 'conversation_id is required' })

    const sessionId = `call-${convoId.replace(/[^a-zA-Z0-9_-]/g, '')}`.slice(0, 80)
    let session = await loadSession(sessionId)
    session.channel = 'voice'

    /* save_brief */
    if (path.endsWith('/save_brief')) {
      // Anything the caller said is still caller input, so it is checked.
      const spoken = [body.what, body.businessName, body.who, body.action].filter(Boolean).join('. ')
      if (spoken) {
        const verdict = checkInput(spoken, { turn: session.turn || 1 })
        if (verdict.hard) {
          session.refused = true
          await save(session)
          return json(res, 200, { ok: false, refused: true, say: verdict.reply })
        }
      }
      session.brief = normaliseBrief(body, session.brief)
      session.turn = (session.turn || 0) + 1
      await save(session)
      return json(res, 200, {
        ok: true,
        saved: Object.keys(body).filter((k) => k !== 'conversation_id'),
        have: session.brief,
        say: 'Saved.',
      })
    }

    /* publish_site */
    if (path.endsWith('/publish_site')) {
      if (session.refused) return json(res, 200, { ok: false, say: 'I cannot build that one.' })
      if (!session.brief?.what && !session.brief?.businessName)
        return json(res, 200, { ok: false, say: 'I still need to know what the business does and what it is called.' })

      try {
        const site = await publishBrief(session.brief, { sessionId, origin })
        session.slug = site.slug
        session.url = site.url
        await save(session)
        return json(res, 200, {
          ok: true,
          url: site.url,
          slug: site.slug,
          spoken_url: speakUrl(site.url),
          say: `The page is live. The address is ${speakUrl(site.url)}.`,
        })
      } catch (err) {
        if (err.code === 'BRIEF_REJECTED')
          return json(res, 200, { ok: false, say: 'I cannot build a site for that.' })
        throw err
      }
    }

    /* send_link */
    if (path.endsWith('/send_link')) {
      if (!session.url) return json(res, 200, { ok: false, say: 'Let me build the page first.' })
      const to = normaliseBrief({ phone: body.phone }, {}).phone || session.brief?.phone
      if (!to) return json(res, 200, { ok: false, say: 'What number should I send it to?' })

      const record = await sendLink({ to, name: session.brief?.businessName, url: session.url })
      await save(session)
      const went = record.status === 'sent'
      return json(res, 200, {
        ok: went,
        status: record.status,
        to,
        say: went ? `Sent to ${spaced(to)}. It should arrive in a moment.`
          : record.status === 'logged' ? 'SMS is in test mode. The link was recorded but no text message was sent.'
          : 'The message did not go through.',
      })
    }

    return json(res, 404, { error: 'Unknown tool' })
  }

  /* ---- Direct publish, for testing and for the web builder ---- */
  if (path === '/api/sites' && method === 'POST') {
    if (!authorised(req)) return json(res, 401, { error: 'Bad or missing x-dayone-secret' })
    const body = await readJson(req)
    try {
      const site = await publishBrief(body, { sessionId: body.sessionId || '', origin })
      return json(res, 201, { ok: true, url: site.url, slug: site.slug, meta: site.meta })
    } catch (err) {
      if (err.code === 'BRIEF_REJECTED') return json(res, 422, { ok: false, error: err.message })
      throw err
    }
  }

  if (path === '/api/sites' && method === 'GET') {
    if (!authorised(req)) return json(res, 401, { error: 'Owner access required' })
    const all = await sites.list()
    return json(res, 200, {
      count: all.length,
      sites: all.map((s) => ({
        slug: s.slug,
        url: `${origin}/s/${s.slug}`,
        name: s.brief?.businessName,
        direction: s.meta?.directionName,
        updatedAt: s.updatedAt,
      })),
    })
  }

  /* ---- Everything needed to configure the agent ---- */
  if (path === '/api/voice/agent-config' && method === 'GET') {
    if (!authorised(req)) return json(res, 401, { error: 'Bad or missing x-dayone-secret' })
    return json(res, 200, {
      first_message: FIRST_MESSAGE,
      prompt: AGENT_PROMPT,
      tools: toolDefinitions(origin, config.toolSecret || '<set TOOL_SECRET>'),
      webhook_base: `${origin}/api/voice/tools`,
    })
  }

  if (path === '/api/deliveries' && method === 'GET') {
    if (!authorised(req)) return json(res, 401, { error: 'Bad or missing x-dayone-secret' })
    const all = await deliveries.list()
    return json(res, 200, { count: all.length, deliveries: all.slice(0, 50) })
  }

  /* ---- Static ---- */
  if (method === 'GET') {
    // Legacy public link must never send customers into owner configuration.
    if (path === '/setup.html') {
      res.writeHead(302, { location: '/', 'cache-control': 'no-store' })
      return res.end()
    }
    if (path === '/admin/setup') {
      if (!config.toolSecret) return json(res, 404, { error: 'Not found' })
      const basic = req.headers.authorization || ''
      const credentials = basic.startsWith('Basic ') ? Buffer.from(basic.slice(6), 'base64').toString() : ''
      const separator = credentials.indexOf(':')
      const owner = credentials.slice(0, separator) === 'owner'
      const secret = separator >= 0 ? credentials.slice(separator + 1) : ''
      if (!owner || !authorised({ headers: { 'x-dayone-secret': secret } })) {
        return json(res, 401, { error: 'Owner access required' }, {
          'www-authenticate': 'Basic realm="DayOne owner settings", charset="UTF-8"',
        })
      }
      res.setHeader('cache-control', 'no-store')
      if (await serveStatic(res, join(here, '../private'), '/setup.html')) return
      return json(res, 404, { error: 'Not found' })
    }
    if (path === '/' && await serveStatic(res, FRONTEND_DIR, '/index.html')) return
    if (await serveStatic(res, FRONTEND_DIR, path)) return
    // The front end is a single-page app, so unknown paths fall back to it.
    try {
      const index = await readFile(join(FRONTEND_DIR, 'index.html'))
      return html(res, 200, index.toString())
    } catch {
      /* no built front end in this deployment */
    }
    return html(res, 404, notFoundPage(origin))
  }

  return json(res, 405, { error: `${method} not allowed here` })
}

/** Spell a URL the way a person would read it down a phone line. */
function speakUrl(url) {
  return String(url)
    .replace(/^https?:\/\//, '')
    .replace(/\./g, ' dot ')
    .replace(/\//g, ' slash ')
    .replace(/-/g, ' dash ')
    .replace(/\s+/g, ' ')
    .trim()
}

const spaced = (n) => String(n).replace(/(\d{2})(?=\d)/g, '$1 ')

function notFoundPage(origin) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fbf8f2;color:#2b2621;
font:16px/1.5 ui-sans-serif,system-ui,sans-serif;text-align:center;padding:24px}
a{color:#2b2621}h1{font-size:1.4rem;margin:0 0 8px}</style></head>
<body><div><h1>There is no page here</h1>
<p>It may have been renamed, or never built.</p>
<p><a href="${origin}/">Build one by talking</a></p></div></body></html>`
}

/* ---------- Boot ---------- */

const app = express()
app.disable('x-powered-by')
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware())
app.use(cors({ credentials: true, origin: true }))
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? '',
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
)
app.use((req, res) => {
  req.dayoneUserId = getAuth(req).userId
  handle(req, res).catch((err) => {
    const status = err.status || 500
    if (status >= 500) console.error('[dayone]', req.method, req.url, err)
    if (!res.headersSent) json(res, status, { error: status >= 500 ? 'Something broke on our side' : err.message })
    else res.end()
  })
})
app.use((err, req, res, _next) => {
  console.error('[dayone] authentication middleware failed', err.status || 'unavailable')
  if (!res.headersSent) json(res, 503, { error: 'Sign-in is temporarily unavailable. Please try again later.' })
  else res.end()
})
const server = createServer(app)

const dir = await initStore()
server.listen(config.port, config.host, () => {
  console.log(`[dayone] listening on http://${config.host}:${config.port}`)
  console.log(`[dayone] data in ${dir}`)
  console.log(`[dayone] sms: ${config.sms.provider} · llm: ${config.llmReady ? config.llm.model : 'off'} · tools ${config.toolSecret ? 'protected' : 'disabled (set TOOL_SECRET)'}`)
})

export { server, handle }
