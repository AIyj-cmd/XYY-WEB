import { describe, expect, it, vi } from 'vitest'

import { HOME_FAQS, HOME_SERVICE_FALLBACKS, HOME_STATS_FALLBACKS } from '@/data/home'
import { translateHomeFaqs, translateHomeServices, translateHomeStats } from '@/i18n/home-content'
import { homeUi } from '@/i18n/home-ui'

describe('English home source adaptation', () => {
  it('translates all reviewed homepage records and formats claim-backed figures', () => {
    const stats = translateHomeStats(HOME_STATS_FALLBACKS.map((item) => ({ ...item })))
    const services = translateHomeServices(
      HOME_SERVICE_FALLBACKS.map((item) => ({ ...item, features: [...item.features] }))
    )
    const faqs = translateHomeFaqs(HOME_FAQS.map((item) => ({ ...item })))

    expect(stats).toHaveLength(HOME_STATS_FALLBACKS.length)
    expect(stats.find(({ claimKey }) => claimKey === 'warehouseArea')).toMatchObject({
      value: '540,000',
      unit: ' m²',
      label: 'Direct-operated warehouse space',
    })
    expect(services.map(({ slug }) => slug)).toEqual(HOME_SERVICE_FALLBACKS.map(({ slug }) => slug))
    expect(faqs).toHaveLength(HOME_FAQS.length)
    expect(faqs.every(({ q, a }) => !/[\u4e00-\u9fff]/.test(`${q}${a}`))).toBe(true)
  })

  it('omits a stale source record rather than assigning it a reviewed translation', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const stale = { ...HOME_SERVICE_FALLBACKS[0], description: 'Changed by CMS' }
    expect(translateHomeServices([stale])).toEqual([])
    expect(translateHomeFaqs([{ ...HOME_FAQS[0], a: 'Changed by CMS' }])).toEqual([])
    expect(warn).toHaveBeenCalledWith('[i18n:home] omitted service: cloud-warehouse')
    expect(warn).toHaveBeenCalledWith('[i18n:home] omitted faq: unknown')
    warn.mockRestore()
  })

  it('provides English-only service and smart-shipping feature copy', () => {
    const services = translateHomeServices(
      HOME_SERVICE_FALLBACKS.map((item) => ({ ...item, features: [...item.features] }))
    )
    const yundao = homeUi('en').digital

    expect(services.flatMap(({ features }) => features).join('')).not.toMatch(/[\u4e00-\u9fff]/)
    expect(`${yundao.name}${yundao.subtitle}${yundao.features.join('')}`).not.toMatch(
      /[\u4e00-\u9fff]/
    )
  })
})
