import type { FaqItem, FeatureItem, StatItem } from '@/data/service'
import { CLAIM_TEXT } from '@/lib/claims'
import type { ServicePageContent } from '@/lib/directus-content-queries'

const oldDescription = `新亦源鞋服云仓采用CDC/RDC/FDC三级仓网架构，实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}，${CLAIM_TEXT.shippingSla}，支持B2C+B2B+O2O全渠道一盘货。`
const oldHero = `新亦源专注鞋服物流15年，RFID智能仓三代演进，支持B2C+B2B+O2O全渠道发货，采用CDC/RDC/FDC三级仓网架构，合作品牌${CLAIM_TEXT.partnerBrands}，单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}。`
const oldContent = `适合需要全渠道一盘货管理的鞋服品牌，重点解决高SKU管理、旺季产能波动和多仓库存协同问题。三代智能仓采用RFID、电子标签和自动化分拣，配合动态人力池与CDC/RDC/FDC三级仓网。库存准确率${CLAIM_TEXT.inventoryAccuracy}，综合损耗下降20%。`

const textMap = new Map<string, string>([
  ['鞋服云仓服务｜B2C+B2B+O2O全渠道仓配｜新亦源', '鞋服云仓服务｜款色码管理与全渠道仓配｜新亦源'],
  [
    oldDescription,
    '按鞋服商品的款、色、码特点组织入仓、库存、电商发货和门店补货；具体服务范围按项目方案确认。',
  ],
  ['鞋服云仓 · 专注鞋服行业的仓配服务商', '鞋服云仓'],
  ['鞋服云仓：全渠道一盘货与鞋服专用仓配', '鞋服云仓'],
  ['B2C+B2B+O2O全渠道库存协同', '款色码管清楚，多渠道发得顺。'],
  [oldHero, '从入仓建档、库存管理到电商发货和门店补货，按鞋服商品的特点组织仓配作业。'],
  [
    oldContent,
    '适合需要管理款色码、库存和多渠道订单的鞋服品牌。具体仓配安排、费用和服务范围按项目确认。',
  ],
  ['核心能力', '鞋服仓配服务'],
])

const featureMap = new Map<string, FeatureItem>([
  [
    '全渠道一盘货\u0000B2C+B2B+O2O库存实时同步，支持天猫、京东、拼多多、唯品会JIT/JITX、抖音、小程序等全渠道，降低超卖与空单风险。',
    {
      title: '全渠道一盘货',
      desc: '支持天猫、京东、拼多多、唯品会 JIT/JITX、抖音和小程序等渠道的订单协同，结合库存核对与出库安排。',
    },
  ],
  [
    'RFID智能识别\u0000三代智能仓通过RFID、电子标签与自动化分拣协同管理鞋服款色码，减少拣货和复核差错。',
    {
      title: 'RFID智能识别',
      desc: '围绕商品识别、款色码和拣货复核组织仓内作业，具体启用方式按项目确认。',
    },
  ],
  [
    `弹性产能机制\u0000动态人力池配合多仓协同，实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}、地区单日峰值${CLAIM_TEXT.regionalPeak}。`,
    {
      title: '弹性产能机制',
      desc: `大促前可根据预计货量安排仓容、人力、包材与作业；${CLAIM_TEXT.singleWarehousePeak}为实际单仓单日运营峰值，${CLAIM_TEXT.regionalPeak}为地区运营峰值，具体项目安排按方案确认。`,
    },
  ],
  [
    '深度定制WMS\u0000针对鞋服优化的WMS支持序列号、RFID、款色码管理和线上线下一体协同，可按项目使用奇门、EDI或定制接口；不收系统使用费，实施和定制费用按方案确认。',
    {
      title: '深度定制WMS',
      desc: '支持序列号、RFID、款色码管理及线上线下协同，可按项目使用奇门、EDI或定制接口；不收系统使用费，实施和定制费用按方案确认。',
    },
  ],
  [
    `精细库存管控\u0000日动盘+周抽盘+月实盘+季忙盘+年度全盘体系，库存准确率${CLAIM_TEXT.inventoryAccuracy}，综合损耗下降20%。`,
    {
      title: '精细库存管控',
      desc: `通过日常盘点与货品状态核对管理库存；${CLAIM_TEXT.inventoryAccuracy}为仓内库存准确率。`,
    },
  ],
  [
    '全程监控追溯\u00001080P拆包监控、操作台高低位双摄和关键区域监控，支持按订单调取录像与平台争议举证。',
    {
      title: '全程监控追溯',
      desc: '保留拆包、操作台和关键区域的作业记录，支持按订单调取记录并按项目处理争议举证。',
    },
  ],
])

