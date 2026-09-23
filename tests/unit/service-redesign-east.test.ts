import { describe, expect, it } from 'vitest'
import { groupEastFeatures, groupEastStats } from '@/components/service/redesign/east-content'
import { toEastPublicCopy } from '@/components/service/redesign/east-public-copy'
import { hasRedesignContent } from '@/components/service/redesign/content-presence'
import { CLAIM_TEXT } from '@/lib/claims'
import type { FaqItem, StatItem } from '@/data/service'
import type { ServicePageContent } from '@/lib/directus-content-queries'

const baseContent: ServicePageContent = {
  title: '华东鞋服云仓｜上海、昆山、合肥区域仓配｜新亦源',
  description:
    '新亦源华东鞋服云仓覆盖上海、昆山、合肥，上海青浦为核心节点之一，支持B2C、B2B、全渠道库存协同及退货质检。华东主要城市参考次日达，具体启用仓点、仓容、线路和到达时效以项目方案及合同SLA为准。',
  breadcrumbLabel: '华东鞋服云仓',
  eyebrow: '华东鞋服云仓 · 上海青浦，长三角核心节点',
  h1: '华东鞋服云仓：上海、昆山、合肥区域仓网',
  h1sub: '服务华东品牌的全渠道仓配节点',
  heroDesc:
    '华东仓网覆盖上海、昆山、合肥，上海青浦为核心节点之一，支持B2C全渠道、B2B门店补货及退货质检。华东主要城市参考次日达，具体启用仓点、仓容、线路和到达时效以项目方案及合同SLA为准。',
  imgSrc: '/w-hq.webp',
  imgAlt: '华东鞋服云仓仓储服务',
  contentDesc:
    '适合需要在长三角及华东布局库存的鞋服品牌。华东仓网覆盖上海、昆山、合肥，上海青浦为核心节点之一，可规划B2C、B2B和退货质检服务，并与华南仓网协同库存。华东主要城市参考次日达；具体启用仓点、仓容、承运商、线路和到达时效以项目方案及合同SLA为准。',
  featuresLabel: '华东仓核心能力',
  stats: [
    { stat: '3区域', label: '华东仓网', sub: '上海、昆山、合肥' },
    { stat: '全渠道', label: '仓配模式', sub: 'B2C+B2B+退货处理' },
    { stat: '18:00前', label: '截单时间', sub: '当日24:00前发出' },
    { stat: '不收', label: '系统使用费', sub: '接口实施和定制费用按方案确认' },
  ],
  features: [],
}

const legacyFeatures = [
  [
    '华东区域仓网',
    '覆盖上海、昆山、合肥，上海青浦为核心节点之一；上海仓地址为上海市青浦区白鹤镇外青松公路3939号B-3-3。各项目实际启用仓点、仓容和业务范围由双方确认。',
  ],
  [
    '华东B2C全渠道发货',
    '支持天猫、京东、拼多多、抖音电商、快手等主流平台华东区域发货，华东本地订单从华东仓发出，时效优于从广州华南仓发货。',
  ],
  [
    'B2B华东门店补货',
    '承接华东区域品牌连锁门店、批发商、加盟商的B2B补货配送，按门店分仓分拣，货架标签齐全，支持整件发货或拆零分发。',
  ],
  [
    '华东退货就近处理',
    `华东区域退货可按项目回收至启用仓点，退货质检与二次上架${CLAIM_TEXT.returnTurnaround}完成，减少跨区回流。`,
  ],
  [
    '华东华南仓网协同',
    'OMS可统一查看多仓库存，并按项目配置订单路由和补货策略；实际分仓规则由双方确认。',
  ],
  [
    '长三角本地商务支持',
    '华东有专属商务BD，可上门洽谈，方便上海、杭州、苏州等地品牌快速开始合作。',
  ],
] as const

const legacyFaqs: FaqItem[] = [
  {
    q: '新亦源华东仓在哪里？适合哪些品牌？',
    a: '华东仓网覆盖上海、昆山和合肥，上海青浦为核心节点之一，适合供应链或主要消费市场位于华东、需要区域库存和门店补货协同的鞋服品牌。上海仓地址为上海市青浦区白鹤镇外青松公路3939号B-3-3；实际启用仓点、仓容和作业范围在项目启动前确认。',
  },
  {
    q: '华东仓规模多大？能应对大促爆单吗？',
    a: '上海青浦仓是华东仓网核心节点之一，大促期间可通过弹性人力机制调整产能；品牌也可结合昆山、合肥及华南仓网规划库存。具体仓容请联系商务团队评估。',
  },
  {
    q: '华东仓收费与广州仓有区别吗？',
    a: '费用通常由仓储、操作、系统实施和增值服务组成，具体单价受启用仓点、SKU、吞吐量和服务范围影响。品牌可提供业务数据，由商务团队形成项目报价。',
  },
]

