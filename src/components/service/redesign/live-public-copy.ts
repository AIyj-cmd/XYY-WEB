import type { FaqItem, FeatureItem } from '@/data/service'
import type { ServicePageContent } from '@/lib/directus-content-queries'
import { CLAIM_TEXT } from '@/lib/claims'

const oldDescription = `新亦源直播电商仓配支持多平台订单协同，以弹性产能应对爆单，实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}，${CLAIM_TEXT.shippingSla}，并提供退货质检与二次上架。`
const oldHero = `新亦源直播电商仓配以弹性产能和多平台库存同步为核心，支持主流直播电商平台；动态人力池支持小时级调配，单仓峰值${CLAIM_TEXT.singleWarehousePeak}，帮助直播品牌和代播机构稳定履约。`
const oldContent = `适合主流直播电商平台的服饰主播和品牌自播团队。直播订单集中、多平台库存同步和退货处理是主要难点。新亦源以动态人力池支持小时级调配，可按项目实时同步库存、降低超卖风险，退货质检与二次上架${CLAIM_TEXT.returnTurnaround}完成。`

const textMap = new Map<string, string>([
  [
    '直播电商仓配｜爆单弹性、库存同步与退货处理｜新亦源',
    '直播电商仓配｜场次备货、集中出单与退货处理｜新亦源',
  ],
  [
    oldDescription,
    '面向品牌自播和代播团队，围绕场次备货、集中出单、发货跟进与退货处理安排仓内作业。',
  ],
  ['直播电商仓配 · 爆单弹性 + 多平台实时同步', '直播电商仓配'],
  ['直播电商仓配：应对爆单、库存与退货', '直播电商仓配'],
  ['多平台订单协同与弹性履约', '接住集中订单，跟上每场直播。'],
  [oldHero, '从开播前备货，到订单发出与退货处理，为品牌自播和代播团队衔接仓内作业。'],
  [oldContent, '连接订单、库存与发货状态，减少多平台卖货时的信息差。'],
  ['直播仓配核心能力', '直播仓配服务'],
])

const featureMap = new Map<string, FeatureItem>([
  [
    `爆单弹性产能\u0000直播大场前提前预排班，动态人力池支持小时级调配，单仓峰值${CLAIM_TEXT.singleWarehousePeak}。`,
    {
      title: '爆单弹性产能',
      desc: `直播前可按场次计划安排备货、包材与人手；${CLAIM_TEXT.singleWarehousePeak}为实际单仓单日运营峰值。`,
    },
  ],
  [
    '多平台库存同步\u0000可按项目与直播平台或品牌系统对接订单和库存，降低因库存更新不及时造成的超卖风险；接口可用范围以联调结果为准。',
    {
      title: '多平台库存同步',
      desc: '可按项目对接订单和库存，结合库存校验与异常跟进降低超卖风险；接口范围以联调结果为准。',
    },
  ],
  [
    '波次分配\u0000直播出单后由系统生成作业波次，结合RFID定位和复核流程组织批量拣货，具体产能按场次计划确认。',
    {
      title: '波次分配',
      desc: '集中出单后按作业波次组织拣货与复核，具体作业安排结合场次计划确认。',
    },
  ],
  [
    `${CLAIM_TEXT.shippingSla}\u0000${CLAIM_TEXT.shippingSla}`,
    { title: CLAIM_TEXT.shippingSla, desc: '按项目约定安排截单、打包与出库。' },
  ],
  [
    `高退货率快速处理\u0000直播电商退货就近回收至广州/华南仓，${CLAIM_TEXT.returnTurnaround}内完成拆包核对、质检分级、修复整理、二次上架，快速补充可售库存。`,
    {
      title: '退货质检与二次上架',
      desc: `退货拆包核对、质检分级后，符合重新销售条件的商品按服务约定在${CLAIM_TEXT.returnTurnaround}内完成质检与二次上架；需修复的商品另行评估。`,
    },
  ],
  [
    '代播机构专属方案\u0000针对MCN机构和代播服务商提供多品牌共仓方案，按品牌独立分区管理，系统权限隔离，单独出库单和报表，满足多客户管理需求。',
    {
      title: '多品牌共仓方案',
      desc: '可按品牌分区管理货品，配置库存和订单查看权限，提供独立出库单与报表。',
    },
  ],
])

