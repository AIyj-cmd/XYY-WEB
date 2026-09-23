import type { FaqItem, FeatureItem } from '@/data/service'
import type { ServicePageContent } from '@/lib/directus-content-queries'
import { CLAIM_TEXT } from '@/lib/claims'

const legacyReturnDescriptions = [
  `广州主仓设置专属退货质检与后整修复中心，华南区域退货可就近处理，减少跨城运输成本，退货${CLAIM_TEXT.returnTurnaround}内完成质检二次上架。`,
  `广州仓库设置专属退货质检与后整修复中心，华南区域退货可就近处理，减少跨城运输成本，退货${CLAIM_TEXT.returnTurnaround}内完成质检二次上架。`,
]
const publicReturn = `华南各仓库均具备质检能力，退货可就近回仓检查、分类。符合重新销售条件的商品，按服务约定在${CLAIM_TEXT.returnTurnaround}内完成质检与二次上架；需要后整修复的商品按实际情况安排。`
const publicContentDesc = `正向订单${CLAIM_TEXT.shippingSla}。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日。到达时间会因收货地址、承运商及线路安排有所不同，具体以双方约定的配送方案为准。`
const legacyContentDesc = `适合需要在华南布局库存的鞋服品牌，尤其涉及电商订单、门店补货、唯品会JIT/JITX和退货处理的项目。华南多仓布局覆盖广州、东莞、佛山、肇庆，${CLAIM_TEXT.shippingSla}。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日；具体启用仓点、仓容、承运商和到达时效以项目方案及线路SLA为准。`
const textMap = new Map<string, string>([
  ['华南仓网节点', '华南仓储服务'],
  [
    '新亦源华南鞋服云仓直营仓储30万㎡+，华南多仓布局覆盖广州、东莞、佛山、肇庆，支持B2C、B2B、全渠道库存协同及退货质检，具体启用仓点和线路方案由双方确认。',
    '新亦源华南鞋服云仓覆盖广州、东莞、佛山、肇庆，支持 B2C、B2B、电商发货、门店补货与退货处理，各仓均具备质检能力。',
  ],
])
const featureMap = new Map<string, FeatureItem>([
  [
    '广州区域节点\u0000服务广州及珠三角鞋服品牌的电商仓配、门店补货和退货处理；实际启用仓点与仓容按项目确认。',
    { title: '广州仓库', desc: '服务广州及珠三角鞋服品牌，衔接电商发货、门店补货与退货质检。' },
  ],
  [
    '东莞区域节点\u0000可结合东莞制造业和品牌货源组织入库、仓储与发货，具体地址、面积和业务范围以项目核验为准。',
    { title: '东莞仓库', desc: '衔接东莞工厂与品牌货源，提供入库、存储、订单发货与退货质检服务。' },
  ],
  [
    '佛山区域节点\u0000面向佛山及周边鞋服项目提供区域仓配协同，具体仓点和启用条件由双方确认。',
    { title: '佛山仓库', desc: '为佛山及周边鞋服品牌提供货品存储、订单发货与退货质检服务。' },
  ],
  [
    '肇庆区域节点\u0000可承接唯品会JIT/JITX等相关项目，平台规则、仓点与作业范围以项目核验和双方方案为准。',
    {
      title: '肇庆仓库',
      desc: '支持鞋服货品入库、存储、发货与退货质检，唯品会 JIT/JITX 业务按平台要求安排。',
    },
  ],
  [
    '华南产业链协同\u0000可结合广州、东莞、佛山等地鞋服产业资源组织工厂入仓、库存管理和订单履约，具体流程按项目确认。',
    {
      title: '货源入仓与库存安排',
      desc: '衔接广州、东莞、佛山等地鞋服货源，安排工厂入仓、库存管理与订单发货。',
    },
  ],
])
const faqMap = new Map<string, string>([
  [
    '华南多仓布局覆盖广州、东莞、佛山、肇庆，华南直营仓储30万㎡+。每个项目实际启用的仓点、地址、仓容和业务范围在启动前确认。',
    '华南仓库分布在广州、东莞、佛山、肇庆，各仓均具备质检能力。我们会根据货源位置、订单去向和库存需求推荐合适的仓库，入仓前确认可用空间与服务安排。',
  ],
  [
    `仓内正向履约口径为${CLAIM_TEXT.shippingSla}。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日；具体以线路SLA为准。`,
    `正向订单${CLAIM_TEXT.shippingSla}。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日。其他地区及具体订单的到达时间，需结合收货地址和配送线路确认。`,
  ],
  [
    '具体仓储和转运成本按仓点、货量及线路测算。',
    '费用会根据仓库位置、存储货量、作业需求和配送线路计算。提供货品与订单情况后，可获取适合你的仓配报价。',
  ],
  [
    `华南仓网可按品牌的SKU、库存、订单峰值和增值服务需求评估共享仓位、专属分区或多仓协同方案。公司公开的地区运营峰值为${CLAIM_TEXT.regionalPeak}，具体项目产能需结合当期仓容与资源确认。`,
    `可根据货品种类、库存量、订单高峰和增值服务需求，选择共享仓位、专属分区或多仓服务。地区单日运营峰值为${CLAIM_TEXT.regionalPeak}，属于历史峰值表现；你的业务可承接量需结合当前仓储空间和人员安排确认。`,
  ],
])

export function toSouthPublicCopy(content: ServicePageContent, faqs: FaqItem[]) {
  const features = content.features.map((feature) => {
    if (feature.title === '华南退货质检中心' && legacyReturnDescriptions.includes(feature.desc))
      return { ...feature, title: '各仓退货质检', desc: publicReturn }
    const replacement = featureMap.get(`${feature.title}\u0000${feature.desc}`)
    return replacement ? { ...feature, ...replacement } : feature
  })
  return {
    content: {
      ...content,
      description: textMap.get(content.description) ?? content.description,
      contentDesc:
        content.contentDesc === legacyContentDesc ? publicContentDesc : content.contentDesc,
      featuresLabel: textMap.get(content.featuresLabel) ?? content.featuresLabel,
      features,
    },
    faqs: faqs.map((faq) => ({ ...faq, a: faqMap.get(faq.a) ?? faq.a })),
  }
}
