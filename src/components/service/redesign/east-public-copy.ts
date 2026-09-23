import type { FaqItem, FeatureItem } from '@/data/service'
import type { ServicePageContent } from '@/lib/directus-content-queries'
import { CLAIM_TEXT } from '@/lib/claims'

const publicDescription =
  '新亦源华东鞋服云仓覆盖上海、昆山、合肥，支持电商发货、门店补货、库存协同与退货质检，各仓均具备质检能力。'
const publicHero = '上海、昆山、合肥多仓布局，支持电商发货、门店补货与退货质检。'
const publicContent = '根据货品、订单去向和所需服务，确认发货安排与费用。'
const legacyContent =
  '适合需要在长三角及华东布局库存的鞋服品牌。华东仓网覆盖上海、昆山、合肥，上海青浦为核心节点之一，可规划B2C、B2B和退货质检服务，并与华南仓网协同库存。华东主要城市参考次日达；具体启用仓点、仓容、承运商、线路和到达时效以项目方案及合同SLA为准。'
const featureMap = new Map<string, FeatureItem>([
  [
    '华东区域仓网\u0000覆盖上海、昆山、合肥，上海青浦为核心节点之一；上海仓地址为上海市青浦区白鹤镇外青松公路3939号B-3-3。各项目实际启用仓点、仓容和业务范围由双方确认。',
    {
      title: '华东仓库分布',
      desc: '上海、昆山、合肥多仓布局，按库存与订单需求安排仓配服务，各仓均具备质检能力。',
    },
  ],
  [
    '华东B2C全渠道发货\u0000支持天猫、京东、拼多多、抖音电商、快手等主流平台华东区域发货，华东本地订单从华东仓发出，时效优于从广州华南仓发货。',
    {
      title: '华东电商发货',
      desc: '支持天猫、京东、拼多多、抖音电商、快手等平台订单，按库存和约定安排发货。',
    },
  ],
  [
    'B2B华东门店补货\u0000承接华东区域品牌连锁门店、批发商、加盟商的B2B补货配送，按门店分仓分拣，货架标签齐全，支持整件发货或拆零分发。',
    { title: '华东门店补货', desc: '按门店整理货品，支持整件发货、拆零分拣与补货配送。' },
  ],
  [
    `华东退货就近处理\u0000华东区域退货可按项目回收至启用仓点，退货质检与二次上架${CLAIM_TEXT.returnTurnaround}完成，减少跨区回流。`,
    {
      title: '华东退货质检',
      desc: `各仓均可处理退货质检；符合重新销售条件的商品，按服务约定在${CLAIM_TEXT.returnTurnaround}内完成质检与二次上架，需修复的商品另行安排。`,
    },
  ],
  [
    '华东华南仓网协同\u0000OMS可统一查看多仓库存，并按项目配置订单路由和补货策略；实际分仓规则由双方确认。',
    {
      title: '华东华南库存协同',
      desc: '华东与华南库存统一查看，根据订单地区、库存和约定规则安排发货、补货与对账。',
    },
  ],
  [
    '长三角本地商务支持\u0000华东有专属商务BD，可上门洽谈，方便上海、杭州、苏州等地品牌快速开始合作。',
    { title: '本地团队沟通', desc: '可围绕货品、订单去向和补货节奏沟通华东仓配需求。' },
  ],
])
const faqQuestionMap = new Map<string, string>([
  ['华东仓规模多大？能应对大促爆单吗？', '大促期间如何安排仓储和发货？'],
  ['华东仓收费与广州仓有区别吗？', '仓配费用如何计算？'],
])
const faqMap = new Map<string, string>([
  [
    '华东仓网覆盖上海、昆山和合肥，上海青浦为核心节点之一，适合供应链或主要消费市场位于华东、需要区域库存和门店补货协同的鞋服品牌。上海仓地址为上海市青浦区白鹤镇外青松公路3939号B-3-3；实际启用仓点、仓容和作业范围在项目启动前确认。',
    '华东仓库分布在上海青浦、昆山花桥和合肥联亚，适合需要电商发货、门店补货或退货质检的鞋服品牌。完整地址已在页面上方列出，各仓均具备质检能力。',
  ],
  [
    '运输时效取决于实际启用仓点、收货区域、截单节点、承运商和当期线路。新亦源会在项目评估中核验线路，并在双方确认的服务方案中明确适用范围和SLA。',
    `符合条件的订单${CLAIM_TEXT.shippingSla}。华东主要城市可参考次日达，实际送达时间结合收货地址和承运线路确认。`,
  ],
  [
    '可以。新亦源OMS支持多仓一体管理：①统一库存视图，库存在广州仓和上海仓之间实时可见；②就近发货策略配置，华东订单自动路由至上海仓，华南订单路由至广州仓；③统一报表和对账，无需分别登录两套系统；④分仓补货预警，避免单仓缺货影响发货。',
    '可以。华东与华南库存可统一查看，并根据订单地区、库存和约定规则安排发货、补货与对账。',
  ],
  [
    '上海青浦仓是华东仓网核心节点之一，大促期间可通过弹性人力机制调整产能；品牌也可结合昆山、合肥及华南仓网规划库存。具体仓容请联系商务团队评估。',
    '大促前可提前沟通库存、订单高峰、人员与作业安排，并结合上海、昆山、合肥及华南库存规划服务。',
  ],
  [
    '费用通常由仓储、操作、系统实施和增值服务组成，具体单价受启用仓点、SKU、吞吐量和服务范围影响。品牌可提供业务数据，由商务团队形成项目报价。',
    '费用会结合货品、库存、订单和所需服务说明。系统使用费不收；接口实施、定制和增值服务费用另行说明。',
  ],
])

