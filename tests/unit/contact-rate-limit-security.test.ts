import { beforeEach, describe, expect, it } from 'vitest'

import { isContactRateLimited, resetContactRateLimitForTests } from '@/lib/contact/rate-limit'

describe('contact rate limit capacity', () => {
  beforeEach(() => {
    resetContactRateLimitForTests()
  })

  it('keeps the existing five-request window and resets it after expiry', () => {
    const now = 1_000

    for (let index = 0; index < 5; index += 1) {
      expect(isContactRateLimited('stable', now)).toBe(false)
    }
    expect(isContactRateLimited('stable', now)).toBe(true)
    expect(isContactRateLimited('stable', now + 10 * 60 * 1_000)).toBe(false)
  })

  it('evicts the earliest-expiring bucket when 1,000 unique keys fill capacity', () => {
    const now = 1_000

    for (let index = 0; index < 5; index += 1) {
      expect(isContactRateLimited('oldest', now)).toBe(false)
    }
    for (let index = 0; index < 999; index += 1) {
      expect(isContactRateLimited(`new-${index}`, now + 1)).toBe(false)
    }

    expect(isContactRateLimited('new-999', now + 1)).toBe(false)
    expect(isContactRateLimited('oldest', now + 1)).toBe(false)
  })
})
