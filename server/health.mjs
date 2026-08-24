import { CONTENT_COLLECTIONS, hasContentReadPermission } from './runtime-permissions.mjs'

export async function cmsContentStatus(env = process.env) {
  const contentToken = env.DIRECTUS_CONTENT_TOKEN || ''
  if (!env.DIRECTUS_URL || !contentToken) return 'missing'

  try {
    const directusUrl = env.DIRECTUS_URL.replace(/\/+$/, '')
    const ping = await fetch(`${directusUrl}/server/ping`, {
      signal: globalThis.AbortSignal.timeout(1500),
    })
    const body = await ping.text()
    if (!ping.ok || !body.includes('pong')) return 'unreachable'

    const contentPermissionsResponse = await fetch(`${directusUrl}/permissions/me`, {
      headers: { Authorization: `Bearer ${contentToken}` },
      signal: globalThis.AbortSignal.timeout(1500),
    })

    if (!contentPermissionsResponse.ok) {
      return 'incomplete'
    }

    const contentPermissions = await contentPermissionsResponse.json()
    const canReadAllContent = CONTENT_COLLECTIONS.every((collection) =>
      hasContentReadPermission(contentPermissions, collection)
    )
    return canReadAllContent ? 'ok' : 'incomplete'
  } catch {
    return 'unreachable'
  }
}

function xiansuoHealthUrl(env) {
  const token = env.XIANSUO_INGEST_TOKEN?.trim()
  if (!env.XIANSUO_API_URL || !token || new globalThis.TextEncoder().encode(token).byteLength < 32)
    return null
  try {
    const url = new globalThis.URL(env.XIANSUO_API_URL)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash)
      return null
    return `${url.toString().replace(/\/+$/, '')}/api/integrations/website-leads/health`
  } catch {
    return null
  }
}

export async function contactStorageStatus(env = process.env) {
  const url = xiansuoHealthUrl(env)
  if (!url) return 'missing'
  const token = env.XIANSUO_INGEST_TOKEN.trim()
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: globalThis.AbortSignal.timeout(1500),
    })
    if (!response.ok) return 'unreachable'
    const payload = await response.json()
    return payload?.code === 0 && payload?.data?.status === 'ok' ? 'ok' : 'incomplete'
  } catch {
    return 'unreachable'
  }
}

export async function healthHandler(_req, res) {
  const [cmsContent, contactStorage] = await Promise.all([
    cmsContentStatus(),
    contactStorageStatus(),
  ])
  const healthy = cmsContent === 'ok' && contactStorage === 'ok'
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    dependencies: { cmsContent, contactStorage },
  })
}
