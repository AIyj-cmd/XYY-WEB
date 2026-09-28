import { describe, expect, it, vi } from 'vitest'
import { RETURNS_ENGLISH_SOURCE } from '@/i18n/service-sources-returns'
import { FOOTWEAR_ENGLISH_SOURCE } from '@/i18n/service-sources-footwear'
import { REPAIR_ENGLISH_SOURCE } from '@/i18n/service-sources-repair'
import { B2B_ENGLISH_SOURCE } from '@/i18n/service-sources-b2b'
import { translateReviewedService } from '@/i18n/service-sources'

const asServiceLandingFallback = ({
  title,
  description,
  breadcrumbLabel,
  eyebrow,
  h1,
  h1sub,
  heroDesc,
  imgSrc,
  imgAlt,
  stats,
  contentDesc,
  featuresLabel,
  features,
}: (typeof FOOTWEAR_ENGLISH_SOURCE)['source']) => ({
  title,
  description,
  breadcrumbLabel,
  eyebrow,
  h1,
  h1sub,
  heroDesc,
  imgSrc,
  imgAlt,
  stats: stats.map(({ stat, label, sub }) => ({ label, sub, stat })),
  contentDesc,
  featuresLabel,
  features: features.map(({ title, desc }) => ({ desc, title })),
})

describe('reviewed English service source catalogs', () => {
  it('translates a complete reviewed source snapshot and preserves its FAQ pairing', () => {
    const result = translateReviewedService(
      RETURNS_ENGLISH_SOURCE,
      RETURNS_ENGLISH_SOURCE.source,
      RETURNS_ENGLISH_SOURCE.sourceFaqs
    )
    expect(result.content.h1).toBe('Apparel returns inspection and re-listing')
    expect(result.content.features).toHaveLength(6)
    expect(result.faqs).toEqual(RETURNS_ENGLISH_SOURCE.englishFaqs)
  })

  it.each([REPAIR_ENGLISH_SOURCE, B2B_ENGLISH_SOURCE])(
    'translates every reviewed garment-care and retail source field',
    (catalog) => {
      const result = translateReviewedService(catalog, catalog.source, catalog.sourceFaqs)
      expect(result.content.stats).toHaveLength(4)
      expect(result.content.features).toHaveLength(6)
      expect(result.faqs).toHaveLength(5)
      expect(JSON.stringify(result)).not.toMatch(/[\u3400-\u9fff]/)
    }
  )

  it('keeps apparel fulfilment source ordering while translating every visible field', () => {
    const result = translateReviewedService(
      FOOTWEAR_ENGLISH_SOURCE,
      FOOTWEAR_ENGLISH_SOURCE.source,
      FOOTWEAR_ENGLISH_SOURCE.sourceFaqs
    )
    expect(result.content.features.map(({ title }) => title)).toEqual([
      'One inventory pool across channels',
      'RFID-enabled item identification',
      'Flexible capacity planning',
      'Configurable WMS integration',
      'Detailed inventory control',
      'End-to-end operational traceability',
    ])
    expect(result.faqs).toHaveLength(5)
    expect(JSON.stringify(result)).not.toMatch(/[\u3400-\u9fff]/)
  })

  it.each([
    FOOTWEAR_ENGLISH_SOURCE,
    RETURNS_ENGLISH_SOURCE,
    REPAIR_ENGLISH_SOURCE,
    B2B_ENGLISH_SOURCE,
  ])('accepts every catalog after ServiceLanding fallback assembly', (catalog) => {
    const result = translateReviewedService(
      catalog,
      asServiceLandingFallback(catalog.source),
      catalog.sourceFaqs.map(({ q, a }) => ({ a, q }))
    )
    expect(result.content.h1).toBe(catalog.english.h1)
    expect(result.faqs).toEqual(catalog.englishFaqs)
  })

  it('omits changed source fields and stale FAQ pairs instead of translating by title alone', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const changed = { ...RETURNS_ENGLISH_SOURCE.source, heroDesc: 'Changed source field' }
    const staleFaq = { ...RETURNS_ENGLISH_SOURCE.sourceFaqs[0], a: 'Changed answer' }
    const result = translateReviewedService(RETURNS_ENGLISH_SOURCE, changed, [staleFaq])
    expect(result.content.h1).toBe('')
    expect(result.faqs).toEqual([])
    expect(warn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })
})
