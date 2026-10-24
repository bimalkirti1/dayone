/**
 * Runs against the running app, using two disposable DEVELOPMENT Clerk users.
 * Uses real sign-in cookies, never an auth bypass. No AI session/call/SMS starts.
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { publishBrief } from '../src/publish.mjs'
import { createTestAccount } from './helpers/clerk.mjs'
import { mkdir } from 'node:fs/promises'

const base = process.env.TEST_APP_URL || 'http://127.0.0.1:5000'
const accounts = []
let browser
let stage = 'launch-browser'
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/repl/tools/bin/chromium',
    headless: true, args: ['--no-sandbox'],
  })
  stage = 'create-first-test-account'
  const first = await createTestAccount()
  accounts.push(first)
  stage = 'create-second-test-account'
  const second = await createTestAccount()
  accounts.push(second)
  const site = await publishBrief({
    what: 'Handmade pottery', businessName: 'Dashboard Test Studio',
    action: 'email', email: 'test@example.test', place: 'Pune',
  }, { sessionId: `test-${first.userId}`, ownerId: first.userId, origin: base })
  const context = await browser.newContext()
  const page = await context.newPage()
  stage = 'sign-in-first-account'
  await first.signIn(page, base)
  stage = 'render-owned-website'
  await page.goto(`${base}/dashboard`)
  await page.getByText('Dashboard Test Studio', { exact: true }).waitFor({ timeout: 20000 })
  let response = await page.request.get(`${base}/api/dashboard/sites`)
  assert.equal(response.status(), 200)
  assert.equal((await response.json()).sites[0].slug, site.slug)
  await mkdir('generated-artifacts', { recursive: true })
  await page.screenshot({ path: 'generated-artifacts/dashboard-desktop.jpg' })
  stage = 'mobile-layout'
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'mobile dashboard must not overflow')
  await page.screenshot({ path: 'generated-artifacts/dashboard-mobile.jpg' })
  await page.getByRole('button', { name: 'Start a new website', exact: true }).click()
  await page.waitForURL(`${base}/build`)
  await page.getByRole('button', { name: 'Start text chat', exact: true }).waitFor()
  await context.close()
  const otherContext = await browser.newContext()
  const otherPage = await otherContext.newPage()
  stage = 'sign-in-second-account'
  await second.signIn(otherPage, base)
  stage = 'verify-account-isolation-and-sign-out'
  await otherPage.goto(`${base}/dashboard`)
  response = await otherPage.request.get(`${base}/api/dashboard/sites`, { headers: { 'x-user-id': first.userId } })
  assert.equal(response.status(), 200)
  assert.equal((await response.json()).count, 0, 'another user cannot see the first user’s website')
  await otherPage.getByRole('button', { name: 'Sign out', exact: true }).click()
  await otherPage.waitForURL(`${base}/`)
  response = await otherPage.request.get(`${base}/api/dashboard/sites`)
  assert.equal(response.status(), 401)
  response = await otherPage.request.get(`${base}/s/${site.slug}`)
  assert.equal(response.status(), 200, 'published pages remain public')
  console.log('PASS: real email-account sessions render the dashboard, isolate two users, work on mobile, and sign out correctly. No AI usage.')
} catch (err) {
  console.error('Dashboard smoke test failed:', stage, err.code || err.name || 'unknown error', err.status || '', err.errors?.map(item => item.code) || [])
  process.exitCode = 1
} finally {
  await browser?.close()
  for (const account of accounts.reverse()) {
    await account.cleanup().catch(() => console.error('Disposable test-account cleanup failed.'))
  }
}
