import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { toolDefinitions } from '../src/agent.mjs'

test('ElevenLabs tools use supported headers and system conversation IDs', () => {
  const tools = toolDefinitions('https://example.test', 'test-secret')
  assert.equal(tools.length, 3)
  for (const tool of tools) {
    assert.equal(tool.type, 'webhook')
    assert.equal(tool.api_schema.request_headers['x-dayone-secret'], 'test-secret')
    assert.equal(Array.isArray(tool.api_schema.request_headers), false)
    assert.deepEqual(tool.api_schema.request_body_schema.properties.conversation_id, {
      type: 'string', dynamic_variable: 'system__conversation_id',
    })
  }
})

test('Vobiz adapter sends documented authentication and JSON without real SMS', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dayone-integration-'))
  process.env.DATA_DIR = dir
  const { default: config } = await import('../src/config.mjs')
  const { initStore } = await import('../src/store.mjs')
  const { sendLink } = await import('../src/sms.mjs')
  await initStore()
  const oldFetch = globalThis.fetch
  const oldSms = structuredClone(config.sms)
  let request
  try {
    config.sms.provider = 'vobiz'
    config.sms.vobiz = {
      authId: 'test-auth-id', authToken: 'test-auth-token',
      baseUrl: 'https://api.vobiz.ai', senderId: '+12025550100',
    }
    globalThis.fetch = async (url, options) => {
      request = { url, ...options, body: JSON.parse(options.body) }
      return new Response(JSON.stringify({ id: 'test-message-id' }), { status: 201 })
    }
    const result = await sendLink({
      to: '+12025550101', name: 'Test Shop', url: 'https://example.test/s/test-shop',
    })
    assert.equal(result.status, 'sent')
    assert.equal(request.url, 'https://api.vobiz.ai/api/v1/sms/messages')
    assert.equal(request.headers['X-Auth-ID'], 'test-auth-id')
    assert.equal(request.headers['X-Auth-Token'], 'test-auth-token')
    assert.deepEqual(request.body.to, ['+12025550101'])
    assert.equal(request.body.from, '+12025550100')
    assert.equal(request.body.channel, 'sms')
    assert.ok(request.body.idempotencyKey)
    assert.match(request.body.text, /https:\/\/example.test\/s\/test-shop/)
    config.sms.vobiz.authToken = ''
    request = null
    const failed = await sendLink({ to: '+12025550101', name: 'Test', url: 'https://example.test' })
    assert.equal(failed.status, 'failed')
    assert.equal(request, null)
  } finally {
    globalThis.fetch = oldFetch
    config.sms = oldSms
    await rm(dir, { recursive: true, force: true })
  }
})
