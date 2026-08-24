import { describe, expect, it } from 'vitest'

import { assertWebHealthPayload } from '../../scripts/lib/health-contract.mjs'

describe('web health contract', () => {
  it('accepts the healthy server payload', () => {
    expect(() =>
      assertWebHealthPayload({
        status: 'ok',
        dependencies: { cmsContent: 'ok', contactStorage: 'ok' },
      })
    ).not.toThrow()
  })

  it('rejects an unreachable contact store', () => {
    expect(() =>
      assertWebHealthPayload({
        status: 'degraded',
        dependencies: { cmsContent: 'ok', contactStorage: 'unreachable' },
      })
    ).toThrow(/unexpected status/)
  })

  it('rejects an incomplete CMS schema', () => {
    expect(() =>
      assertWebHealthPayload({
        status: 'degraded',
        dependencies: { cmsContent: 'incomplete', contactStorage: 'ok' },
      })
    ).toThrow(/unexpected status/)
  })

  it('rejects the legacy payload that omitted dependency health', () => {
    expect(() => assertWebHealthPayload({ status: 'ok' })).toThrow(/contact storage/)
  })
})
