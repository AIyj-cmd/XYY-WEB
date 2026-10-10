import { describe, expect, it } from 'vitest'

import {
  caseContactHref,
  contactHref,
  contactLanguageHref,
  getConversionContext,
  getConversionSource,
  getCaseContactKey,
  getRecommendedContactService,
  getServiceFinderContext,
} from '@/lib/conversion/contact-source'

describe('contact conversion sources', () => {
  it('maps only the reviewed service routes to contact query parameters', () => {
    expect(contactHref('/xiefu-yuncang', 'zh-CN', 'hero')).toBe(
      '/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form'
    )
    expect(contactHref('/en/smart-shipping', 'en', 'bottom')).toBe(
      '/en/contact?from=%2Fen%2Fsmart-shipping&entry=bottom#contact-form'
    )
    expect(contactHref('/cases', 'zh-CN', 'bottom')).toBe('/contact')
    expect(getConversionSource('constructor')).toBeNull()
    expect(getConversionSource('__proto__')).toBeNull()
  })

  it('accepts one known source pair and rejects unknown or duplicate parameters', () => {
    const accepted = getConversionContext(
      new URL('https://example.test/contact?from=%2Fxiefu-yuncang&entry=hero')
    )
    expect(accepted).toMatchObject({ service: 'cloud-warehouse', locale: 'zh-CN' })
    expect(
      getConversionContext(
        new URL(
          'https://example.test/contact?from=%2Fxiefu-yuncang&from=%2Ftuihuo-zhijian&entry=hero'
        )
      )
    ).toBeNull()
    expect(
      getConversionContext(new URL('https://example.test/contact?from=constructor&entry=hero'))
    ).toBeNull()
  })

  it('covers all 20 approved service routes with locale and service mappings', () => {
    const expected = [
      ['/xiefu-yuncang', 'zh-CN', 'cloud-warehouse'],
      ['/huadong-xiefu-yuncang', 'zh-CN', 'cloud-warehouse'],
      ['/kuajing-yuncang', 'zh-CN', 'cloud-warehouse'],
      ['/huanan-xiefu-yuncang', 'zh-CN', 'cloud-warehouse'],
      ['/zhibo-cangpei', 'zh-CN', 'cloud-warehouse'],
      ['/b2b-mendian-cangpei', 'zh-CN', 'cloud-warehouse'],
      ['/tuihuo-zhijian', 'zh-CN', 'quality-inspection'],
      ['/houzheng-xiufu', 'zh-CN', 'quality-inspection'],
      ['/wuliu-shuzihua', 'zh-CN', 'logistics-cloud'],
      ['/yundao-zhineng-jijian', 'zh-CN', 'logistics-cloud'],
      ['/en/apparel-fulfillment', 'en', 'cloud-warehouse'],
      ['/en/cross-border-fulfillment', 'en', 'cloud-warehouse'],
      ['/en/south-china-fulfillment', 'en', 'cloud-warehouse'],
      ['/en/east-china-fulfillment', 'en', 'cloud-warehouse'],
      ['/en/livestream-fulfillment', 'en', 'cloud-warehouse'],
      ['/en/returns-inspection', 'en', 'quality-inspection'],
      ['/en/garment-care', 'en', 'quality-inspection'],
      ['/en/retail-distribution', 'en', 'cloud-warehouse'],
      ['/en/digital-operations', 'en', 'logistics-cloud'],
      ['/en/smart-shipping', 'en', 'logistics-cloud'],
    ] as const
    expect(expected).toHaveLength(20)
    for (const [pathname, locale, service] of expected) {
      expect(getConversionSource(pathname)).toMatchObject({ pathname, locale, service })
      expect(contactHref(pathname, locale, 'hero')).toBe(
        `${locale === 'en' ? '/en/contact' : '/contact'}?from=${encodeURIComponent(pathname)}&entry=hero#contact-form`
      )
    }
  })

  it('preserves only a valid source pair when switching contact languages', () => {
    expect(
      contactLanguageHref(
        new URL('https://example.test/contact?from=%2Fxiefu-yuncang&entry=floating'),
        'en'
      )
    ).toBe('/en/contact?from=%2Fxiefu-yuncang&entry=floating#contact-form')
    expect(
      contactLanguageHref(new URL('https://example.test/contact?from=constructor&entry=hero'), 'en')
    ).toBe('/en/contact')
  })

  it('accepts the five finder needs across all three reviewed regions', () => {
    const needs = [
      ['ecommerce-fulfilment', 'cloud-warehouse'],
      ['store-replenishment', 'cloud-warehouse'],
      ['returns-inspection', 'quality-inspection'],
      ['garment-care', 'quality-inspection'],
      ['livestream-fulfilment', 'cloud-warehouse'],
    ] as const
    for (const [need, service] of needs) {
      for (const region of ['any', 'east-china', 'south-china'] as const) {
        const url = new URL(`https://example.test/contact?need=${need}&region=${region}`)
        expect(getServiceFinderContext(url)).toMatchObject({ need, region, service })
        expect(getRecommendedContactService(url)).toBe(service)
      }
    }
  })

  it('rejects duplicate, conflicting, unknown, and malicious finder or case parameters', () => {
    const rejected = [
      '?need=ecommerce-fulfilment&need=garment-care&region=any',
      '?need=ecommerce-fulfilment&region=any&region=south-china',
      '?need=constructor&region=any',
      '?need=ecommerce-fulfilment&region=constructor',
      '?need=%3Cscript%3Ealert(1)%3C%2Fscript%3E&region=any',
    ]
    for (const query of rejected) {
      const url = new URL(`https://example.test/contact${query}`)
      expect(getServiceFinderContext(url)).toBeNull()
      expect(getRecommendedContactService(url)).toBeNull()
    }

    expect(
      getRecommendedContactService(
        new URL(
          'https://example.test/contact?from=%2Ftuihuo-zhijian&entry=hero&need=ecommerce-fulfilment&region=any'
        )
      )
    ).toBeNull()
    expect(getCaseContactKey(new URL('https://example.test/contact?case=UR'))).toBeNull()
    expect(getCaseContactKey(new URL('https://example.test/contact?case=ur&case=ur'))).toBeNull()
    expect(
      getCaseContactKey(new URL('https://example.test/contact?case=%3Cimg%20src=x%3E'))
    ).toBeNull()
    expect(caseContactHref('ur', 'en')).toBe('/en/contact?case=ur#contact-form')
  })

  it('preserves valid finder and case context when switching language', () => {
    expect(
      contactLanguageHref(
        new URL(
          'https://example.test/contact?from=%2Fxiefu-yuncang&entry=hero&need=ecommerce-fulfilment&region=east-china&case=ur'
        ),
        'en'
      )
    ).toBe(
      '/en/contact?from=%2Fxiefu-yuncang&entry=hero&need=ecommerce-fulfilment&region=east-china&case=ur#contact-form'
    )
  })
})
