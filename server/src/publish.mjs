/** Turn a brief into a live page at a stable URL. */
import { generateSite } from './gen/index.mjs'
import { polish } from './llm.mjs'
import { sites } from './store.mjs'
import { normaliseBrief } from './brief.mjs'
import { buildCopy } from './gen/copy.mjs'
import config from './config.mjs'

const RESERVED = new Set(['api', 's', 'admin', 'health', 'static', 'assets', 'console', 'new', 'dayone'])

/** Keep slugs unique without ever overwriting somebody else's page. */
async function claimSlug(wanted, sessionId, ownerId) {
  let slug = RESERVED.has(wanted) ? `${wanted}-site` : wanted
  const existing = await sites.get(slug)
  const mayReuse = record => record.sessionId === sessionId && (!record.ownerId || record.ownerId === ownerId)
  if (!existing || mayReuse(existing)) return slug
  for (let n = 2; n < 60; n++) {
    const candidate = `${slug}-${n}`
    const taken = await sites.get(candidate)
    if (!taken || mayReuse(taken)) return candidate
  }
  return `${slug}-${Date.now().toString(36)}`
}

export function publicOrigin(req) {
  if (config.publicUrl) return config.publicUrl
  const proto = req?.headers['x-forwarded-proto']?.split(',')[0] || 'http'
  const host = req?.headers['x-forwarded-host'] || req?.headers.host || `localhost:${config.port}`
  return `${proto}://${host}`
}

export async function publishBrief(rawBrief, { sessionId = '', origin = '', ownerId = null } = {}) {
  const brief = normaliseBrief(rawBrief)
  brief.slug = await claimSlug(brief.slug, sessionId, ownerId)

  // Copy polish is best-effort and never blocks a publish.
  let copyOverride = null
  if (config.llmReady) {
    const result = await polish({ brief, copy: buildCopy(brief) })
    if (result.used) copyOverride = result.copy
  }
  if (copyOverride) {
    brief.headlineOverride = copyOverride.headline
    brief.subheadOverride = copyOverride.subhead
  }

  const { html, meta } = generateSite(brief, { origin })

  const record = {
    slug: brief.slug,
    sessionId,
    ownerId,
    brief,
    html,
    meta,
    url: origin ? `${origin}/s/${brief.slug}` : `/s/${brief.slug}`,
    createdAt: (await sites.get(brief.slug))?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await sites.put(brief.slug, record)
  return record
}

export default { publishBrief, publicOrigin }
