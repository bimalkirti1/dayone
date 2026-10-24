import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'

test('browser tools isolate sessions, require signed tokens, and really publish', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dayone-browser-'))
  process.env.DATA_DIR = dir
  const { initStore } = await import('../src/store.mjs')
  const { handleBrowserAgent, issueBrowserToken, verifyBrowserToken } = await import('../src/browser-agent.mjs')
  const { browserToolDefinitions } = await import('../src/elevenlabs.mjs')
  await initStore()
  async function call(path, token, body = {}, headers = {}, peer = 'test') {
    const req = Readable.from([Buffer.from(JSON.stringify(body))])
    req.method = 'POST'
    req.headers = { 'x-dayone-session': token, ...headers }
    req.socket = { remoteAddress: peer }
    let status, data
    const res = {
      writeHead(code) { status = code },
      end(payload) { data = JSON.parse(payload) },
    }
    await handleBrowserAgent(req, res, path, 'https://example.test')
    return { status, data }
  }
  try {
    const token = issueBrowserToken()
    const second = issueBrowserToken()
    assert.ok(verifyBrowserToken(token))
    assert.equal(verifyBrowserToken(`${token}broken`), null)
    assert.equal(verifyBrowserToken('not.a.token'), null)
    assert.equal(verifyBrowserToken(`${token.split('.')[0]}.${'é'.repeat(43)}`), null)
    assert.equal((await call('/api/agent/tools/save_brief', '')).status, 401)
    const tools = browserToolDefinitions()
    assert.deepEqual(tools.map(t => t.name), ['save_brief', 'publish_site'])
    assert.ok(tools.every(t => t.type === 'client' && t.expects_response))
    assert.ok(tools.every(t => !t.parameters.properties.conversation_id))
    const saved = await call('/api/agent/tools/save_brief', token, {
      what: 'I bake cakes', businessName: 'Test Bakery', action: 'email', email: 'test@example.test',
      place: 'Pune', who: 'Local families', mood: 'warm',
    })
    assert.equal(saved.data.ok, true)
    const published = await call('/api/agent/tools/publish_site', token)
    assert.equal(published.data.ok, true)
    assert.match(published.data.url, /^https:\/\/example.test\/s\//)
    assert.equal((await call('/api/agent/tools/publish_site', second)).data.ok, false)
    const { default: config } = await import('../src/config.mjs')
    const { usageLimits } = await import('../src/store.mjs')
    const oldFetch = globalThis.fetch
    const oldKey = config.elevenlabs.apiKey
    const oldBudget = config.agentBudget
    let providerRequests = 0
    try {
      config.elevenlabs.apiKey = 'test-key-not-a-credential'
      config.agentBudget = { hourly: 3, daily: 3 }
      globalThis.fetch = async () => {
        providerRequests++
        return new Response(JSON.stringify({ signed_url: 'wss://example.test' }), { status: 200 })
      }
      const attempts = await Promise.all(Array.from({ length: 20 }, (_, i) =>
        call('/api/agent/session', '', {}, { 'x-forwarded-for': `192.0.2.${i}` }, `different-peer-${i}`)))
      assert.equal(attempts.filter(r => r.status === 200).length, 3)
      assert.equal(attempts.filter(r => r.status === 429).length, 17)
      assert.equal(providerRequests, 3, 'rotating all IPs cannot bypass the atomic account budget')
      assert.equal((await usageLimits.get('elevenlabs-browser')).daily, 3)
      config.agentBudget = { hourly: 100, daily: 100 }
      await usageLimits.put('elevenlabs-browser', {})
      for (let i = 0; i < 13; i++) {
        const attempt = await call('/api/agent/session', '', {}, { 'x-forwarded-for': `198.51.100.${i}` }, 'same-trusted-peer')
        assert.equal(attempt.status, i < 12 ? 200 : 429, 'forwarded headers cannot change the socket-peer identity')
      }
      assert.equal(providerRequests, 15)
    } finally {
      globalThis.fetch = oldFetch
      config.elevenlabs.apiKey = oldKey
      config.agentBudget = oldBudget
    }
    assert.equal((await call('/api/agent/tools/send_link', token)).status, 404)
    assert.equal((await call('/api/agent/tools/save_brief', second, { what: 'escort services booking' })).data.refused, true)
    assert.equal((await call('/api/agent/tools/publish_site', second)).data.ok, false)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