const statMap = new Map<string, StatItem>([
  [
    `${CLAIM_TEXT.shippingAccuracy}\u0000发货准确率\u0000出库扫码复核`,
    { stat: CLAIM_TEXT.shippingAccuracy, label: '发货准确率', sub: '出库扫码复核与发货核对。' },
  ],
  [
    `${CLAIM_TEXT.singleWarehousePeak}\u0000单仓峰值\u0000弹性产能保大促`,
    {
      stat: CLAIM_TEXT.singleWarehousePeak,
      label: '单仓峰值',
      sub: '实际单仓单日运营峰值；具体项目安排按方案确认。',
    },
  ],
  [
    '18:00前\u0000截单时间\u0000当日24:00前发出',
    {
      stat: '18:00前',
      label: '截单时间',
      sub: `${CLAIM_TEXT.shippingSla}；送达时效受承运商线路、目的地和平台规则影响。`,
    },
  ],
  [
    `${CLAIM_TEXT.partnerBrands}\u0000合作品牌\u0000多数涉及全渠道运营`,
    { stat: CLAIM_TEXT.partnerBrands, label: '合作品牌', sub: '新亦源合作品牌。' },
  ],
])

const faqMap = new Map<string, string>([
  [
    '鞋服云仓和普通仓库有什么区别？\u0000鞋服云仓围绕鞋服高SKU、多色多码、退货率高和季节性波动等特点配置系统与流程：WMS针对序列号、RFID和款色码管理进行优化，可同时对接天猫、京东、唯品会、抖音等多平台订单；仓内提供退货质检、瑕疵修复和二次上架，形成正向与逆向履约闭环；动态人力池和多仓协同用于应对旺季货量变化。',
    '鞋服云仓围绕款色码、库存、订单和退货处理组织作业。可按项目评估序列号、RFID、平台订单及仓内服务的具体范围。',
  ],
  [
    '新亦源鞋服云仓支持哪些电商平台对接？\u0000支持B2C、B2B和O2O全渠道对接。B2C平台包括天猫、淘宝、京东、唯品会JIT/JITX、拼多多、抖音、快手、小红书、得物和微信小程序；B2B支持批发、门店分仓和零售连锁补货；O2O支持线下门店库存与线上订单融合管理。可采用奇门、EDI等标准协议或客户定制接口，具体实施与定制范围以项目方案为准。',
    '支持 B2C、B2B 和 O2O 全渠道协同。B2C 支持天猫、淘宝、京东、唯品会 JIT/JITX、拼多多、抖音、快手、小红书、得物和微信小程序；B2B 支持批发、门店分仓和零售连锁补货；O2O 支持门店库存与线上订单协同。奇门、EDI 和定制接口的实施范围按项目方案确认。',
  ],
  [
    `鞋服云仓如何应对618/双11大促爆仓？\u0000新亦源通常在大促前根据品牌预测货量启动人力储备，并通过动态人力池、多仓协同、智能波次、RFID识别和自动化分拣应对旺季货量。实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}、地区单日峰值${CLAIM_TEXT.regionalPeak}；具体项目会提前核对库存分布、仓容、人力、包材和物流通道，并在服务方案中确认峰值安排。`,
    `大促前可根据预计货量核对库存、仓容、人力、包材和物流通道，并在服务方案中确认安排。${CLAIM_TEXT.singleWarehousePeak}为实际单仓单日运营峰值，${CLAIM_TEXT.regionalPeak}为地区运营峰值，具体项目安排按方案确认。`,
  ],
  [
    `新亦源鞋服云仓发货时效是多少？\u0000${CLAIM_TEXT.shippingSla}，发货准确率为${CLAIM_TEXT.shippingAccuracy}。承运商运输时效受线路、目的地和平台规则影响，按项目确认。`,
    `${CLAIM_TEXT.shippingSla}。发货准确率为${CLAIM_TEXT.shippingAccuracy}；承运商运输时效受线路、目的地和平台规则影响，按项目确认。`,
  ],
  [
    '小型品牌也可以入驻新亦源鞋服云仓吗？\u0000可以。新亦源支持不同规模品牌按项目评估合作，费用根据存储、操作、系统实施和增值服务需求确认。品牌可先以单仓方案开始，业务规模扩大后再评估三级仓网协同。',
    '可以。不同规模品牌均可按项目评估合作，费用根据存储、操作、系统实施和增值服务需求确认；可先沟通当前货量、SKU 和销售渠道。',
  ],
])

export function toFootwearPublicCopy(content: ServicePageContent, faqs: FaqItem[]) {
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
    faqs: faqs.map((faq) => ({ ...faq, a: faqMap.get(`${faq.q}\u0000${faq.a}`) ?? faq.a })),
  }
}
