import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { json, readJson } from './http.mjs'
import { elevenlabsRequest } from './elevenlabs.mjs'
import { sessions } from './store.mjs'
import { normaliseBrief } from './brief.mjs'
import { checkInput } from './guardrail.mjs'
import { publishBrief } from './publish.mjs'
import config from './config.mjs'
import { reserveAgentSession } from './agent-budget.mjs'

const signingKey = process.env.SESSION_SECRET || randomBytes(32).toString('hex')
const rates = new Map()
function allow(key, limit, period) {
  const now = Date.now()
  const entry = rates.get(key)
  if (!entry || entry.until < now) {
    if (rates.size > 10000) for (const [k, v] of rates) if (v.until < now) rates.delete(k)
    rates.set(key, { count: 1, until: now + period })
    return true
  }
  return ++entry.count <= limit
}
const sign = payload => createHmac('sha256', signingKey).update(payload).digest('base64url')
export function issueBrowserToken() {
  const payload = Buffer.from(JSON.stringify({ sid: `browser-${randomUUID()}`, exp: Date.now() + 3600000 })).toString('base64url')
  return `${payload}.${sign(payload)}`
}
export function verifyBrowserToken(token) {
  if (typeof token !== 'string' || token.length > 1000) return null
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra || !/^[A-Za-z0-9_-]+$/.test(signature)) return null
  const expected = sign(payload)
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data.exp > Date.now() && /^browser-[\da-f-]+$/.test(data.sid) ? data : null
  } catch { return null }
}

/** Browser client tools never receive TOOL_SECRET or permission to send SMS. */
export async function handleBrowserAgent(req, res, path, origin) {
  if (!path.startsWith('/api/agent/')) return false
  if (req.method !== 'POST') {
    json(res, 405, { error: 'POST required' }); return true
  }
  // Forwarded headers are untrusted. Behind a proxy this intentionally shares
  // a conservative peer limit rather than accepting spoofable client IPs.
  const ip = req.socket.remoteAddress || 'unknown'
  if (path === '/api/agent/session') {
    if (!allow(`session:${ip}`, 12, 3600000)) {
      json(res, 429, { error: 'Too many agent sessions. Please try again later.' }); return true
    }
    if (!await reserveAgentSession()) {
      json(res, 429, { error: 'This site’s hourly or daily agent session budget is exhausted. Please try again later.' })
      return true
    }
    try {
      const signed = await elevenlabsRequest(`/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(config.elevenlabs.browserAgentId)}`)
      if (!signed.signed_url) throw new Error('ElevenLabs did not issue a conversation URL.')
      json(res, 200, { signedUrl: signed.signed_url, sessionToken: issueBrowserToken() })
    } catch (err) {
      json(res, err.status || 503, { error: err.status ? err.message : 'ElevenLabs is unavailable on this host. Check the connected account or ELEVENLABS_API_KEY.' })
    }
    return true
  }
  const ticket = verifyBrowserToken(req.headers['x-dayone-session'])
  if (!ticket) { json(res, 401, { error: 'Start a new agent session first.' }); return true }
  if (!allow(`tool:${ticket.sid}`, 100, 60000)) {
    json(res, 429, { error: 'Too many tool requests. Please wait.' }); return true
  }
  const body = await readJson(req, 16384)
  const session = await sessions.get(ticket.sid) || { id: ticket.sid, brief: {}, channel: 'browser-agent' }
  if (path === '/api/agent/tools/save_brief') {
    const input = [body.what, body.businessName, body.who, body.action].filter(Boolean).join('. ')
    const verdict = checkInput(input, { turn: 1 })
    if (verdict.hard) {
      session.refused = true
      await sessions.put(ticket.sid, session)
      json(res, 200, { ok: false, refused: true, say: verdict.reply }); return true
    }
    if (session.refused) { json(res, 200, { ok: false, refused: true, say: 'This session cannot publish.' }); return true }
    session.brief = normaliseBrief(body, session.brief)
    await sessions.put(ticket.sid, session)
    json(res, 200, { ok: true, have: session.brief, say: 'Saved the business details.' })
  } else if (path === '/api/agent/tools/publish_site') {
    if (session.refused) { json(res, 200, { ok: false, refused: true, say: 'This session cannot publish.' }); return true }
    if (!session.brief.what || !session.brief.businessName) {
      json(res, 200, { ok: false, say: 'Ask what the business does and its name, then save_brief first.' }); return true
    }
    const site = await publishBrief(session.brief, { sessionId: ticket.sid, origin })
    session.url = site.url
    await sessions.put(ticket.sid, session)
    json(res, 200, { ok: true, url: site.url, slug: site.slug, say: 'The website was published. Its link is shown in the browser.' })
  } else {
    json(res, 404, { error: 'Unknown browser tool. SMS is not available in browser sessions.' })
  }
  return true
}
