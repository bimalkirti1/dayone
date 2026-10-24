import { usageLimits } from './store.mjs'
import config from './config.mjs'

// A single Node service serializes reservations before making provider calls.
// This survives normal process restarts while DATA_DIR remains available.
let queue = Promise.resolve()
export function reserveAgentSession() {
  const reserve = async () => {
    const now = Date.now()
    const hour = Math.floor(now / 3600000)
    const day = Math.floor(now / 86400000)
    const stored = await usageLimits.get('elevenlabs-browser') || {}
    const hourly = stored.hour === hour ? stored.hourly : 0
    const daily = stored.day === day ? stored.daily : 0
    if (hourly >= config.agentBudget.hourly || daily >= config.agentBudget.daily) return false
    // Fail closed: failures still consume a reservation, never refund it.
    await usageLimits.put('elevenlabs-browser', { hour, day, hourly: hourly + 1, daily: daily + 1 })
    return true
  }
  const pending = queue.then(reserve, reserve)
  queue = pending.then(() => undefined, () => undefined)
  return pending
}
