/**
 * Getting the link onto the caller's phone.
 *
 * Three adapters behind one call. 'log' records the message without sending
 * it, which is what tests and local runs use, so nothing is ever sent by
 * accident while you are developing.
 */
import config from './config.mjs'
import { deliveries } from './store.mjs'
import { randomUUID } from 'node:crypto'

const timeout = (ms) => {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), ms)
  return { signal: c.signal, done: () => clearTimeout(t) }
}

export function linkMessage({ name, url }) {
  const who = name ? `${name} is live.` : 'Your website is live.'
  return `${who} Here it is: ${url}\n\nOpen it, send it to anyone, and call back any time to change it. — DayOne`
}

async function sendVobiz({ to, body, idempotencyKey }) {
  const { authId, authToken, baseUrl, senderId } = config.sms.vobiz
  if (!authId || !authToken) throw new Error('VOBIZ_AUTH_ID and VOBIZ_AUTH_TOKEN are not set')
  if (!senderId) throw new Error('VOBIZ_SENDER_ID is not set')
  const t = timeout(12000)
  try {
    const res = await fetch(`${baseUrl}/api/v1/sms/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Auth-ID': authId,
        'X-Auth-Token': authToken,
      },
      body: JSON.stringify({
        from: senderId,
        to: [to],
        channel: 'sms',
        text: body,
        idempotencyKey,
      }),
      signal: t.signal,
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Vobiz ${res.status}: ${text.slice(0, 300)}`)
    return { id: safeId(text), raw: text.slice(0, 500) }
  } finally {
    t.done()
  }
}

async function sendTwilio({ to, body }) {
  const { accountSid, authToken, from } = config.sms.twilio
  if (!accountSid || !authToken) throw new Error('Twilio credentials are not set')
  const t = timeout(12000)
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
      signal: t.signal,
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Twilio ${res.status}: ${text.slice(0, 300)}`)
    return { id: safeId(text), raw: text.slice(0, 500) }
  } finally {
    t.done()
  }
}

function safeId(text) {
  try {
    const j = JSON.parse(text)
    return j.sid || j.id || j.messageId || ''
  } catch {
    return ''
  }
}

/** Send, record the attempt either way, and never throw into a live call. */
export async function sendLink({ to, name, url }) {
  const body = linkMessage({ name, url })
  const record = {
    id: randomUUID(),
    to,
    url,
    provider: config.sms.provider,
    body,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }

  try {
    if (!to) throw new Error('No phone number on the brief')
    if (config.sms.provider === 'vobiz')
      Object.assign(record, await sendVobiz({ to, body, idempotencyKey: record.id }), { status: 'sent' })
    else if (config.sms.provider === 'twilio') Object.assign(record, await sendTwilio({ to, body }), { status: 'sent' })
    else record.status = 'logged'
  } catch (err) {
    record.status = 'failed'
    record.error = String(err.message || err).slice(0, 300)
  }

  await deliveries.put(record.id, record)
  return record
}

export default { sendLink, linkMessage }
