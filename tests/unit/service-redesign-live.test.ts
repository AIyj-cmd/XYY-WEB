import { describe, expect, it } from 'vitest'
import { groupLiveFeatures, groupLiveStats } from '@/components/service/redesign/live-content'
import { toLivePublicCopy } from '@/components/service/redesign/live-public-copy'
import { CLAIM_TEXT } from '@/lib/claims'
import type { FaqItem, FeatureItem, StatItem } from '@/data/service'
import type { ServicePageContent } from '@/lib/directus-content-queries'

const oldContent: ServicePageContent = {
  title: '直播电商仓配｜爆单弹性、库存同步与退货处理｜新亦源',
  description: `新亦源直播电商仓配支持多平台订单协同，以弹性产能应对爆单，实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}，${CLAIM_TEXT.shippingSla}，并提供退货质检与二次上架。`,
  breadcrumbLabel: '直播电商仓配',
  eyebrow: '直播电商仓配 · 爆单弹性 + 多平台实时同步',
  h1: '直播电商仓配：应对爆单、库存与退货',
  h1sub: '多平台订单协同与弹性履约',
  heroDesc: `新亦源直播电商仓配以弹性产能和多平台库存同步为核心，支持主流直播电商平台；动态人力池支持小时级调配，单仓峰值${CLAIM_TEXT.singleWarehousePeak}，帮助直播品牌和代播机构稳定履约。`,
  imgSrc: '/live.jpg',
  imgAlt: '直播仓配',
  contentDesc: `适合主流直播电商平台的服饰主播和品牌自播团队。直播订单集中、多平台库存同步和退货处理是主要难点。新亦源以动态人力池支持小时级调配，可按项目实时同步库存、降低超卖风险，退货质检与二次上架${CLAIM_TEXT.returnTurnaround}完成。`,
  featuresLabel: '直播仓配核心能力',
  features: [
    {
      title: '爆单弹性产能',
      desc: `直播大场前提前预排班，动态人力池支持小时级调配，单仓峰值${CLAIM_TEXT.singleWarehousePeak}。`,
    },
    {
      title: '多平台库存同步',
      desc: '可按项目与直播平台或品牌系统对接订单和库存，降低因库存更新不及时造成的超卖风险；接口可用范围以联调结果为准。',
    },
    {
      title: '波次分配',
      desc: '直播出单后由系统生成作业波次，结合RFID定位和复核流程组织批量拣货，具体产能按场次计划确认。',
    },
    { title: CLAIM_TEXT.shippingSla, desc: CLAIM_TEXT.shippingSla },
    {
      title: '高退货率快速处理',
      desc: `直播电商退货就近回收至广州/华南仓，${CLAIM_TEXT.returnTurnaround}内完成拆包核对、质检分级、修复整理、二次上架，快速补充可售库存。`,
    },
    {
      title: '代播机构专属方案',
      desc: '针对MCN机构和代播服务商提供多品牌共仓方案，按品牌独立分区管理，系统权限隔离，单独出库单和报表，满足多客户管理需求。',
    },
  ],
  stats: [
    { stat: CLAIM_TEXT.singleWarehousePeak, label: '单仓峰值', sub: '动态人力池小时级调配' },
    { stat: CLAIM_TEXT.shippingSla, label: '截单时间', sub: '正向订单履约规则' },
    { stat: CLAIM_TEXT.inventoryAccuracy, label: '库存准确率', sub: 'RFID+多平台实时同步' },
    { stat: '主流平台', label: '直播电商协同', sub: '接口范围按项目确认' },
  ],
}

const oldFaqs: FaqItem[] = [
  {
    q: 'q1',
    a: '主要差异在三点：①直播订单可能短时间集中，需要仓库具备弹性扩产能力；②库存同步要求更高，需要减少平台库存与仓内实物库存的时间差；③退货处理通常需要与正向履约协同。新亦源围绕产能、库存和退货建立相应流程。',
  },
  {
    q: 'q2',
    a: '支持主流直播电商平台，可按项目评估订单、库存、发货与退货数据对接。平台授权、接口可用性、字段范围和联调周期以项目确认及平台当前规则为准。',
  },
  {
    q: 'q3',
    a: `可以按场次评估。新亦源在大促或直播前根据预测货量安排仓容、人力、包材和物流通道，并通过动态人力池、多仓协同和波次作业扩充产能；实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}。品牌应尽早提供场次和备货计划，以便确认项目保障方案。`,
  },
  {
    q: 'q4',
    a: `超卖可能来自库存同步延迟、平台活动占用、取消回补或人工调整等因素。项目可通过库存同步、订单校验、库存预警和异常拦截降低风险；当前公开的库存准确率为${CLAIM_TEXT.inventoryAccuracy}。异常处置方式按平台规则和双方项目方案执行。`,
  },
  {
    q: 'q5',
    a: '可以。新亦源为MCN机构和代播服务商提供多品牌共仓方案：①各品牌独立分区存储，互不混仓；②系统账号权限隔离，每个品牌只能看自己的库存和订单；③独立出库单和账单，对账清晰；④支持代播机构统一结算，也支持各品牌方分别结算。具体方案根据品牌数量和SKU规模定制。',
  },
]

