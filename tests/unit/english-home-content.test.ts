import { describe, expect, it, vi } from 'vitest'

import { HOME_FAQS, HOME_SERVICE_FALLBACKS, HOME_STATS_FALLBACKS } from '@/data/home'
import { translateHomeFaqs, translateHomeServices, translateHomeStats } from '@/i18n/home-content'
import { homeUi } from '@/i18n/home-ui'
import { CLAIM_TEXT } from '@/lib/claims'
import { interpolateClaims } from '@/lib/directus-interpolation'
import { APPROVED_SERVICES } from '../../scripts/data/approved-services.mjs'
import publishedServices from '../fixtures/home-services.published.json'

function interpolatePublishedService(service: (typeof publishedServices.data)[number]) {
  const interpolate = (value: string, field: string) =>
    interpolateClaims(value, {
      pageScope: 'home',
      source: { collection: 'services', recordId: service.id, field },
    })

  return {
    ...service,
    subtitle: interpolate(service.subtitle, 'subtitle'),
    description: interpolate(service.description, 'description'),
    features: service.features.map((feature) => interpolate(feature, 'features')),
  }
}

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

  it('translates the captured published services with English claims and preserves metadata', () => {
    const published = publishedServices.data.map(interpolatePublishedService)
    const services = translateHomeServices(published)

    expect(services).toHaveLength(3)
    expect(services.map(({ slug }) => slug)).toEqual(published.map(({ slug }) => slug))
    expect(services.map(({ id, sort, icon }) => ({ id, sort, icon }))).toEqual(
      published.map(({ id, sort, icon }) => ({ id, sort, icon }))
    )
    expect(services.flatMap(({ features }) => features).join('\n')).toContain(
      `Dispatch accuracy ${CLAIM_TEXT.shippingAccuracy}; inventory accuracy ${CLAIM_TEXT.inventoryAccuracy}`
    )
    expect(services.flatMap(({ features }) => features).join('\n')).not.toContain('99.99%')
    expect(services.flatMap(({ features }) => features).join('\n')).not.toContain(
      CLAIM_TEXT.newGoodsInspectionAnnual
    )

    const retainedMetadata = translateHomeServices([
      { ...published[0], id: 101, sort: 9, icon: 'warehouse-updated' },
    ])
    expect(retainedMetadata[0]).toMatchObject({ id: 101, sort: 9, icon: 'warehouse-updated' })
  })

  it('recognizes only the approved template expanded with its current claims', () => {
    const expanded = APPROVED_SERVICES.map((service) => ({
      ...service,
      description: interpolateClaims(service.description, {
        pageScope: 'home',
        source: { collection: 'services', recordId: service.id, field: 'description' },
      }),
      subtitle: interpolateClaims(service.subtitle, {
        pageScope: 'home',
        source: { collection: 'services', recordId: service.id, field: 'subtitle' },
      }),
      features: service.features.map((feature) =>
        interpolateClaims(feature, {
          pageScope: 'home',
          source: { collection: 'services', recordId: service.id, field: 'features' },
        })
      ),
    }))

    expect(expanded).not.toEqual(publishedServices.data.map(interpolatePublishedService))
    expect(CLAIM_TEXT.inventoryAccuracy).not.toBe('99.99%')
    expect(translateHomeServices(expanded)).toHaveLength(3)
  })

  it('omits empty, incomplete, unknown and rewritten CMS service records', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const rewritten = {
      ...interpolatePublishedService(publishedServices.data[0]),
      features: [...interpolatePublishedService(publishedServices.data[0]).features],
    }
    rewritten.features[4] = 'CMS-rewritten feature'

    expect(translateHomeServices([])).toEqual([])
    expect(
      translateHomeServices([
        { ...interpolatePublishedService(publishedServices.data[0]), features: [] },
      ])
    ).toEqual([])
    expect(
      translateHomeServices([
        { ...interpolatePublishedService(publishedServices.data[0]), slug: 'unknown-service' },
      ])
    ).toEqual([])
    expect(translateHomeServices([rewritten])).toEqual([])
    expect(warn).toHaveBeenCalledTimes(3)
    warn.mockRestore()
  })
})
