import { sites } from './store.mjs'
import { json } from './http.mjs'

export async function handleDashboard(req, res, path, origin) {
  if (!path.startsWith('/api/dashboard/')) return false
  const userId = req.dayoneUserId
  if (!userId) {
    json(res, 401, { error: 'Sign in to access your dashboard.' })
    return true
  }
  if (path === '/api/dashboard/sites' && req.method === 'GET') {
    const owned = (await sites.list()).filter(site => site.ownerId === userId)
    json(res, 200, {
      count: owned.length,
      sites: owned.map(site => ({
        slug: site.slug,
        name: site.brief?.businessName || 'Untitled website',
        url: `${origin}/s/${site.slug}`,
        direction: site.meta?.directionName || '',
        createdAt: site.createdAt,
        updatedAt: site.updatedAt,
      })),
    })
  } else {
    json(res, 404, { error: 'Not found' })
  }
  return true
}