describe('east public copy and content grouping', () => {
  it('maps only exact legacy fields and does not mutate the input', () => {
    const content = {
      ...baseContent,
      features: legacyFeatures.map(([title, desc]) => ({ title, desc })),
    }
    const before = structuredClone(content)
    const faqs = structuredClone(legacyFaqs)
    const output = toEastPublicCopy(content, faqs)

    expect(output.content.title).toBe('华东鞋服云仓｜上海、昆山、合肥仓配｜新亦源')
    expect(output.content.description).toContain('各仓均具备质检能力')
    expect(output.content.h1).toBe('华东鞋服云仓')
    expect(output.content.h1sub).toBe('')
    expect(output.content.features.map(({ title }) => title)).toEqual([
      '华东仓库分布',
      '华东电商发货',
      '华东门店补货',
      '华东退货质检',
      '华东华南库存协同',
      '本地团队沟通',
    ])
    expect(output.faqs[0].q).toBe('新亦源华东仓在哪里？适合哪些品牌？')
    expect(output.faqs[0].a).toContain('各仓均具备质检能力')
    expect(output.faqs[1].q).toBe('大促期间如何安排仓储和发货？')
    expect(output.faqs[1].a).toContain('大促前可提前沟通库存')
    expect(output.faqs[2].q).toBe('仓配费用如何计算？')
    expect(output.faqs[2].a).toContain('系统使用费不收')
    expect(content).toEqual(before)
    expect(faqs).toEqual(legacyFaqs)
  })

  it('preserves empty, custom, and near-match content exactly', () => {
    const content: ServicePageContent = {
      ...baseContent,
      title: '',
      description: '',
      eyebrow: '',
      h1: '',
      h1sub: '',
      heroDesc: '',
      contentDesc: '自定义说明，不应被覆盖。',
      featuresLabel: '自定义标签',
      features: [
        { title: '华东区域仓网', desc: '只改一个字的近似文案。' },
        { title: '未知能力', desc: '未知能力的长说明保持不变。' },
      ],
      stats: [],
    }
    const before = structuredClone(content)
    const faqs: FaqItem[] = [{ q: '自定义问题', a: '自定义答案' }]
    const output = toEastPublicCopy(content, faqs)

    expect(output.content).toEqual(content)
    expect(output.faqs).toEqual(faqs)
    expect(content).toEqual(before)
  })

  it('keeps six recognized features and unknown features exactly once', () => {
    const features = [...legacyFeatures, ['未知能力', '未知能力说明']] as const
    const groups = groupEastFeatures(features.map(([title, desc]) => ({ title, desc })))
    const flattened = Object.values(groups).flat()
    expect(flattened).toHaveLength(features.length)
    expect(flattened.map(({ title }) => title).sort()).toEqual(
      features.map(([title]) => title).sort()
    )
    expect(groups.support.map(({ title }) => title)).toEqual(['长三角本地商务支持', '未知能力'])
  })

  it('assigns each stat once and keeps empty content unavailable', () => {
    const stats: StatItem[] = [
      { stat: '3区域', label: '华东仓网', sub: '上海、昆山、合肥' },
      { stat: '全渠道', label: '仓配模式', sub: 'B2C+B2B+退货处理' },
      { stat: '18:00前', label: '截单时间', sub: '当日24:00前发出' },
      { stat: '不收', label: '系统使用费', sub: '接口实施和定制费用按方案确认' },
      { stat: '未知', label: '其他范围', sub: '按需确认' },
    ]
    expect(Object.values(groupEastStats(stats)).flat()).toHaveLength(stats.length)
    expect(
      Object.values(groupEastStats(stats))
        .flat()
        .map(({ stat }) => stat)
        .sort()
    ).toEqual(stats.map(({ stat }) => stat).sort())
    expect(
      hasRedesignContent(
        {
          ...baseContent,
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
          features: [],
          stats: [],
        },
        0
      )
    ).toBe(false)
    expect(
      hasRedesignContent({ ...baseContent, h1: '华东鞋服云仓', features: [], stats: [] }, 0)
    ).toBe(true)
  })
})
