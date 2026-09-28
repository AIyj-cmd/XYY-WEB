import { describe, expect, it } from 'vitest'

import { chinesePathFor, englishPathFor, isNavigationActive } from '@/i18n/routes'

describe('English shell route behavior', () => {
  it('marks only the English home route as Home and groups English detail routes under Services', () => {
    expect(isNavigationActive('/en', '/en/cases', 'en')).toBe(false)
    expect(isNavigationActive('/en/services', '/en/services', 'en')).toBe(true)
    expect(isNavigationActive('/en/services', '/en/garment-care', 'en')).toBe(true)
    expect(isNavigationActive('/en/cases', '/en/cases', 'en')).toBe(true)
  })

  it('keeps route switching pairwise and sends untranslated paths to the appropriate home page', () => {
    expect(chinesePathFor('/en/about')).toBe('/about')
    expect(englishPathFor('/about')).toBe('/en/about')
    expect(chinesePathFor('/en/unknown')).toBe('/')
    expect(englishPathFor('/news')).toBe('/en')
  })
})
