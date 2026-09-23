import { describe, expect, it } from 'vitest'
import { groupFootwearFeatures, groupFootwearStats } from '@/components/service/footwear/content'
import { toFootwearPublicCopy } from '@/components/service/footwear/public-copy'
import type { FaqItem, FeatureItem, StatItem } from '@/data/service'
import { BRAND_CLAIMS } from '@/lib/claims'
import type { ServicePageContent } from '@/lib/directus-content-queries'

const claim = {
  inventoryAccuracy: BRAND_CLAIMS.inventoryAccuracy.displayValue,
  shippingAccuracy: BRAND_CLAIMS.shippingAccuracy.displayValue,
  peak: BRAND_CLAIMS.singleWarehousePeak.displayValue,
  regionalPeak: BRAND_CLAIMS.regionalPeak.displayValue,
  partner: BRAND_CLAIMS.partnerBrands.displayValue,
  shippingSla: BRAND_CLAIMS.shippingSla.displayValue,
}
const shippingCutoff = claim.shippingSla.split('截单', 1)[0]
const feature = (title: string, desc: string): FeatureItem => ({ title, desc })
const stat = (value: string, label: string, sub: string): StatItem => ({ stat: value, label, sub })
const baseContent = (): ServicePageContent => ({
  title: '鞋服云仓',
  description: 'description',
  breadcrumbLabel: '鞋服云仓',
  eyebrow: 'eyebrow',
  h1: 'h1',
  h1sub: 'h1sub',
  heroDesc: 'hero',
  imgSrc: '',
  imgAlt: '',
  contentDesc: 'content',
  featuresLabel: 'features',
  stats: [],
  features: [],
})
const knownFeatures = (): FeatureItem[] => [
  feature('RFID智能识别', '围绕商品识别、款色码和拣货复核组织仓内作业，具体启用方式按项目确认。'),
  feature(
    '精细库存管控',
    `通过日常盘点与货品状态核对管理库存；${claim.inventoryAccuracy}为仓内库存准确率。`
  ),
  feature(
    '全渠道一盘货',
    '支持天猫、京东、拼多多、唯品会 JIT/JITX、抖音和小程序等渠道的订单协同，结合库存核对与出库安排。'
  ),
  feature(
    '深度定制WMS',
    '支持序列号、RFID、款色码管理及线上线下协同，可按项目使用奇门、EDI或定制接口；不收系统使用费，实施和定制费用按方案确认。'
  ),
  feature(
    '弹性产能机制',
    `大促前可根据预计货量安排仓容、人力、包材与作业；${claim.peak}为实际单仓单日运营峰值，${claim.regionalPeak}为地区运营峰值，具体项目安排按方案确认。`
  ),
  feature(
    '全程监控追溯',
    '保留拆包、操作台和关键区域的作业记录，支持按订单调取记录并按项目处理争议举证。'
  ),
]
const knownStats = (): StatItem[] => [
  stat(claim.shippingAccuracy, '发货准确率', '出库扫码复核与发货核对。'),
  stat(claim.peak, '单仓峰值', '实际单仓单日运营峰值；具体项目安排按方案确认。'),
  stat(
    shippingCutoff,
    '截单时间',
    `${claim.shippingSla}；送达时效受承运商线路、目的地和平台规则影响。`
  ),
  stat(claim.partner, '合作品牌', '新亦源合作品牌。'),
]
const knownFaqs = (): FaqItem[] => [
  { q: '鞋服云仓和普通仓库有什么区别？', a: '鞋服云仓围绕款色码、库存、订单和退货处理组织作业。' },
  { q: '新亦源鞋服云仓支持哪些电商平台对接？', a: '支持 B2C、B2B 和 O2O 全渠道协同。' },
]

describe('footwear public copy and grouping', () => {
  it('maps only exact known legacy values, preserves input, and pairs FAQ q+a', () => {
    const content = baseContent()
    content.title = '鞋服云仓服务｜B2C+B2B+O2O全渠道仓配｜新亦源'
    content.h1 = '鞋服云仓：全渠道一盘货与鞋服专用仓配'
    content.h1sub = 'B2C+B2B+O2O全渠道库存协同'
    content.features = [
      {
        title: '全渠道一盘货',
        desc: 'B2C+B2B+O2O库存实时同步，支持天猫、京东、拼多多、唯品会JIT/JITX、抖音、小程序等全渠道，降低超卖与空单风险。',
      },
      ...knownFeatures().slice(1),
      feature('自定义能力', '自定义原文'),
      feature('RFID智能识别', '近似描述'),
    ]
    content.stats = [...knownStats().reverse(), stat('custom', '未知指标', '未知说明')]
    const faqs = [
      {
        q: knownFaqs()[0].q,
        a: '鞋服云仓围绕鞋服高SKU、多色多码、退货率高和季节性波动等特点配置系统与流程：WMS针对序列号、RFID和款色码管理进行优化，可同时对接天猫、京东、唯品会、抖音等多平台订单；仓内提供退货质检、瑕疵修复和二次上架，形成正向与逆向履约闭环；动态人力池和多仓协同用于应对旺季货量变化。',
      },
      knownFaqs()[1],
      { q: knownFaqs()[0].q, a: '近似答案' },
    ]
    const before = structuredClone({ content, faqs })
    const result = toFootwearPublicCopy(content, faqs)
    expect(content).toEqual(before.content)
    expect(faqs).toEqual(before.faqs)
    expect(result.content.title).toBe('鞋服云仓服务｜款色码管理与全渠道仓配｜新亦源')
    expect(result.content.features[0].desc).toContain('唯品会 JIT/JITX')
    expect(result.content.features.at(-2)).toEqual(feature('自定义能力', '自定义原文'))
    expect(result.content.features.at(-1)).toEqual(feature('RFID智能识别', '近似描述'))
    expect(result.content.stats.at(-1)).toEqual(stat('custom', '未知指标', '未知说明'))
    expect(result.faqs[0].a).toContain('可按项目评估')
    expect(result.faqs[2]).toEqual(faqs[2])
  })

  it('keeps known features and stats classified after reordering and retains unknowns', () => {
    const features = [...knownFeatures()].reverse().concat(feature('未知能力', '保留此内容'))
    const stats = [...knownStats()].reverse().concat(stat('x', '未知指标', '保留此指标'))
    const groups = groupFootwearFeatures(features)
    const statGroups = groupFootwearStats(stats)
    expect(groups.goods.map((x) => x.title)).toEqual(['精细库存管控', 'RFID智能识别'])
    expect(groups.channels.map((x) => x.title)).toEqual(['深度定制WMS', '全渠道一盘货'])
    expect(groups.daily.map((x) => x.title)).toEqual(['全程监控追溯', '弹性产能机制'])
    expect(groups.unknown).toEqual([features.at(-1)])
    expect(statGroups.daily).toHaveLength(3)
    expect(statGroups.partner).toHaveLength(1)
    expect(statGroups.unknown).toEqual([stats.at(-1)])
  })
})
