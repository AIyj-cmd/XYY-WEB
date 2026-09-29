import { describe, expect, it, vi } from 'vitest'

import { PUBLICATION_FAQS } from '@/data/publications'
import { getWhitepaperDirectory, getWhitepaperListings } from '@/data/whitepapers'
import {
  chinesePathFor,
  ENGLISH_ROUTES,
  englishPathFor,
  findLocalePair,
  isNavigationActive,
  matchesLocalePath,
  normalizePath,
} from '@/i18n/routes'
import { translatePublicationFaqs, translateWhitepapers } from '@/i18n/whitepapers'

describe('English supply-chain whitepapers', () => {
  it('uses the converted directory metadata and only translates reviewed source snapshots', () => {
    const source = getWhitepaperListings()
    const translated = translateWhitepapers(source)

    expect(source).toHaveLength(14)
    expect(translated).toHaveLength(14)
    expect(
      translated.every((item) => !/[\u3400-\u9fff]/.test(`${item.title} ${item.description}`))
    ).toBe(true)
    expect(translated.find(({ issue }) => issue === '14')?.sourcePublishedLabel).toBe(
      'June 2026 (cover)'
    )
    expect(translated.find(({ issue }) => issue === '12')?.sourcePublishedLabel).toBe(
      'Summer 2025 (original contents page also shows 03–07)'
    )
    expect(translated.find(({ issue }) => issue === '10')?.sourcePublishedLabel).toBe(
      'Cover: Autumn 2024; e-publication foreword: SUMMER (source conflict retained)'
    )

    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(translateWhitepapers([{ ...source[0], description: 'changed source' }])).toEqual([])
    expect(translateWhitepapers([{ ...source[0], issue: '15' }])).toEqual([])
    expect(warning).toHaveBeenCalledTimes(2)
    warning.mockRestore()
  })

  it('keeps successful empty CMS availability empty and omits changed FAQ sources', () => {
    expect(getWhitepaperDirectory([])).toEqual({ whitepapers: [], pdfOnlyIssues: [] })
    expect(translatePublicationFaqs(PUBLICATION_FAQS)).toHaveLength(PUBLICATION_FAQS.length)

    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(translatePublicationFaqs([{ ...PUBLICATION_FAQS[0], a: 'changed source' }])).toEqual([])
    expect(warning).toHaveBeenCalledWith('[i18n:whitepapers] omitted FAQ 1: stale-source')
    warning.mockRestore()
  })

  it('pairs the trailing-slash Chinese directory with the English Insights route', () => {
    expect(englishPathFor('/supply-chain-whitepapers/')).toBe('/en/supply-chain-whitepapers')
    expect(chinesePathFor('/en/supply-chain-whitepapers')).toBe('/supply-chain-whitepapers/')
    expect(isNavigationActive('/en/news', '/en/supply-chain-whitepapers', 'en')).toBe(true)
  })

  it('matches every static locale pair on both sides, including root and trailing slashes', () => {
    for (const pair of ENGLISH_ROUTES) {
      expect(matchesLocalePath(pair, 'zh-CN', pair[0])).toBe(true)
      expect(matchesLocalePath(pair, 'en', pair[1])).toBe(true)
      expect(findLocalePair(pair[0], 'zh-CN')).toEqual(pair)
      expect(findLocalePair(pair[1], 'en')).toEqual(pair)
    }
    expect(normalizePath('/')).toBe('/')
    expect(matchesLocalePath(['/news/example', '/en/news/example'], 'zh-CN', '/news/example')).toBe(
      true
    )
  })
})
