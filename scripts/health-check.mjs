import { resolve } from 'node:path'
import { URL, fileURLToPath } from 'node:url'

import { validateReleaseIdentity } from '../config/release-contract.mjs'
import { assertWebHealthPayload } from './lib/health-contract.mjs'
import { isRootDisallowedForUserAgent } from './lib/robots-policy.mjs'
import {
  assertCanonicalTarget,
  assertOperationTarget,
  FORMAL_SITE_ORIGIN,
} from './lib/remote-target-policy.mjs'

const identityExpectationKeys = ['gitSha', 'releaseId', 'environment', 'cmsSchemaVersion']

export async function checkReleaseVersion(baseUrl, expected = {}) {
  const target = assertOperationTarget(baseUrl, 'healthcheck_target')
  const response = await fetch(`${target}/version`, { redirect: 'manual' })
  if (!response.ok) throw new Error(`version endpoint returned HTTP ${response.status}`)
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('version endpoint returned an unexpected content-type')
  }
  const identity = validateReleaseIdentity(await response.json())
  const supplied = identityExpectationKeys.filter((key) => expected[key] !== undefined)
  for (const key of supplied) {
    if (identity[key] !== expected[key]) {
      throw new Error(`release identity mismatch: ${key}`)
    }
  }
  return { identity, verified: supplied.length > 0 }
}

function expectedIdentity(env) {
  return {
    gitSha: env.EXPECTED_GIT_SHA,
    releaseId: env.EXPECTED_RELEASE_ID,
    environment: env.EXPECTED_ENVIRONMENT,
    cmsSchemaVersion: env.EXPECTED_CMS_SCHEMA_VERSION,
  }
}

export async function runHealthChecks(env = process.env) {
  if (!env.SITE_URL) throw new Error('healthcheck_site_url_required')
  const baseUrl = assertOperationTarget(env.SITE_URL, 'healthcheck_target')
  const canonicalOrigin = assertCanonicalTarget(
    env.PUBLIC_SITE_URL || baseUrl,
    'public_site_origin'
  )
  const isFormalDomain = new URL(canonicalOrigin).origin === FORMAL_SITE_ORIGIN
  const checks = [
    { name: 'site', url: `${baseUrl}/`, type: 'html', contentType: 'text/html' },
    {
      name: 'web health',
      url: `${baseUrl}/healthz`,
      type: 'json',
      contentType: 'application/json',
    },
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (check.contentType && !response.headers.get('content-type')?.includes(check.contentType)) {
        throw new Error(
          `unexpected content-type: ${response.headers.get('content-type') || 'missing'}`
        )
      }
      if (check.type === 'json') assertWebHealthPayload(JSON.parse(body))
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

  try {
    const result = await checkReleaseVersion(baseUrl, expectedIdentity(env))
    console.log(
      `ok version ${baseUrl}/version ${result.verified ? 'target identity verified' : 'basic identity only'}`
    )
  } catch (error) {
    failed = true
    console.error(
      `fail version ${baseUrl}/version: ${error instanceof Error ? error.message : error}`
    )
  }
  if (failed) throw new Error('health checks failed')
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isCli) {
  runHealthChecks().catch((error) => {
    console.error(error instanceof Error ? error.message : 'healthcheck_failed')
    process.exitCode = 1
  })
}
