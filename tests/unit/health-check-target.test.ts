import { afterEach, describe, expect, it, vi } from 'vitest'

import { runHealthChecks } from '../../scripts/health-check.mjs'
import { CMS_SCHEMA_VERSION } from '../../config/cms-contract.mjs'
import { LOOPBACK_SITE, RETIRED_ORIGIN, responseFor } from './helpers/remote-target-fixtures'

const identity = {
  schemaVersion: 1,
  gitSha: 'a'.repeat(40),
  gitShortSha: 'aaaaaaa',
  releaseId: '20261016T000000Z-aaaaaaa',
  buildTime: '2026-10-16T00:00:00.000Z',
  environment: 'ci',
  cmsSchemaVersion: CMS_SCHEMA_VERSION,
}

function healthFetch() {
  return vi.fn(async (input: string, init?: RequestInit) => {
    void init
    const path = new URL(input).pathname
    if (path === '/') {
      return new Response(
        '<html><head><link rel="canonical" href="https://56xyy.com/"></head><body>新亦源</body></html>',
        { headers: { 'content-type': 'text/html; charset=utf-8' } }
      )
    }
    if (path === '/healthz') {
      return new Response(
        JSON.stringify({ status: 'ok', dependencies: { cmsContent: 'ok', contactStorage: 'ok' } }),
        {
          headers: { 'content-type': 'application/json' },
        }
      )
    }
    if (path === '/cms/server/ping') return responseFor('pong')
    if (path === '/robots.txt')
      return new Response('User-agent: *\n', { headers: { 'content-type': 'text/plain' } })
    if (path === '/sitemap.xml')
      return new Response('<urlset><loc>https://56xyy.com/</loc></urlset>', {
        headers: { 'content-type': 'application/xml' },
      })
    if (path === '/llms.txt')
      return new Response('# 新亦源供应链', { headers: { 'content-type': 'text/plain' } })
    if (path === '/version')
      return new Response(JSON.stringify(identity), {
        headers: { 'content-type': 'application/json' },
      })
    throw new Error(`unexpected path ${path}`)
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('health-check target boundary', () => {
  it('runs all health and SEO checks against loopback while preserving formal canonical metadata', async () => {
    const fetchMock = healthFetch()
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      runHealthChecks({
        SITE_URL: LOOPBACK_SITE,
        PUBLIC_SITE_URL: 'https://56xyy.com',
        EXPECTED_GIT_SHA: identity.gitSha,
        EXPECTED_RELEASE_ID: identity.releaseId,
        EXPECTED_ENVIRONMENT: identity.environment,
        EXPECTED_CMS_SCHEMA_VERSION: identity.cmsSchemaVersion,
      })
    ).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(7)
    expect(fetchMock.mock.calls.every(([url]) => String(url).startsWith(LOOPBACK_SITE))).toBe(true)
    expect(fetchMock.mock.calls.every(([, init]) => init?.redirect === 'manual')).toBe(true)
  })

  it('accepts the exact ECS request origin while keeping the formal canonical origin mocked', async () => {
    const fetchMock = healthFetch()
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      runHealthChecks({
        SITE_URL: 'https://8.138.148.179',
        PUBLIC_SITE_URL: 'https://56xyy.com',
      })
    ).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(7)
    expect(
      fetchMock.mock.calls.every(([url]) => String(url).startsWith('https://8.138.148.179'))
    ).toBe(true)
  })

  it.each([
    ['canonical', '/', '<html><body>新亦源</body></html>'],
    [
      'noindex',
      '/',
      '<html><head><meta name="robots" content="noindex"></head><body>新亦源<link rel="canonical" href="https://56xyy.com/"></body></html>',
    ],
    ['robots', '/robots.txt', 'User-agent: *\nDisallow: /\n'],
    ['sitemap', '/sitemap.xml', '<urlset><loc>https://unknown.example/</loc></urlset>'],
  ])(
    'fails formal SEO assertion for a bad %s response while staying on loopback',
    async (_name, badPath, body) => {
      const base = healthFetch()
      const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
        if (new URL(input).pathname === badPath) {
          const contentType =
            badPath === '/robots.txt'
              ? 'text/plain'
              : badPath === '/sitemap.xml'
                ? 'application/xml'
                : 'text/html'
          return new Response(body, { headers: { 'content-type': contentType } })
        }
        return base(input, init)
      })
      vi.stubGlobal('fetch', fetchMock)
      await expect(
        runHealthChecks({ SITE_URL: LOOPBACK_SITE, PUBLIC_SITE_URL: 'https://56xyy.com' })
      ).rejects.toThrow('health checks failed')
      expect(fetchMock.mock.calls.every(([url]) => String(url).startsWith(LOOPBACK_SITE))).toBe(
        true
      )
    }
  )

  it('requires an operation URL and rejects retired canonical/operation targets before fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(runHealthChecks({ PUBLIC_SITE_URL: 'https://56xyy.com' })).rejects.toThrow(
      'healthcheck_site_url_required'
    )
    await expect(runHealthChecks({ SITE_URL: RETIRED_ORIGIN })).rejects.toThrow(
      /healthcheck_target_unapproved/
    )
    await expect(
      runHealthChecks({ SITE_URL: LOOPBACK_SITE, PUBLIC_SITE_URL: RETIRED_ORIGIN })
    ).rejects.toThrow(/public_site_origin_unapproved/)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each(['https://wz.tomatopia.top', 'https://56xyy.com', 'https://8.138.148.180'])(
    'rejects %s before checkReleaseVersion fetch',
    async (target) => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)
      const { checkReleaseVersion } = await import('../../scripts/health-check.mjs')
      await expect(checkReleaseVersion(target)).rejects.toThrow(/healthcheck_target_unapproved/)
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )
})
