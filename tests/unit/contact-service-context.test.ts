import { describe, expect, it } from 'vitest'

import { getContactServiceContext } from '@/lib/contact/service-context'

const sources = [
  ['/xiefu-yuncang', '鞋服云仓', 'Apparel fulfilment', '鞋服云仓'],
  ['/huadong-xiefu-yuncang', '华东鞋服云仓', 'East China fulfilment', '华东鞋服云仓'],
  ['/kuajing-yuncang', '跨境云仓', 'Cross-border fulfilment', '跨境云仓'],
  ['/huanan-xiefu-yuncang', '华南鞋服云仓', 'South China fulfilment', '华南鞋服云仓'],
  ['/zhibo-cangpei', '直播电商仓配', 'Livestream fulfilment', '直播电商仓配'],
  ['/b2b-mendian-cangpei', 'B2B门店仓配', 'Retail distribution', 'B2B门店仓配'],
  ['/tuihuo-zhijian', '退货质检', 'Returns inspection', '退货质检'],
  ['/houzheng-xiufu', '后整修复', 'Garment care and repair', '后整修复'],
  ['/wuliu-shuzihua', '物流数字化能力', 'Digital operations', null],
  ['/yundao-zhineng-jijian', '运到智能寄件平台', 'Smart shipping platform', null],
  ['/en/apparel-fulfillment', '鞋服云仓', 'Apparel fulfilment', '鞋服云仓'],
  ['/en/cross-border-fulfillment', '跨境云仓', 'Cross-border fulfilment', '跨境云仓'],
  ['/en/south-china-fulfillment', '华南鞋服云仓', 'South China fulfilment', '华南鞋服云仓'],
  ['/en/east-china-fulfillment', '华东鞋服云仓', 'East China fulfilment', '华东鞋服云仓'],
  ['/en/livestream-fulfillment', '直播电商仓配', 'Livestream fulfilment', '直播电商仓配'],
  ['/en/returns-inspection', '退货质检', 'Returns inspection', '退货质检'],
  ['/en/garment-care', '后整修复', 'Garment care and repair', '后整修复'],
  ['/en/retail-distribution', 'B2B门店仓配', 'Retail distribution', 'B2B门店仓配'],
  ['/en/digital-operations', '物流数字化能力', 'Digital operations', null],
  ['/en/smart-shipping', '运到智能寄件平台', 'Smart shipping platform', null],
] as const

const contact = (query = '') => new URL(`https://example.test/contact${query}`)

describe('contact service context', () => {
  it.each(sources)('maps %s to the current page locale and service', (source, zh, en, service) => {
    expect(
      getContactServiceContext(contact(`?from=${encodeURIComponent(source)}&entry=hero`), 'zh-CN')
    ).toEqual({
      preselectedService: service,
      sourceLabel: zh,
    })
    expect(
      getContactServiceContext(contact(`?from=${encodeURIComponent(source)}&entry=hero`), 'en')
    ).toEqual({
      preselectedService: service,
      sourceLabel: en,
    })
  })

  it('maps finder-only needs and regions to their most specific service options', () => {
    expect(getContactServiceContext(contact('?need=garment-care&region=east-china'), 'en')).toEqual(
      { preselectedService: '后整修复', sourceLabel: null }
    )
    expect(
      getContactServiceContext(contact('?need=ecommerce-fulfilment&region=east-china'), 'zh-CN')
    ).toEqual({ preselectedService: '华东鞋服云仓', sourceLabel: null })
    expect(
      getContactServiceContext(contact('?need=ecommerce-fulfilment&region=south-china'), 'zh-CN')
    ).toEqual({ preselectedService: '华南鞋服云仓', sourceLabel: null })
    expect(
      getContactServiceContext(contact('?need=ecommerce-fulfilment&region=any'), 'zh-CN')
    ).toEqual({ preselectedService: '鞋服云仓', sourceLabel: null })
    expect(
      getContactServiceContext(contact('?need=store-replenishment&region=any'), 'zh-CN')
    ).toEqual({ preselectedService: 'B2B门店仓配', sourceLabel: null })
  })

  it('keeps case-only and manual contact contexts without a source label', () => {
    expect(getContactServiceContext(contact('?case=ur'), 'zh-CN')).toEqual({
      preselectedService: null,
      sourceLabel: null,
    })
    expect(getContactServiceContext(contact(), 'zh-CN')).toEqual({
      preselectedService: null,
      sourceLabel: null,
    })
  })

  it('rejects invalid or duplicate source and finder parameters', () => {
    const queries = [
      '?from=%2Fxiefu-yuncang&from=%2Ftuihuo-zhijian&entry=hero',
      '?from=constructor&entry=hero',
      '?from=%2Fxiefu-yuncang&entry=constructor',
      '?need=ecommerce-fulfilment&need=garment-care&region=any',
      '?need=constructor&region=any',
      '?need=ecommerce-fulfilment&region=constructor',
    ]
    for (const query of queries) {
      expect(getContactServiceContext(contact(query), 'zh-CN')).toEqual({
        preselectedService: null,
        sourceLabel: null,
      })
    }
  })

  it('keeps a valid source when finder parameters are invalid', () => {
    expect(
      getContactServiceContext(
        contact('?from=%2Fxiefu-yuncang&entry=hero&need=constructor&region=any'),
        'en'
      )
    ).toEqual({ preselectedService: '鞋服云仓', sourceLabel: 'Apparel fulfilment' })
  })

  it('keeps one service when source and finder independently select the same service', () => {
    expect(
      getContactServiceContext(
        contact('?from=%2Fxiefu-yuncang&entry=hero&need=ecommerce-fulfilment&region=south-china'),
        'en'
      )
    ).toEqual({ preselectedService: '鞋服云仓', sourceLabel: 'Apparel fulfilment' })
  })

  it('clears both source display and preselection when valid sources conflict', () => {
    expect(
      getContactServiceContext(
        contact('?from=%2Ftuihuo-zhijian&entry=hero&need=ecommerce-fulfilment&region=any'),
        'en'
      )
    ).toEqual({ preselectedService: null, sourceLabel: null })
  })
})
