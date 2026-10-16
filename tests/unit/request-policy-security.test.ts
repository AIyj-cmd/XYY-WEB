import { describe, expect, it, vi } from 'vitest'

import { createSecurityHeaders } from '../../server/request-policy.mjs'

describe('request security headers', () => {
  it('uses a script policy without unsafe inline code or a loopback connect source', () => {
    const setHeader = vi.fn()
    const next = vi.fn()
    createSecurityHeaders({
      formalOrigin: 'https://56xyy.com',
      isProductionDomain: false,
      publicSiteOrigin: 'http://127.0.0.1:4399',
    })({}, { setHeader }, next)

    const csp = setHeader.mock.calls.find(([name]) => name === 'Content-Security-Policy')?.[1]
    const scriptSource = csp
      .split('; ')
      .find((directive: string) => directive.startsWith('script-src'))
    expect(scriptSource).toBe("script-src 'self'")
    expect(csp).toContain("connect-src 'self'")
    expect(csp).not.toContain('127.0.0.1')
    expect(next).toHaveBeenCalledOnce()
  })
})