export function toEastPublicCopy(content: ServicePageContent, faqs: FaqItem[]) {
  const features = content.features.map((feature) =>
    featureMap.get(`${feature.title}\u0000${feature.desc}`)
      ? { ...feature, ...featureMap.get(`${feature.title}\u0000${feature.desc}`)! }
      : feature
  )
  return {
    content: {
      ...content,
      title:
        content.title === '华东鞋服云仓｜上海、昆山、合肥区域仓配｜新亦源'
          ? '华东鞋服云仓｜上海、昆山、合肥仓配｜新亦源'
          : content.title,
      description:
        content.description ===
        '新亦源华东鞋服云仓覆盖上海、昆山、合肥，上海青浦为核心节点之一，支持B2C、B2B、全渠道库存协同及退货质检。华东主要城市参考次日达，具体启用仓点、仓容、线路和到达时效以项目方案及合同SLA为准。'
          ? publicDescription
          : content.description,
      eyebrow:
        content.eyebrow === '华东鞋服云仓 · 上海青浦，长三角核心节点' ||
        content.eyebrow === '华东鞋服云仓'
          ? ''
          : content.eyebrow,
      h1: content.h1 === '华东鞋服云仓：上海、昆山、合肥区域仓网' ? '华东鞋服云仓' : content.h1,
      h1sub: content.h1sub === '服务华东品牌的全渠道仓配节点' ? '' : content.h1sub,
      heroDesc:
        content.heroDesc ===
        '华东仓网覆盖上海、昆山、合肥，上海青浦为核心节点之一，支持B2C全渠道、B2B门店补货及退货质检。华东主要城市参考次日达，具体启用仓点、仓容、线路和到达时效以项目方案及合同SLA为准。'
          ? publicHero
          : content.heroDesc,
      contentDesc: content.contentDesc === legacyContent ? publicContent : content.contentDesc,
      featuresLabel:
        content.featuresLabel === '华东仓核心能力' ? '华东仓配服务' : content.featuresLabel,
      features,
    },
    faqs: faqs.map((faq) => ({
      ...faq,
      q: faqQuestionMap.get(faq.q) ?? faq.q,
      a: faqMap.get(faq.a) ?? faq.a,
    })),
  }
}
