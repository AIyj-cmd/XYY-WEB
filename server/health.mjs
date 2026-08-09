export async function contactStorageStatus(env = process.env) {
  if (!env.DIRECTUS_URL || !env.DIRECTUS_TOKEN) return 'missing'

  try {
    const directusUrl = env.DIRECTUS_URL.replace(/\/+$/, '')
    const response = await fetch(`${directusUrl}/server/ping`, {
      signal: globalThis.AbortSignal.timeout(1500),
    })
    const body = await response.text()
    return response.ok && body.includes('pong') ? 'ok' : 'unreachable'
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
