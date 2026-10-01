import { describe, expect, it } from 'vitest'

import {
  contactHref,
  contactLanguageHref,
  getConversionContext,
  getConversionSource,
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

  it('covers all 16 approved service routes with locale and service mappings', () => {
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
      ['/en/returns-inspection', 'en', 'quality-inspection'],
      ['/en/garment-care', 'en', 'quality-inspection'],
      ['/en/retail-distribution', 'en', 'cloud-warehouse'],
      ['/en/digital-operations', 'en', 'logistics-cloud'],
      ['/en/smart-shipping', 'en', 'logistics-cloud'],
    ] as const
    expect(expected).toHaveLength(16)
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
})
