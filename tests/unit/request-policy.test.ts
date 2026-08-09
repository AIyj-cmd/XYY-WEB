import { describe, expect, it, vi } from 'vitest'

import { createCanonicalRedirect } from '../../server/request-policy.mjs'

const config = {
  formalHost: '56xyy.com',
  formalOrigin: 'https://56xyy.com',
  legacyHosts: new Set<string>(),
  enableDomainRedirects: false,
}

function runCanonicalRedirect(path: string, originalUrl = path) {
  const redirect = vi.fn()
  const next = vi.fn()
  const middleware = createCanonicalRedirect(config)

  middleware(
    {
      hostname: config.formalHost,
      protocol: 'https',
      path,
      originalUrl,
      get: vi.fn(() => undefined),
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
})
