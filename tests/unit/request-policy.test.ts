import { describe, expect, it, vi } from 'vitest'

import { createCanonicalRedirect } from '../../server/request-policy.mjs'

const config = {
  formalHost: '56xyy.com',
  formalOrigin: 'https://56xyy.com',
  legacyHosts: new Set<string>(),
  enableDomainRedirects: false,
}

function runCanonicalRedirect(
  path: string,
  originalUrl = path,
  requestConfig = config,
  request: Partial<{ hostname: string; protocol: string; forwardedProto: string }> = {}
) {
  const redirect = vi.fn()
  const next = vi.fn()
  const middleware = createCanonicalRedirect(requestConfig)

  middleware(
    {
      hostname: request.hostname ?? requestConfig.formalHost,
      protocol: request.protocol ?? 'https',
      path,
      originalUrl,
      get: vi.fn(() => request.forwardedProto),
    },
    { redirect },
    next
  )

  return { redirect, next }
}

describe('canonical redirect policy', () => {
  it.each([
    ['//attacker.example/', '/attacker.example'],
    [String.raw`\\attacker.example\path/`, String.raw`/attacker.example\path`],
    [String.raw`/\attacker.example/`, '/attacker.example'],
  ])('keeps a leading-separator path on the current origin: %s', (path, expectedLocation) => {
    const { redirect, next } = runCanonicalRedirect(path)

    expect(redirect).toHaveBeenCalledWith(301, expectedLocation)
    expect(next).not.toHaveBeenCalled()

    const location = redirect.mock.calls[0]?.[1]
    expect(new URL(location, config.formalOrigin).origin).toBe(config.formalOrigin)
    expect(location).not.toMatch(/^[\\/]{2}/)
  })

  it('preserves the query while normalizing an unsafe path', () => {
    const { redirect } = runCanonicalRedirect('//attacker.example/', '//attacker.example/?next=1')

    expect(redirect).toHaveBeenCalledWith(301, '/attacker.example?next=1')
  })

  it('continues without redirecting an already canonical path', () => {
    const { redirect, next } = runCanonicalRedirect('/product')

    expect(redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledOnce()
  })

  it.each([
    ['/supply-chain-whitepapers', '/supply-chain-whitepapers/?source=canonical'],
    ['/senlinqikan', '/supply-chain-whitepapers/?source=legacy'],
    ['/senlinqikan/', '/supply-chain-whitepapers/?source=legacy-slash'],
  ])('redirects %s once to the new canonical publication URL', (path, expectedLocation) => {
    const { redirect, next } = runCanonicalRedirect(
      path,
      `${path}?source=${expectedLocation.split('=')[1]}`
    )

    expect(redirect).toHaveBeenCalledOnce()
    expect(redirect).toHaveBeenCalledWith(301, expectedLocation)
    expect(next).not.toHaveBeenCalled()
  })

  it('continues without redirecting the canonical publication URL or its resources', () => {
    for (const path of [
      '/supply-chain-whitepapers/',
      '/senlinqikan/pdf/14.pdf',
      '/senlinqikan/covers/14.jpg',
    ]) {
      const { redirect, next } = runCanonicalRedirect(path)

      expect(redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledOnce()
    }
  })

  it('canonicalizes every known whitepaper issue while leaving unknown identifiers for Astro 404', () => {
    expect(
      runCanonicalRedirect('/supply-chain-whitepapers/1', '/supply-chain-whitepapers/1?source=card')
        .redirect
    ).toHaveBeenCalledWith(301, '/supply-chain-whitepapers/1/?source=card')
    expect(
      runCanonicalRedirect(
        '/supply-chain-whitepapers/14',
        '/supply-chain-whitepapers/14?source=pdf'
      ).redirect
    ).toHaveBeenCalledWith(301, '/supply-chain-whitepapers/14/?source=pdf')
    expect(runCanonicalRedirect('/supply-chain-whitepapers/14/').next).toHaveBeenCalledOnce()
    expect(runCanonicalRedirect('/supply-chain-whitepapers/014').next).toHaveBeenCalledOnce()
    expect(runCanonicalRedirect('/supply-chain-whitepapers/15/').next).toHaveBeenCalledOnce()
  })

  it('keeps ordinary trailing-slash, formal-origin, and legacy-origin normalization', () => {
    expect(runCanonicalRedirect('/product/').redirect).toHaveBeenCalledWith(301, '/product')
    expect(
      runCanonicalRedirect('/product/', '/product/?source=www', config, {
        hostname: 'www.56xyy.com',
      }).redirect
    ).toHaveBeenCalledWith(301, 'https://56xyy.com/product?source=www')

    const legacyConfig = {
      ...config,
      enableDomainRedirects: true,
      legacyHosts: new Set(['legacy.example']),
    }
    expect(
      runCanonicalRedirect('/product/', '/product/?source=legacy', legacyConfig, {
        hostname: 'legacy.example',
      }).redirect
    ).toHaveBeenCalledWith(301, 'https://56xyy.com/product?source=legacy')
  })
})
