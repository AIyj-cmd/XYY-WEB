import { describe, expect, it } from 'vitest'

import { assertWebHealthPayload } from '../../scripts/lib/health-contract.mjs'

describe('web health contract', () => {
  it('accepts the healthy server payload', () => {
    expect(() =>
      assertWebHealthPayload({ status: 'ok', dependencies: { contactStorage: 'ok' } })
    ).not.toThrow()
  })

  it('rejects an unreachable contact store', () => {
    expect(() =>
      assertWebHealthPayload({
        status: 'degraded',
        dependencies: { contactStorage: 'unreachable' },
      })
    ).toThrow(/unexpected status/)
  })

  it('rejects the legacy payload that omitted dependency health', () => {
    expect(() => assertWebHealthPayload({ status: 'ok' })).toThrow(/contact storage/)
  })
})
