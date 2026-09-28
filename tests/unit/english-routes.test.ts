import { describe, expect, it } from 'vitest'

import { chinesePathFor, englishPathFor } from '@/i18n/routes'
import { translateCases } from '@/i18n/cases'

describe('English routes and CMS case translations', () => {
  it('maps completed route pairs without inventing untranslated paths', () => {
    expect(englishPathFor('/product')).toBe('/en/services')
    expect(chinesePathFor('/en/returns-inspection')).toBe('/tuihuo-zhijian')
    expect(englishPathFor('/news')).toBe('/en')
  })

  it('omits a CMS case when its stable source snapshot no longer matches', () => {
    expect(
      translateCases([
        {
          id: 1,
          sort: 1,
          slug: 'ur',
          label: 'changed source copy',
          img: '/case.webp',
          category: '',
          metrics: '',
          details: '',
        },
      ] as any)
    ).toEqual([])
  })
})
