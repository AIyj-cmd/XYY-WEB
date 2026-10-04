import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const CachePolicy = require('http-cache-semantics')
const request = {
  method: 'GET',
  url: 'https://cache.test/image.png',
  headers: { host: 'cache.test' },
}

function expiredPolicy(vary: string, shared: boolean) {
  const policy = new CachePolicy(
    request,
    {
      status: 200,
      headers: {
        date: new Date().toUTCString(),
        vary,
        'cache-control': 'max-age=1, stale-while-revalidate=120, stale-if-error=120',
      },
    },
    { shared }
  )
  policy.now = () => policy._responseTime + 2_000
  return policy
}

function staleRequest() {
  return {
    ...request,
    headers: { ...request.headers, 'cache-control': 'max-stale=300' },
  }
}

describe('http-cache-semantics Vary wildcard safety patch', () => {
  it.each([
    ['shared exact', '*', true],
    ['shared padded', ' * ', true],
    ['shared list', 'Accept, * ', true],
    ['private exact', '*', false],
    ['private padded', ' * ', false],
    ['private list', 'Accept, * ', false],
  ])('blocks all reuse paths for %s wildcard', (_label, vary, shared) => {
    const policy = expiredPolicy(vary, shared)
    const result = policy.evaluateRequest(staleRequest())

    expect(policy.timeToLive()).toBe(0)
    expect(policy.useStaleWhileRevalidate()).toBe(false)
    expect(policy._useStaleIfError()).toBe(false)
    expect(result.response).toBeUndefined()
    expect(result.revalidation?.synchronous).toBe(true)
  })

  it('preserves private cookie and ordinary Vary behavior', () => {
    const privateCookie = new CachePolicy(
      request,
      {
        status: 200,
        headers: {
          date: new Date().toUTCString(),
          'cache-control': 'max-age=60',
          'set-cookie': 'user=private',
        },
      },
      { shared: false }
    )
    const ordinaryVary = new CachePolicy(
      { ...request, headers: { ...request.headers, accept: 'image/png' } },
      {
        status: 200,
        headers: { date: new Date().toUTCString(), vary: 'accept', 'cache-control': 'max-age=60' },
      }
    )

    expect(privateCookie.timeToLive()).toBeGreaterThan(50_000)
    expect(ordinaryVary.timeToLive()).toBeGreaterThan(50_000)
    expect(
      ordinaryVary.evaluateRequest({
        ...request,
        headers: { ...request.headers, accept: 'image/png' },
      }).response
    ).toBeDefined()
  })
})
