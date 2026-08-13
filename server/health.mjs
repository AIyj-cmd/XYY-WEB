const requiredCmsCollections = [
  'homepage_stats',
  'homepage_content',
  'faq_pages',
  'services',
  'warehouses',
  'cases',
  'news',
  'faqs',
  'case_details',
  'case_stats',
  'publications',
  'service_pages',
  'service_stats',
  'service_features',
  'about_content',
  'about_history',
  'about_honors',
  'site_settings',
  'contact_leads',
]

export async function contactStorageStatus(env = process.env) {
  if (!env.DIRECTUS_URL || !env.DIRECTUS_TOKEN) return 'missing'

  try {
    const directusUrl = env.DIRECTUS_URL.replace(/\/+$/, '')
    const ping = await fetch(`${directusUrl}/server/ping`, {
      signal: globalThis.AbortSignal.timeout(1500),
    })
    const body = await ping.text()
    if (!ping.ok || !body.includes('pong')) return 'unreachable'

    const headers = { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` }
    const checks = await Promise.all(
      requiredCmsCollections.map((collection) =>
        fetch(`${directusUrl}/items/${collection}?limit=1&fields=id`, {
          headers,
          signal: globalThis.AbortSignal.timeout(1500),
        })
      )
    )
    return checks.every((response) => response.ok) ? 'ok' : 'incomplete'
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
