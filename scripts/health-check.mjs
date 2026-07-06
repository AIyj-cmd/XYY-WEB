const baseUrl = (
  process.env.SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  'https://wz.tomatopia.top'
).replace(/\/+$/, '')

const checks = [
  { name: 'site', url: `${baseUrl}/`, type: 'html' },
  { name: 'web health', url: `${baseUrl}/healthz`, type: 'json' },
  { name: 'directus ping', url: `${baseUrl}/cms/server/ping`, type: 'text', expected: 'pong' },
]

let failed = false

for (const check of checks) {
  try {
    const response = await fetch(check.url, { redirect: 'manual' })
    const body = await response.text()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    if (check.type === 'json') {
      const json = JSON.parse(body)
      if (json.status !== 'ok') {
        throw new Error(`unexpected status: ${JSON.stringify(json)}`)
      }
    }

    if (check.type === 'text' && body.trim() !== check.expected) {
      throw new Error(`unexpected body: ${body.slice(0, 80)}`)
    }

    if (check.type === 'html' && !body.includes('新亦源')) {
      throw new Error('homepage marker not found')
    }

    console.log(`ok ${check.name} ${check.url}`)
  } catch (error) {
    failed = true
    console.error(
      `fail ${check.name} ${check.url}: ${error instanceof Error ? error.message : error}`
    )
  }
}

if (failed) {
  process.exit(1)
}
