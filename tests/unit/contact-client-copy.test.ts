import { describe, expect, it } from 'vitest'

import { englishContactFailure } from '@/lib/contact/client-copy'

describe('English contact client copy', () => {
  it('uses stable mapped messages for known API error codes', () => {
    expect(englishContactFailure('validation_failed')).toContain('valid email address')
    expect(englishContactFailure('storage_unavailable')).toBe(
      'We could not save your enquiry. Please try again and keep your details in the form.'
    )
  })

  it('does not expose unknown code, malformed payload, or transport error text', () => {
    const expected =
      'We could not submit your enquiry. Please try again and keep your details in the form.'

    expect(englishContactFailure('unknown_error')).toBe(expected)
    expect(englishContactFailure({ code: 'validation_failed' })).toBe(expected)
    expect(englishContactFailure(undefined)).toBe(expected)
    for (const code of ['toString', 'constructor', '__proto__']) {
      expect(englishContactFailure(code)).toBe(expected)
      expect(typeof englishContactFailure(code)).toBe('string')
    }
  })
})
