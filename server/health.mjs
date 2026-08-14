import {
  CONTENT_COLLECTIONS,
  hasContactCreatePermission,
  permissionAccess,
  resolveRuntimeTokens,
} from './runtime-permissions.mjs'

export async function contactStorageStatus(env = process.env) {
  const { contentToken, contactToken } = resolveRuntimeTokens(env)
  if (!env.DIRECTUS_URL || !contentToken || !contactToken) return 'missing'

  try {
    const directusUrl = env.DIRECTUS_URL.replace(/\/+$/, '')
    const ping = await fetch(`${directusUrl}/server/ping`, {
      signal: globalThis.AbortSignal.timeout(1500),
    })
    const body = await ping.text()
    if (!ping.ok || !body.includes('pong')) return 'unreachable'

    const contentHeaders = { Authorization: `Bearer ${contentToken}` }
    const contactHeaders = { Authorization: `Bearer ${contactToken}` }
    const [contentPermissionsResponse, contactPermissionsResponse] = await Promise.all([
      fetch(`${directusUrl}/permissions/me`, {
        headers: contentHeaders,
        signal: globalThis.AbortSignal.timeout(1500),
      }),
      fetch(`${directusUrl}/permissions/me`, {
        headers: contactHeaders,
        signal: globalThis.AbortSignal.timeout(1500),
      }),
    ])

    if (!contentPermissionsResponse.ok || !contactPermissionsResponse.ok) {
      return 'incomplete'
    }

    const contentPermissions = await contentPermissionsResponse.json()
    const contactPermissions = await contactPermissionsResponse.json()
    const canReadAllContent = CONTENT_COLLECTIONS.every(
      (collection) => permissionAccess(contentPermissions, collection, 'read') === 'partial'
    )
    return canReadAllContent && hasContactCreatePermission(contactPermissions) ? 'ok' : 'incomplete'
  } catch {
    return 'unreachable'
  }
}

export async function healthHandler(_req, res) {
  const contactStorage = await contactStorageStatus()
  const healthy = contactStorage === 'ok'
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    dependencies: { contactStorage },
  })
}
