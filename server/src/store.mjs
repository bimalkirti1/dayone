/**
 * A small JSON-file store. No database driver, so nothing to install and
 * nothing to misconfigure. Each record is one file, which makes a published
 * site trivially inspectable and easy to back up.
 */
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import config from './config.mjs'

const dir = (...p) => join(config.dataDir, ...p)

async function ensure(sub) {
  const d = dir(sub)
  await mkdir(d, { recursive: true })
  return d
}

const safe = (id) => String(id).replace(/[^a-zA-Z0-9._-]/g, '')

async function put(sub, id, value) {
  await ensure(sub)
  const tmp = dir(sub, `.${safe(id)}.tmp`)
  const target = dir(sub, `${safe(id)}.json`)
  // Write then rename so a reader never sees a half-written file.
  await writeFile(tmp, JSON.stringify(value, null, 2), 'utf8')
  const { rename } = await import('node:fs/promises')
  await rename(tmp, target)
  return value
}

async function get(sub, id) {
  try {
    return JSON.parse(await readFile(dir(sub, `${safe(id)}.json`), 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

async function list(sub) {
  await ensure(sub)
  const names = (await readdir(dir(sub))).filter((n) => n.endsWith('.json'))
  const out = []
  for (const n of names) {
    const rec = await get(sub, n.replace(/\.json$/, ''))
    if (rec) out.push(rec)
  }
  return out.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
}

async function del(sub, id) {
  await rm(dir(sub, `${safe(id)}.json`), { force: true })
}

export const sessions = {
  get: (id) => get('sessions', id),
  put: (id, v) => put('sessions', id, v),
  list: () => list('sessions'),
  del: (id) => del('sessions', id),
}

export const sites = {
  get: (slug) => get('sites', slug),
  put: (slug, v) => put('sites', slug, v),
  list: () => list('sites'),
  del: (slug) => del('sites', slug),
}

/** Delivery attempts, so you can see what was texted and to whom. */
export const deliveries = {
  put: (id, v) => put('deliveries', id, v),
  list: () => list('deliveries'),
}

/** Private provider budgets: never exposed as sessions or site records. */
export const usageLimits = {
  get: (id) => get('usage-limits', id),
  put: (id, value) => put('usage-limits', id, value),
}

export async function initStore() {
  await Promise.all([ensure('sessions'), ensure('sites'), ensure('deliveries')])
  return config.dataDir
}

export default { sessions, sites, deliveries, initStore }
