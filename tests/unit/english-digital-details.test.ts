import { describe, expect, it, vi } from 'vitest'

import { homeUi } from '@/i18n/home-ui'
import { englishPathFor, isNavigationActive } from '@/i18n/routes'
import { translateReviewedService } from '@/i18n/service-sources'
import { YUNDAO_ENGLISH_SOURCE } from '@/i18n/service-sources-yundao'

describe('English digital-detail sources and discovery', () => {
  it('translates the complete reviewed smart-shipping source and FAQ pairs', () => {
    const result = translateReviewedService(
      YUNDAO_ENGLISH_SOURCE,
      YUNDAO_ENGLISH_SOURCE.source,
      YUNDAO_ENGLISH_SOURCE.sourceFaqs
    )

    expect(result.content.h1).toBe('Store shipping, transfers and returns')
    expect(result.content.stats).toHaveLength(4)
    expect(result.content.stats.map(({ stat }) => stat)).not.toContain('11家')
    expect(JSON.stringify(result)).not.toMatch(/\b11\b|50%/)
    expect(result.faqs).toHaveLength(5)
    expect(JSON.stringify(result)).not.toMatch(/[\u3400-\u9fff]/)
  })

  it('omits changed smart-shipping content and stale FAQ answers', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const result = translateReviewedService(
      YUNDAO_ENGLISH_SOURCE,
      { ...YUNDAO_ENGLISH_SOURCE.source, heroDesc: 'changed source' },
      [{ ...YUNDAO_ENGLISH_SOURCE.sourceFaqs[0], a: 'changed answer' }]
    )

    expect(result.content.h1).toBe('')
    expect(result.faqs).toEqual([])
    expect(warn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })

  it('does not revive the reviewed catalog when CMS returns an empty service and FAQ list', () => {
    const empty = {
      ...YUNDAO_ENGLISH_SOURCE.source,
      title: '',
      description: '',
      breadcrumbLabel: '',
      eyebrow: '',
      h1: '',
      h1sub: '',
      heroDesc: '',
      imgSrc: '',
      imgAlt: '',
      contentDesc: '',
      featuresLabel: '',
      stats: [],
      features: [],
    }
    const result = translateReviewedService(YUNDAO_ENGLISH_SOURCE, empty, [])

    expect(result.content).toMatchObject({ h1: '', stats: [], features: [] })
    expect(result.faqs).toEqual([])
  })

  it('pairs both detail routes, marks them as services and links both home entries to detail pages', () => {
    const copy = homeUi('en')

    expect(englishPathFor('/wuliu-shuzihua')).toBe('/en/digital-operations')
    expect(englishPathFor('/yundao-zhineng-jijian')).toBe('/en/smart-shipping')
    expect(isNavigationActive('/en/services', '/en/digital-operations', 'en')).toBe(true)
    expect(isNavigationActive('/en/services', '/en/smart-shipping', 'en')).toBe(true)
    expect(copy.solutions.bySlug['logistics-cloud'].href).toBe('/en/digital-operations')
    expect(copy.digital.href).toBe('/en/smart-shipping')
  })
})
