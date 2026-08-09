import { isRootDisallowedForUserAgent } from './lib/robots-policy.mjs'
import { assertWebHealthPayload } from './lib/health-contract.mjs'

const baseUrl = (
  process.env.SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  'https://wz.tomatopia.top'
).replace(/\/+$/, '')
const isFormalDomain = new globalThis.URL(baseUrl).hostname === '56xyy.com'

const checks = [
  { name: 'site', url: `${baseUrl}/`, type: 'html', contentType: 'text/html' },
  { name: 'web health', url: `${baseUrl}/healthz`, type: 'json', contentType: 'application/json' },
  { name: 'directus ping', url: `${baseUrl}/cms/server/ping`, type: 'text', expected: 'pong' },
  {
    name: 'robots',
    url: `${baseUrl}/robots.txt`,
    type: 'contains',
    expected: 'User-agent:',
    contentType: 'text/plain',
  },
  {
    name: 'sitemap',
    url: `${baseUrl}/sitemap.xml`,
    type: 'contains',
    expected: '<urlset',
    contentType: 'application/xml',
  },
  {
    name: 'llms',
    url: `${baseUrl}/llms.txt`,
    type: 'contains',
    expected: '# 新亦源供应链',
    contentType: 'text/plain',
  },
]

let failed = false

for (const check of checks) {
  try {
    const response = await fetch(check.url, { redirect: 'manual' })
    const body = await response.text()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    if (check.contentType && !response.headers.get('content-type')?.includes(check.contentType)) {
      throw new Error(
        `unexpected content-type: ${response.headers.get('content-type') || 'missing'}`
      )
    }

    if (check.type === 'json') {
      const json = JSON.parse(body)
      assertWebHealthPayload(json)
    }

    if (check.type === 'text' && body.trim() !== check.expected) {
      throw new Error(`unexpected body: ${body.slice(0, 80)}`)
    }

    if (check.type === 'html' && !body.includes('新亦源')) {
      throw new Error('homepage marker not found')
    }

    if (check.type === 'html' && isFormalDomain) {
      if (/name=["']robots["'][^>]+noindex|noindex[^>]+name=["']robots["']/i.test(body)) {
        throw new Error('formal homepage must not contain a noindex meta tag')
      }
      if (!body.includes('<link rel="canonical" href="https://56xyy.com/"')) {
        throw new Error('formal homepage canonical is missing or incorrect')
      }
    }

    if (check.type === 'contains' && !body.includes(check.expected)) {
      throw new Error(`expected marker not found: ${check.expected}`)
    }

    if (
      check.type === 'html' &&
      isFormalDomain &&
      response.headers.get('x-robots-tag')?.toLowerCase().includes('noindex')
    ) {
      throw new Error('formal domain must not return X-Robots-Tag: noindex')
    }

    if (isFormalDomain && check.name === 'robots' && isRootDisallowedForUserAgent(body)) {
      throw new Error('formal robots.txt must not block the entire site')
    }

    if (isFormalDomain && check.name === 'sitemap' && !body.includes('<loc>https://56xyy.com/')) {
      throw new Error('formal sitemap must use the production origin')
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
