/** Tiny HTTP helpers: routing, body parsing and responses. No framework. */
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

export const json = (res, status, body, headers = {}) => {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
    ...headers,
  })
  res.end(payload)
}

export const html = (res, status, body, headers = {}) => {
  res.writeHead(status, {
    'content-type': 'text/html; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    ...headers,
  })
  res.end(body)
}

export const text = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(body)
}

/** Read a JSON body, with a ceiling so a bad client cannot fill memory. */
export async function readJson(req, limit = 256 * 1024) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) {
      const err = new Error('Body too large')
      err.status = 413
      throw err
    }
    chunks.push(chunk)
  }
  if (!size) return {}
  const raw = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(raw)
  } catch {
    const err = new Error('Body is not valid JSON')
    err.status = 400
    throw err
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

/** Serve a file from a root directory, refusing anything outside it. */
export async function serveStatic(res, root, urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '')
  const target = join(root, clean)
  if (!target.startsWith(normalize(root))) return false
  try {
    const info = await stat(target)
    if (!info.isFile()) return false
    const body = await readFile(target)
    const type = MIME[extname(target).toLowerCase()] || 'application/octet-stream'
    const immutable = /\.[0-9a-f]{8,}\./i.test(target)
    res.writeHead(200, {
      'content-type': type,
      'content-length': body.length,
      'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
    })
    res.end(body)
    return true
  } catch {
    return false
  }
}

/** A pattern like '/s/:slug' matched against a path. */
export function match(pattern, path) {
  const p = pattern.split('/').filter(Boolean)
  const u = path.split('/').filter(Boolean)
  if (p.length !== u.length) return null
  const params = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(u[i])
    else if (p[i] !== u[i]) return null
  }
  return params
}

export default { json, html, text, readJson, serveStatic, match }
