import { getDirectusApiUrl, getDirectusContentToken, requestItems } from './directus-client'
import type { DirectusCollection } from './directus-types'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const REFERENCE_CACHE_MS = 5_000
const references = [
  ['cases', 'image_file'],
  ['news', 'cover_image'],
  ['publications', 'cover_file'],
  ['publications', 'pdf_file'],
  ['service_pages', 'hero_image'],
  ['about_history', 'image_file'],
  ['about_honors', 'image_file'],
] as const satisfies readonly (readonly [DirectusCollection, string])[]

let cache: { expiresAt: number; ids: Set<string> } | null = null

function relationId(value: unknown) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: unknown }).id)
  }
  return ''
}

async function readPublishedAssetIds() {
  const rows = await Promise.all(
    references.map(async ([collection, field]) => {
      const filter: Record<string, unknown> = { status: { _eq: 'published' } }
      if (collection === 'news') {
        filter.published_at = { _nnull: true, _lte: '$NOW' }
      }
      return requestItems<Record<string, unknown>[]>(collection, {
        filter,
        fields: [field],
        limit: -1,
      })
    })
  )
  return new Set(
    rows.flatMap((items, index) =>
      items.map((item) => relationId(item[references[index][1]])).filter(Boolean)
    )
  )
}

export function __resetDirectusAssetCacheForTests() {
  cache = null
}

export function isDirectusFileId(value: string) {
  return UUID_PATTERN.test(value)
}

export async function isPublishedDirectusAsset(fileId: string) {
  if (!isDirectusFileId(fileId)) return false
  if (cache && cache.expiresAt > Date.now() && cache.ids.has(fileId)) return true
  const ids = await readPublishedAssetIds()
  cache = { expiresAt: Date.now() + REFERENCE_CACHE_MS, ids }
  return ids.has(fileId)
}

const forwardedRequestHeaders = ['range', 'if-none-match', 'if-modified-since']
const forwardedResponseHeaders = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
  'content-disposition',
]

export async function fetchPublishedDirectusAsset(
  fileId: string,
  requestHeaders: Headers,
  fetchImpl: typeof fetch = fetch
) {
  if (!(await isPublishedDirectusAsset(fileId))) return new Response(null, { status: 404 })
  const token = getDirectusContentToken()
  if (!token) return new Response(null, { status: 503 })

  const headers = new Headers({ Authorization: `Bearer ${token}` })
  for (const name of forwardedRequestHeaders) {
    const value = requestHeaders.get(name)
    if (value) headers.set(name, value)
  }
  let upstream: Response
  try {
    upstream = await fetchImpl(`${getDirectusApiUrl()}/assets/${encodeURIComponent(fileId)}`, {
      headers,
    })
  } catch {
    return new Response(null, { status: 503 })
  }
  if (!upstream.ok && upstream.status !== 304) {
    return new Response(null, { status: upstream.status === 404 ? 404 : 502 })
  }
  const responseHeaders = new Headers({ 'Cache-Control': 'public, max-age=300' })
  for (const name of forwardedResponseHeaders) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}
