import { describe, expect, it } from 'vitest'

import { getContactServiceContext } from '@/lib/contact/service-context'

const sources = [
  ['/xiefu-yuncang', '鞋服云仓', 'Apparel fulfilment', 'cloud-warehouse'],
  ['/huadong-xiefu-yuncang', '华东鞋服云仓', 'East China fulfilment', 'cloud-warehouse'],
  ['/kuajing-yuncang', '跨境云仓', 'Cross-border fulfilment', 'cloud-warehouse'],
  ['/huanan-xiefu-yuncang', '华南鞋服云仓', 'South China fulfilment', 'cloud-warehouse'],
  ['/zhibo-cangpei', '直播电商仓配', 'Livestream fulfilment', 'cloud-warehouse'],
  ['/b2b-mendian-cangpei', 'B2B门店仓配', 'Retail distribution', 'cloud-warehouse'],
  ['/tuihuo-zhijian', '退货质检', 'Returns inspection', 'quality-inspection'],
  ['/houzheng-xiufu', '后整修复', 'Garment care and repair', 'quality-inspection'],
  ['/wuliu-shuzihua', '物流数字化能力', 'Digital operations', 'logistics-cloud'],
  ['/yundao-zhineng-jijian', '运到智能寄件平台', 'Smart shipping platform', 'logistics-cloud'],
  ['/en/apparel-fulfillment', '鞋服云仓', 'Apparel fulfilment', 'cloud-warehouse'],
  ['/en/cross-border-fulfillment', '跨境云仓', 'Cross-border fulfilment', 'cloud-warehouse'],
  ['/en/south-china-fulfillment', '华南鞋服云仓', 'South China fulfilment', 'cloud-warehouse'],
  ['/en/east-china-fulfillment', '华东鞋服云仓', 'East China fulfilment', 'cloud-warehouse'],
  ['/en/livestream-fulfillment', '直播电商仓配', 'Livestream fulfilment', 'cloud-warehouse'],
  ['/en/returns-inspection', '退货质检', 'Returns inspection', 'quality-inspection'],
  ['/en/garment-care', '后整修复', 'Garment care and repair', 'quality-inspection'],
  ['/en/retail-distribution', 'B2B门店仓配', 'Retail distribution', 'cloud-warehouse'],
  ['/en/digital-operations', '物流数字化能力', 'Digital operations', 'logistics-cloud'],
  ['/en/smart-shipping', '运到智能寄件平台', 'Smart shipping platform', 'logistics-cloud'],
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

  it('keeps finder-only, case-only and manual contact contexts without a source label', () => {
    expect(getContactServiceContext(contact('?need=garment-care&region=east-china'), 'en')).toEqual(
      { preselectedService: 'quality-inspection', sourceLabel: null }
    )
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
    ).toEqual({ preselectedService: 'cloud-warehouse', sourceLabel: 'Apparel fulfilment' })
  })

  it('keeps one service when source and finder independently select the same service', () => {
    expect(
      getContactServiceContext(
        contact('?from=%2Fxiefu-yuncang&entry=hero&need=ecommerce-fulfilment&region=south-china'),
        'en'
      )
    ).toEqual({ preselectedService: 'cloud-warehouse', sourceLabel: 'Apparel fulfilment' })
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
