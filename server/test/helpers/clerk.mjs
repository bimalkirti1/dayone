import { randomUUID } from 'node:crypto'
import { createClerkClient } from '@clerk/express'
import { sites, sessions } from '../../src/store.mjs'

export async function createTestAccount() {
  if (!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_')) {
    throw new Error('Account smoke tests require Clerk development keys.')
  }
  const client = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })
  const user = await client.users.createUser({
    emailAddress: [`dayone-${randomUUID()}+clerk_test@example.com`],
    firstName: 'Test', lastName: 'Owner', skipPasswordRequirement: true,
  })
  return {
    userId: user.id,
    async signIn(page, base) {
      const ticket = await client.signInTokens.createSignInToken({ userId: user.id, expiresInSeconds: 120 })
      await page.goto(`${base}/sign-in`)
      await page.waitForFunction(() => window.Clerk?.loaded, { timeout: 30000 })
      return page.evaluate(async token => {
        const result = await window.Clerk.client.signIn.create({ strategy: 'ticket', ticket: token })
        await window.Clerk.setActive({ session: result.createdSessionId })
        return result.status
      }, ticket.token)
    },
    async cleanup() {
      for (const site of await sites.list()) if (site.ownerId === user.id) await sites.del(site.slug)
      for (const session of await sessions.list()) if (session.ownerId === user.id) await sessions.del(session.id)
      await client.users.deleteUser(user.id)
    },
  }
}