describe('live redesign grouping', () => {
  it('keeps semantic stage features and unknown content exactly once', () => {
    const unknown = '改名后的直播服务'
    const groups = groupLiveFeatures([
      { title: '爆单弹性产能', desc: '备货' },
      { title: '多平台库存同步', desc: '同步' },
      { title: '波次分配', desc: '波次' },
      { title: CLAIM_TEXT.shippingSla, desc: '时点' },
      { title: '高退货率快速处理', desc: '退货' },
      { title: '代播机构专属方案', desc: 'MCN' },
      { title: unknown, desc: '完整保留' },
    ])
    expect(
      Object.values(groups)
        .flat()
        .map(({ title }) => title)
    ).toEqual([
      '爆单弹性产能',
      '多平台库存同步',
      '波次分配',
      CLAIM_TEXT.shippingSla,
      '高退货率快速处理',
      '代播机构专属方案',
      unknown,
    ])
  })

  it('distributes stats by labels without relying on array positions', () => {
    const groups = groupLiveStats([
      { stat: 'fixture-inventory-accuracy', label: '库存准确率', sub: '同步' },
      { stat: CLAIM_TEXT.shippingSla, label: '截单时间', sub: '正向订单履约规则' },
      { stat: CLAIM_TEXT.singleWarehousePeak, label: '单仓峰值', sub: '预排班' },
      { stat: '主流平台', label: '直播电商协同', sub: '联调' },
      { stat: '未知', label: '自定义统计', sub: '按需确认' },
    ])
    expect(groups.peak).toHaveLength(1)
    expect(groups.sync).toHaveLength(2)
    expect(groups.after).toHaveLength(1)
    expect(groups.support).toEqual([{ stat: '未知', label: '自定义统计', sub: '按需确认' }])
    expect(Object.values(groups).flat()).toHaveLength(5)
  })

  it('maps exact legacy copy fields, six features, four stats, and FAQ answers without mutation', () => {
    const input = structuredClone(oldContent)
    const faqs = structuredClone(oldFaqs)
    const inputBefore = structuredClone(input)
    const faqsBefore = structuredClone(faqs)
    const output = toLivePublicCopy(input, faqs)

    expect(output.content.title).toBe('直播电商仓配｜场次备货、集中出单与退货处理｜新亦源')
    expect(output.content.description).toBe(
      '面向品牌自播和代播团队，围绕场次备货、集中出单、发货跟进与退货处理安排仓内作业。'
    )
    expect(output.content.eyebrow).toBe('直播电商仓配')
    expect(output.content.h1).toBe('直播电商仓配')
    expect(output.content.h1sub).toBe('接住集中订单，跟上每场直播。')
    expect(output.content.heroDesc).toContain('从开播前备货')
    expect(output.content.contentDesc).toBe('连接订单、库存与发货状态，减少多平台卖货时的信息差。')
    expect(output.content.features).toHaveLength(6)
    expect(output.content.features[4].title).toBe('退货质检与二次上架')
    expect(output.content.stats).toHaveLength(4)
    expect(output.content.stats[2].sub).toBe('出入库核对与库存管理')
    expect(output.faqs[0].a).toContain('短时间内集中')
    expect(output.faqs[1].a).toContain('平台授权')
    expect(output.faqs[3].a).toContain('不表示同步速度或零超卖')
    expect(input).toEqual(inputBefore)
    expect(faqs).toEqual(faqsBefore)
  })

  it('preserves empty, custom, near-match, and unknown input values exactly', () => {
    const unknownFeature: FeatureItem = { title: '新增直播服务', desc: '由 CMS 提供的说明。' }
    const nearFeature: FeatureItem = {
      title: oldContent.features[1].title,
      desc: `${oldContent.features[1].desc} `,
    }
    const unknownStat: StatItem = { stat: '按需', label: '未知统计', sub: '自定义说明' }
    const nearStat: StatItem = { ...oldContent.stats[2], sub: `${oldContent.stats[2].sub} ` }
    const content: ServicePageContent = {
      ...oldContent,
      title: '',
      description: '自定义 description',
      breadcrumbLabel: '自定义 breadcrumbLabel',
      eyebrow: '自定义 eyebrow',
      h1: '',
      h1sub: '自定义 h1sub',
      heroDesc: '自定义 heroDesc',
      imgSrc: '/custom-live-image.webp',
      imgAlt: '自定义 imgAlt',
      contentDesc: '自定义 contentDesc',
      featuresLabel: '自定义 featuresLabel',
      features: [nearFeature, unknownFeature],
      stats: [nearStat, unknownStat],
    }
    const faqs: FaqItem[] = [{ q: '自定义问题？', a: '自定义回答。' }]
    const before = structuredClone(content)
    const faqsBefore = structuredClone(faqs)
    const output = toLivePublicCopy(content, faqs)

    expect(output.content).toEqual(content)
    expect(output.faqs).toEqual(faqs)
    expect(Object.values(groupLiveFeatures(output.content.features)).flat()).toHaveLength(2)
    expect(Object.values(groupLiveStats(output.content.stats)).flat()).toHaveLength(2)
    expect(content).toEqual(before)
    expect(faqs).toEqual(faqsBefore)
  })
})
