import { describe, expect, it } from 'vitest'

import { CASE_FALLBACKS } from '@/data/cases'

describe('reviewed case catalog', () => {
  it('contains the six approved brands and never restores the retired Toyouth case', () => {
    expect(CASE_FALLBACKS.map(({ slug }) => slug)).toEqual([
      'ur',
      'maxrieny',
      'xingmian',
      'meiyi',
      'romi-studio',
      'inman',
    ])
    expect(CASE_FALLBACKS.some(({ label }) => label.includes('初语'))).toBe(false)
  })
})
