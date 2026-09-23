import type { FaqItem, FeatureItem } from '@/data/service'
import type { ServicePageContent } from '@/lib/directus-content-queries'
import { CLAIM_TEXT } from '@/lib/claims'

const oldDescription = `新亦源B2B门店仓配覆盖${CLAIM_TEXT.coveredCities}城市，为连锁品牌、批发商、加盟商提供门店补货配送、分色分码分货、货架标签、分货明细单及ERP系统对接等全流程服务。`
const oldHero =
  '新亦源B2B门店仓配专为鞋服连锁品牌、批发商和加盟体系设计，提供门店补货配送、按门店分货分拣、货架标签制作、ERP系统对接等全流程B2B仓配服务，服务合作品牌遍布全国的门店网络。'
const oldContent = `适合有连锁门店补货需求的服饰品牌，尤其季节性铺货、按需补货和紧急调货场景。新亦源B2B仓配支持按门店SKU分货、零担/整车/同城快运混合发货，并可与品牌ERP协同处理补货指令，发货准确率${CLAIM_TEXT.shippingAccuracy}。`
export const B2B_PUBLIC_CONTENT_DESC = `发货准确率${CLAIM_TEXT.shippingAccuracy}。`
const textMap = new Map<string, string>([
  [
    'B2B门店仓配｜连锁补货、分货与全渠道一盘货｜新亦源',
    'B2B门店仓配｜门店补货、分货与库存协同｜新亦源',
  ],
  [
    oldDescription,
    '面向连锁补货、批发铺货与加盟配送，衔接按店分货、标签加工、装箱发运与系统信息。',
  ],
  ['B2B门店仓配 · 连锁补货 + 批发铺货专业服务', 'B2B门店仓配'],
  ['B2B门店仓配与连锁门店补货', 'B2B门店仓配'],
  ['批发铺货、分色分码与全渠道库存协同', '按店配好货，门店好收货。'],
  [oldHero, '围绕连锁补货、批发铺货与加盟配送，衔接按店分货、标签加工、装箱发运与系统信息。'],
  [oldContent, B2B_PUBLIC_CONTENT_DESC],
  ['B2B仓配核心能力', '门店仓配服务'],
])
const featureMap = new Map<string, FeatureItem>([
  [
    '门店分货精准分拣\u0000按门店编号独立分区拣货，分色分码分规格，每箱附分货明细单（门店名称、SKU清单、数量），减少门店收货时的清点差错。',
    {
      title: '门店分货精准分拣',
      desc: '按门店编号独立分区拣货，分色分码分规格，每箱附分货明细单，便于门店清点。',
    },
  ],
  [
    '货架标签 / 吊牌加工\u0000根据门店或客户要求制作货架价格标签、商品条码、吊牌，支持不同门店使用不同标签格式，出库前完成贴标，门店收货即可上架。',
    {
      title: '货架标签 / 吊牌加工',
      desc: '根据门店或客户要求制作货架标签、商品条码与吊牌，按品牌模板在出库前完成加工。',
    },
  ],
  [
    'ERP / 进销存系统对接\u0000已对接百胜E3、聚水潭、伯俊、吉客云、丽晶、浪潮、恒康等主流ERP，可自动接收补货指令、生成出库单并回传物流信息；不收系统使用费，接口实施和定制费用按方案确认。',
    {
      title: 'ERP / 进销存系统对接',
      desc: '可协同接收补货指令、生成出库单并回传物流信息；具体接口方式、字段范围和实施安排按项目确认。',
    },
  ],
  [
    '零担 / 整车 / 快递混合发货\u0000根据门店距离、货量和交付要求选择零担、整车、同城货运或快递；运输为参考时效，以线路和合同SLA为准。',
    {
      title: '零担 / 整车 / 快递混合发货',
      desc: '根据门店距离、货量和收货要求安排零担、整车、同城货运或快递；具体线路与交付条件按项目确认。',
    },
  ],
  [
    'B2C+B2B一盘货管理\u0000同一批库存同时支持线上B2C发货和线下门店B2B补货，库存统一管理，系统自动按订单类型选择出库模式，无需分仓备货。',
    {
      title: 'B2C+B2B一盘货管理',
      desc: '同一批库存可同时支持线上B2C发货和线下门店B2B补货，按订单类型组织出库。',
    },
  ],
  [
    '季节集中铺货保障\u0000春夏、秋冬换季集中铺货前提前预排班，并通过动态用工与波次计划保障约定的门店补货节奏。',
    {
      title: '季节集中铺货保障',
      desc: '换季集中铺货前提前预排班，并结合动态用工与波次计划安排门店补货。',
    },
  ],
])
const statMap = new Map<string, { sub: string }>([
  [
    `${CLAIM_TEXT.partnerBrands}\u0000合作品牌\u0000含多家连锁零售品牌`,
    { sub: '新亦源整体服务基础。' },
  ],
  [`${CLAIM_TEXT.coveredCities}\u0000覆盖城市\u0000公司运营统计`, { sub: '新亦源整体服务基础。' }],
  ['分色分码\u0000精准分货\u0000按门店SKU规格独立分拣', { sub: '按门店SKU规格独立分拣。' }],
  [
    '不收\u0000系统使用费\u0000接口实施和定制费用按方案确认',
    { sub: '接口实施与定制费用按方案确认。' },
  ],
])
const faqMap = new Map<string, FaqItem>([
  [
    '新亦源B2B仓配和B2C仓配有什么区别？\u0000B2B门店仓配的核心差异在三点：①分货逻辑不同，B2B按门店独立分区拣货，每个门店有独立明细单；②物流方式不同，B2B主要用零担/整车，成本更低；③系统对接不同，B2B需要与ERP/进销存系统打通，自动处理补货指令。新亦源同时支持B2C和B2B两种发货模式，一套库存可同时服务两种渠道。',
    {
      q: '新亦源B2B仓配和B2C仓配有什么区别？',
      a: 'B2C通常按消费者订单逐单拣货打包；B2B围绕门店补货计划集中分货，批次与频率随品牌安排。作业按门店与款色码区分，并按收货要求准备外箱和明细。物流结合货量与线路选择，系统衔接补货指令、出库及物流信息；两类业务可共用一套库存。',
    },
  ],
  [
    '门店数量较多（50家以上），新亦源能处理吗？\u0000完全可以。新亦源已服务多个拥有100家以上门店的连锁品牌，建立了完善的门店分货作业标准：门店档案维护→分货规则配置→批量分拣→逐店打包→物流发运→回传单号，全流程标准化。门店越多越有规模优势，欢迎联系商务团队评估方案。',
    {
      q: '门店数量较多时，如何评估门店仓配方案？',
      a: '可根据门店资料、SKU、分货规则和发运计划评估作业安排，再确认打包、物流和信息回传方式。',
    },
  ],
  [
    '新亦源支持与哪些ERP系统对接？\u0000已对接百胜E3、聚水潭、伯俊、吉客云、丽晶、浪潮、恒康等主流ERP，也支持品牌自研系统通过API接入，可协同接收补货指令、生成出库单并回传物流信息。具体接口方式、字段范围和联调周期由双方确认；不收系统使用费，接口实施和定制费用按方案确认。',
    {
      q: '新亦源支持与哪些ERP系统对接？',
      a: '已对接百胜E3、聚水潭、伯俊、吉客云、丽晶、浪潮、恒康等系统，也支持品牌自研系统通过API接入。接口方式、字段范围和联调安排按项目确认；不收系统使用费，接口实施与定制费用按方案确认。',
    },
  ],
  [
    '季节换新集中铺货时，能在多少天内完成全国发货？\u0000参考铺货时效：100家门店约3—5天、500家约7—10天、1000家约14天；具体按SKU数量、分货方式、门店区域和运输线路确认。',
    {
      q: '季节换新集中铺货如何安排周期？',
      a: '会根据SKU、货量、分货方式、门店区域和运输线路安排周期，并在项目方案中确认。',
    },
  ],
  [
    'B2B发货的货架标签和分货明细单怎么定制？\u0000支持完全按品牌要求定制：①货架标签：可包含门店名称、SKU编码、颜色、尺码、价格、条码等；②分货明细单：按门店生成，包含本次补货所有商品明细；③包装箱标：箱号、目的门店、商品汇总。首次合作时，商务团队会收集您的标签格式要求，录入系统模板，后续自动批量生成。',
    {
      q: 'B2B发货的货架标签和分货明细单怎么定制？',
      a: '可约定门店名称、SKU、款色码、数量、箱号等内容，并在合作前确认标签与单据模板。',
    },
  ],
])
export function toB2bPublicCopy(content: ServicePageContent, faqs: FaqItem[]) {
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
      features: content.features.map(
        (feature) => featureMap.get(`${feature.title}\u0000${feature.desc}`) ?? feature
      ),
      stats: content.stats.map((stat) => ({
        ...stat,
        ...(statMap.get(`${stat.stat}\u0000${stat.label}\u0000${stat.sub}`) ?? {}),
      })),
    },
    faqs: faqs.map((faq) => ({ ...faq, ...(faqMap.get(`${faq.q}\u0000${faq.a}`) ?? {}) })),
  }
}
