import { describe, expect, it } from 'vitest'
import { SOUTH_WAREHOUSE_CITIES } from '@/data/service/south-network'
import { CLAIM_TEXT } from '@/lib/claims'
import { hasRedesignContent } from '@/components/service/redesign/content-presence'
import {
  groupSouthFeatures,
  groupSouthStats,
  summarizeSouthHeroDescription,
} from '@/components/service/redesign/south-content'
import { toSouthPublicCopy } from '@/components/service/redesign/south-public-copy'

describe('south network content grouping', () => {
  it('keeps every city, service, and unknown feature exactly once', () => {
    const features = [
      '广州区域节点',
      '东莞区域节点',
      '佛山区域节点',
      '肇庆区域节点',
      '华南退货质检中心',
      '华南产业链协同',
      '改名后的补充说明',
    ].map((title) => ({ title, desc: `${title}完整说明` }))
    const groups = groupSouthFeatures(features)
    const rendered = Object.values(groups.cities)
      .flat()
      .concat(groups.returns, groups.industry, groups.other)

    expect(rendered).toHaveLength(features.length)
    expect(rendered.map(({ title }) => title)).toEqual([
      '广州仓库',
      '东莞仓库',
      '佛山仓库',
      '肇庆仓库',
      '华南退货质检中心',
      '货源入仓与库存安排',
      '改名后的补充说明',
    ])
  })

  it('preserves custom South feature text', () => {
    const groups = groupSouthFeatures([
      { title: '佛山区域节点', desc: '提供区域仓配协同，广州主仓不参与。' },
    ])
    expect(groups.cities.佛山[0]).toEqual({
      title: '佛山仓库',
      desc: '提供区域仓配协同，广州主仓不参与。',
    })
  })

  it('keeps address source exact and preserves partial content without reviving all-empty CMS data', () => {
    expect(
      SOUTH_WAREHOUSE_CITIES.flatMap<{ name: string; address: string }>(
        ({ warehouses }) => warehouses
      )
    ).toEqual([
      { name: '黄埔仓', address: '广东省广州市黄埔区果园一路2号' },
      { name: '兴泰仓（番禺仓）', address: '广东省广州市番禺区石楼镇华山路2号' },
      { name: '新塘仓', address: '暂不公布' },
      { name: '智谷仓', address: '东莞市常平镇多宝路2号常平智谷' },
      { name: '朗州仓', address: '东莞市常平镇朗洲村鸿腾缘工业园' },
      { name: '桥头仓', address: '东莞市桥头镇多宝路2号常平桥头' },
      { name: '云谷仓', address: '暂不公布' },
      { name: '宏盛仓（佛山仓）', address: '广东省佛山市三水区大塘镇大塘园区园东一路' },
      { name: '四会仓（肇庆仓）', address: '肇庆市四会市东城街道唯品会物流园20号库' },
    ])
    const empty = { h1: '', h1sub: '', heroDesc: '', contentDesc: '', features: [], stats: [] }
    expect(hasRedesignContent(empty as never, 0)).toBe(false)
    expect(hasRedesignContent({ ...empty, stats: [{}] } as never, 0)).toBe(true)
    expect(hasRedesignContent(empty as never, 1)).toBe(true)
  })

  it('assigns every stat to one presentation area', () => {
    const stats = [
      { stat: '18:00前', label: '华南仓网截单时间', sub: '当日发出' },
      { stat: '4区域', label: '华南仓网', sub: '四城仓库' },
      { stat: '全渠道', label: '仓配模式', sub: '订单服务' },
      { stat: '30万㎡+', label: '华南直营仓储', sub: '多仓布局' },
      { stat: '按需', label: '未知范围', sub: '项目确认' },
    ]
    expect(Object.values(groupSouthStats(stats)).flat()).toHaveLength(stats.length)
  })

  it('summarizes only the exact legacy CMS hero description', () => {
    const legacy =
      '新亦源华南鞋服云仓直营仓储30万㎡+，华南多仓布局覆盖广州、东莞、佛山、肇庆，支持B2C、B2B、全渠道库存协同及退货质检。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日；具体启用仓点、仓容和到达时效以项目方案及线路SLA为准。'
    const summary =
      '广州、东莞、佛山、肇庆多仓布局，支持 B2C、B2B、全渠道库存协同、退货质检及区域配送。'

    expect(summarizeSouthHeroDescription(legacy)).toBe(summary)
    expect(summarizeSouthHeroDescription(summary)).toBe(summary)
    expect(summarizeSouthHeroDescription('')).toBe('')
    expect(summarizeSouthHeroDescription('项目自定义说明。')).toBe('项目自定义说明。')
    expect(summarizeSouthHeroDescription(`${legacy} `)).toBe(`${legacy} `)
  })

  it('maps approved CMS fields only when every mapped field exactly matches', () => {
    const legacyContentDesc = `适合需要在华南布局库存的鞋服品牌，尤其涉及电商订单、门店补货、唯品会JIT/JITX和退货处理的项目。华南多仓布局覆盖广州、东莞、佛山、肇庆，${CLAIM_TEXT.shippingSla}。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日；具体启用仓点、仓容、承运商和到达时效以项目方案及线路SLA为准。`
    const legacyReturn = `广州主仓设置专属退货质检与后整修复中心，华南区域退货可就近处理，减少跨城运输成本，退货${CLAIM_TEXT.returnTurnaround}内完成质检二次上架。`
    const legacyFaq = `仓内正向履约口径为${CLAIM_TEXT.shippingSla}。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日；具体以线路SLA为准。`
    const content = {
      description:
        '新亦源华南鞋服云仓直营仓储30万㎡+，华南多仓布局覆盖广州、东莞、佛山、肇庆，支持B2C、B2B、全渠道库存协同及退货质检，具体启用仓点和线路方案由双方确认。',
      contentDesc: legacyContentDesc,
      featuresLabel: '华南仓网节点',
      features: [
        {
          title: '广州区域节点',
          desc: '服务广州及珠三角鞋服品牌的电商仓配、门店补货和退货处理；实际启用仓点与仓容按项目确认。',
        },
        { title: '华南退货质检中心', desc: legacyReturn },
        {
          title: '华南产业链协同',
          desc: '可结合广州、东莞、佛山等地鞋服产业资源组织工厂入仓、库存管理和订单履约，具体流程按项目确认。',
        },
      ],
    }
    const faqs = [{ q: '时效', a: legacyFaq }]
    const original = structuredClone({ content, faqs })
    const result = toSouthPublicCopy(content as never, faqs)

    expect({ content, faqs }).toEqual(original)
    expect(result.content.features.map(({ title }) => title)).toEqual([
      '广州仓库',
      '各仓退货质检',
      '货源入仓与库存安排',
    ])
    expect(result.content.contentDesc).toContain('具体以双方约定的配送方案为准。')
    expect(result.faqs[0].a).toContain('其他地区及具体订单的到达时间')

    const nearMatch = {
      ...content,
      contentDesc: `${legacyContentDesc} `,
      features: [
        { title: '广州区域节点', desc: '' },
        { title: '华南退货质检中心', desc: `${legacyReturn} ` },
      ],
    }
    const nearFaqs = [
      { q: '时效', a: `${legacyFaq} ` },
      { q: '空', a: '' },
    ]
    const nearResult = toSouthPublicCopy(nearMatch as never, nearFaqs)
    expect(nearResult.content.contentDesc).toBe(nearMatch.contentDesc)
    expect(nearResult.content.features).toEqual(nearMatch.features)
    expect(nearResult.faqs).toEqual(nearFaqs)

    const custom = {
      description: '自定义说明',
      contentDesc: '自定义正文',
      featuresLabel: '自定义标签',
      features: [{ title: '广州区域节点', desc: '自定义节点说明' }],
    }
    expect(toSouthPublicCopy(custom as never, [{ q: 'Q', a: '自定义回答' }])).toEqual({
      content: custom,
      faqs: [{ q: 'Q', a: '自定义回答' }],
    })
  })
})
