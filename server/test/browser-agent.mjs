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
  async function call(path, token, body = {}) {
    const req = Readable.from([Buffer.from(JSON.stringify(body))])
    req.method = 'POST'
    req.headers = { 'x-dayone-session': token }
    req.socket = { remoteAddress: 'test' }
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
    assert.equal((await call('/api/agent/tools/send_link', token)).status, 404)
    assert.equal((await call('/api/agent/tools/save_brief', second, { what: 'escort services booking' })).data.refused, true)
    assert.equal((await call('/api/agent/tools/publish_site', second)).data.ok, false)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
