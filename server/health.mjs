import {
  CONTENT_COLLECTIONS,
  hasContactCreatePermission,
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
    const [checks, contactPermissionsResponse] = await Promise.all([
      Promise.all(
        CONTENT_COLLECTIONS.map((collection) =>
          fetch(`${directusUrl}/items/${collection}?limit=1&fields=id`, {
            headers: contentHeaders,
            signal: globalThis.AbortSignal.timeout(1500),
          })
        )
      ),
      fetch(`${directusUrl}/permissions/me`, {
        headers: contactHeaders,
        signal: globalThis.AbortSignal.timeout(1500),
      }),
    ])

    if (!checks.every((response) => response.ok) || !contactPermissionsResponse.ok) {
      return 'incomplete'
    }

    const contactPermissions = await contactPermissionsResponse.json()
    return hasContactCreatePermission(contactPermissions) ? 'ok' : 'incomplete'
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