const statMap = new Map<string, { sub: string }>([
  [
    `${CLAIM_TEXT.singleWarehousePeak}\u0000单仓峰值\u0000动态人力池小时级调配`,
    { sub: '实际单仓单日运营峰值，具体安排按场次计划确认。' },
  ],
  ['18:00前\u0000截单时间\u0000当日24:00前发出', { sub: '按项目约定安排截单、打包与出库。' }],
  [
    `${CLAIM_TEXT.inventoryAccuracy}\u0000库存准确率\u0000RFID+多平台实时同步`,
    { sub: '出入库核对与库存管理' },
  ],
  [
    '主流平台\u0000直播电商协同\u0000接口范围按项目确认',
    { sub: '接入前确认你使用的平台、系统和需要同步的数据。' },
  ],
])

const faqMap = new Map<string, string>([
  [
    '主要差异在三点：①直播订单可能短时间集中，需要仓库具备弹性扩产能力；②库存同步要求更高，需要减少平台库存与仓内实物库存的时间差；③退货处理通常需要与正向履约协同。新亦源围绕产能、库存和退货建立相应流程。',
    '直播订单会在短时间内集中，需要提前安排备货与作业；同时要衔接库存信息、发货和退货处理。具体资源与流程会结合场次计划确认。',
  ],
  [
    '支持主流直播电商平台，可按项目评估订单、库存、发货与退货数据对接。平台授权、接口可用性、字段范围和联调周期以项目确认及平台当前规则为准。',
    '可按项目评估订单、库存、发货与退货数据对接。平台授权、接口可用性、字段范围和联调安排以项目确认及平台当前规则为准。',
  ],
  [
    `可以按场次评估。新亦源在大促或直播前根据预测货量安排仓容、人力、包材和物流通道，并通过动态人力池、多仓协同和波次作业扩充产能；实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}。品牌应尽早提供场次和备货计划，以便确认项目保障方案。`,
    `可以按场次评估。直播前可根据预计订单安排仓容、人力、包材和物流通道；${CLAIM_TEXT.singleWarehousePeak}为实际单仓单日运营峰值，不代表单场保障量。请尽早提供场次和备货计划，以便确认服务安排。`,
  ],
  [
    `超卖可能来自库存同步延迟、平台活动占用、取消回补或人工调整等因素。项目可通过库存同步、订单校验、库存预警和异常拦截降低风险；当前公开的库存准确率为${CLAIM_TEXT.inventoryAccuracy}。异常处置方式按平台规则和双方项目方案执行。`,
    `超卖可能来自库存同步延迟、平台活动占用、取消回补或人工调整等因素。可通过库存同步、订单校验、预警和异常跟进降低风险；${CLAIM_TEXT.inventoryAccuracy}为仓内库存准确率，不表示同步速度或零超卖。异常处置按平台规则和项目方案执行。`,
  ],
  [
    '可以。新亦源为MCN机构和代播服务商提供多品牌共仓方案：①各品牌独立分区存储，互不混仓；②系统账号权限隔离，每个品牌只能看自己的库存和订单；③独立出库单和账单，对账清晰；④支持代播机构统一结算，也支持各品牌方分别结算。具体方案根据品牌数量和SKU规模定制。',
    '可以。可按品牌分区管理货品，并配置库存和订单查看权限，提供独立出库单与报表。代播机构可沟通统一结算或各品牌分别结算，具体配置结合品牌数量、SKU 和管理需求确认。',
  ],
])

export function toLivePublicCopy(content: ServicePageContent, faqs: FaqItem[]) {
  return {
    content: {
      ...content,
      title: textMap.get(content.title) ?? content.title,
      description: textMap.get(content.description) ?? content.description,
      eyebrow: textMap.get(content.eyebrow) ?? content.eyebrow,
      h1: textMap.get(content.h1) ?? content.h1,
      h1sub: textMap.get(content.h1sub) ?? content.h1sub,
      heroDesc: textMap.get(content.heroDesc) ?? content.heroDesc,
      contentDesc: textMap.get(content.contentDesc) ?? content.contentDesc,
      featuresLabel: textMap.get(content.featuresLabel) ?? content.featuresLabel,
      features: content.features.map((feature) => {
        const replacement = featureMap.get(`${feature.title}\u0000${feature.desc}`)
        return replacement ? { ...feature, ...replacement } : feature
      }),
      stats: content.stats.map((stat) => {
        const replacement = statMap.get(`${stat.stat}\u0000${stat.label}\u0000${stat.sub}`)
        return replacement ? { ...stat, ...replacement } : stat
      }),
    },
    faqs: faqs.map((faq) => ({ ...faq, a: faqMap.get(faq.a) ?? faq.a })),
  }
}
