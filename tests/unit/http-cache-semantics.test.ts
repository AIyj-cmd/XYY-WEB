import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const CachePolicy = require('http-cache-semantics')

const url = 'https://cache.test/image.png'
const baseRequest = { method: 'GET', url, headers: { host: 'cache.test' } }

function expiredPolicy(
  responseHeaders: Record<string, string>,
  requestHeaders: Record<string, string> = {},
  options: Record<string, unknown> = {}
) {
  const policy = new CachePolicy(
    { ...baseRequest, headers: { ...baseRequest.headers, ...requestHeaders } },
    {
      status: 200,
      headers: {
        date: new Date().toUTCString(),
        'cache-control': 'max-age=1, stale-while-revalidate=120, stale-if-error=120',
        ...responseHeaders,
      },
    },
    options
  )
  policy.now = () => policy._responseTime + 2_000
  return policy
}

function staleRequest(cacheControl: string) {
  return {
    ...baseRequest,
    headers: { ...baseRequest.headers, 'cache-control': cacheControl },
  }
}

describe('shared http-cache-semantics safety patch', () => {
  const restrictedResponses = [
    ['Set-Cookie without public or immutable', { 'set-cookie': 'user=private' }, {}],
    [
      'proxy-revalidate',
      {
        'cache-control':
          'max-age=1, proxy-revalidate, stale-while-revalidate=120, stale-if-error=120',
      },
      {},
    ],
    [
      'no-cache',
      { 'cache-control': 'max-age=1, no-cache, stale-while-revalidate=120, stale-if-error=120' },
      {},
    ],
    [
      'no-store',
      { 'cache-control': 'max-age=1, no-store, stale-while-revalidate=120, stale-if-error=120' },
      {},
    ],
    [
      'private',
      { 'cache-control': 'max-age=1, private, stale-while-revalidate=120, stale-if-error=120' },
      {},
    ],
    ['Vary wildcard', { vary: 'Accept, *' }, {}],
    [
      'shared s-maxage',
      { 'cache-control': 's-maxage=1, stale-while-revalidate=120, stale-if-error=120' },
      {},
    ],
    [
      'authorized request',
      { 'cache-control': 'max-age=1, stale-while-revalidate=120, stale-if-error=120' },
      { authorization: 'Bearer synthetic' },
    ],
  ] as const

  it.each(restrictedResponses)(
    'gives restricted shared response a zero TTL: %s',
    (_name, headers, requestHeaders) => {
      const policy = expiredPolicy(headers, requestHeaders)

      expect(policy.timeToLive()).toBe(0)
    }
  )

  it.each(restrictedResponses)(
    'rejects numeric max-stale for restricted shared response: %s',
    (_name, headers, requestHeaders) => {
      const result = expiredPolicy(headers, requestHeaders).evaluateRequest(
        staleRequest('max-stale=300')
      )

      expect(result.response).toBeUndefined()
      expect(result.revalidation?.synchronous).toBe(true)
    }
  )

  it.each(restrictedResponses)(
    'rejects unlimited max-stale for restricted shared response: %s',
    (_name, headers, requestHeaders) => {
      const result = expiredPolicy(headers, requestHeaders).evaluateRequest(
        staleRequest('max-stale')
      )

      expect(result.response).toBeUndefined()
      expect(result.revalidation?.synchronous).toBe(true)
    }
  )

  it.each(restrictedResponses)(
    'does not extend restricted shared response with SWR or SIE: %s',
    (_name, headers, requestHeaders) => {
      const policy = expiredPolicy(headers, requestHeaders)

      expect(policy.useStaleWhileRevalidate()).toBe(false)
      expect(policy._useStaleIfError()).toBe(false)
      const failedRevalidation = policy.revalidatedPolicy(staleRequest('max-stale'), {
        status: 503,
        headers: {},
      })
      expect(failedRevalidation.policy).not.toBe(policy)
      expect(failedRevalidation.matches).toBe(false)
      expect(failedRevalidation.modified).toBe(true)
    }
  )

  it('preserves public shared caching and private-cache cookie behavior', () => {
    const shared = expiredPolicy(
      { 'cache-control': 'public, max-age=1, stale-while-revalidate=120, stale-if-error=120' },
      {}
    )
    const publicCookie = expiredPolicy(
      {
        'cache-control': 'public, max-age=1, stale-while-revalidate=120',
        'set-cookie': 'user=public',
      },
      {}
    )
    const immutableCookie = expiredPolicy(
      {
        'cache-control': 'max-age=1, immutable, stale-while-revalidate=120',
        'set-cookie': 'user=immutable',
      },
      {}
    )
    const authorizedPublic = expiredPolicy(
      { 'cache-control': 'public, max-age=1, stale-while-revalidate=120' },
      { authorization: 'Bearer synthetic' }
    )
    const privateCache = expiredPolicy({ 'set-cookie': 'user=private' }, {}, { shared: false })

    expect(shared.timeToLive()).toBeGreaterThan(100_000)
    expect(shared.evaluateRequest(staleRequest('max-stale=300')).response).toBeDefined()
    expect(publicCookie.timeToLive()).toBeGreaterThan(100_000)
    expect(publicCookie.evaluateRequest(staleRequest('max-stale')).response).toBeDefined()
    expect(immutableCookie.timeToLive()).toBeGreaterThan(100_000)
    expect(immutableCookie.evaluateRequest(staleRequest('max-stale')).response).toBeDefined()
    expect(authorizedPublic.timeToLive()).toBeGreaterThan(100_000)
    expect(authorizedPublic.evaluateRequest(staleRequest('max-stale')).response).toBeDefined()
    expect(privateCache.timeToLive()).toBeGreaterThan(100_000)
    expect(privateCache.evaluateRequest(staleRequest('max-stale')).response).toBeDefined()
  })

  it('keeps serializable public policies reusable', () => {
    const policy = expiredPolicy({ 'cache-control': 'public, max-age=60' })
    const restored = CachePolicy.fromObject(policy.toObject())
    restored.now = policy.now

    expect(restored.timeToLive()).toBeGreaterThan(50_000)
    expect(restored.evaluateRequest(baseRequest).response).toBeDefined()
  })

  it('only reuses a stale response after an error when the revalidation request still matches', () => {
    const policy = expiredPolicy({ 'cache-control': 'public, max-age=1, stale-if-error=120' })
    const error = { status: 503, headers: {} }

    expect(policy.revalidatedPolicy(baseRequest, error)).toMatchObject({
      policy,
      modified: false,
      matches: true,
    })
    expect(policy.revalidatedPolicy({ ...baseRequest, url: `${url}?other` }, error)).toMatchObject({
      modified: true,
      matches: false,
    })
    expect(policy.revalidatedPolicy(staleRequest('no-cache'), error)).toMatchObject({
      modified: true,
      matches: false,
    })
    expect(
      policy.revalidatedPolicy(
        { ...baseRequest, headers: { ...baseRequest.headers, pragma: 'no-cache' } },
        error
      )
    ).toMatchObject({ modified: true, matches: false })
  })
})
