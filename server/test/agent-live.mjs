/**
 * Opt-in paid-provider smoke test. No telephone call or SMS is placed.
 * Starts one real, text-only ElevenLabs session with synthetic business data.
 * Run RUN_LIVE_AGENT_TEST=1 pnpm test:agent-live against the running app.
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

if (process.env.RUN_LIVE_AGENT_TEST !== '1') {
  console.log('Skipped: set RUN_LIVE_AGENT_TEST=1 to use ElevenLabs account credits.')
  process.exit(0)
}
const base = process.env.TEST_APP_URL || 'http://127.0.0.1:5000'
const voiceOnly = process.env.LIVE_AGENT_MODE === 'voice'
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/repl/tools/bin/chromium',
  headless: true, args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})
let page
try {
  const context = await browser.newContext({ permissions: voiceOnly ? ['microphone'] : [] })
  page = await context.newPage()
  await page.goto(`${base}/#/build`)
  if (voiceOnly) {
    const audio = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('No provider audio arrived')), 30000)
      page.on('websocket', socket => socket.on('framereceived', frame => {
        try {
          const event = JSON.parse(String(frame.payload))
          if (event.type === 'audio' && event.audio_event?.audio_base_64) {
            clearTimeout(timeout)
            resolve(true)
          }
        } catch {}
      }))
    })
    await page.getByRole('button', { name: 'Start voice', exact: true }).click()
    await page.getByRole('button', { name: 'Stop session' }).waitFor({ timeout: 30000 })
    assert.equal(await audio, true)
    console.log('PASS: browser voice connected with microphone permission and received real ElevenLabs speech audio. Synthetic microphone only; human speech recognition was not tested.')
  } else {
  await page.getByRole('button', { name: 'Start text chat', exact: true }).click()
  await page.getByText('Text chat is connected.', { exact: true }).waitFor({ timeout: 30000 })
  const input = page.getByRole('textbox', { name: 'Your message' })
  await input.fill('I bake birthday cakes. My business is called Test Bakery. Visitors should email test@example.test. We are in Pune, serving local families. I want a warm and homely feel. Those are all six details; please save the brief and publish my website now. Do not send any SMS.')
  await input.press('Enter')
  await page.getByText('Your website is published.', { exact: true }).waitFor({ timeout: 90000 })
  const link = await page.getByRole('link', { name: 'Open public site', exact: true }).getAttribute('href')
  assert.ok(link?.includes('/s/'))
  const response = await page.request.get(link)
  assert.equal(response.status(), 200)
  assert.match(await response.text(), /Test Bakery/)
  console.log('PASS: real ElevenLabs text chat called client tools, published a site, and served its page.')
  }
} catch (err) {
  // Never dump network requests, signed URLs, session tokens, or API keys.
  const alerts = page ? await page.getByRole('alert').allTextContents().catch(() => []) : []
  console.error('Live agent test failed:', alerts.join(' ') || err.name)
  process.exitCode = 1
} finally {
  if (page) await page.getByRole('button', { name: 'Stop session' }).click({ timeout: 1000 }).catch(() => {})
  await browser.close()
}
