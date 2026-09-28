import { englishClaim } from '@/i18n/claims'
import { CLAIM_TEXT } from '@/lib/claims'
import type { EnglishServiceSource } from './service-sources'
import { sourceContent } from './service-sources'

const C = CLAIM_TEXT
const E = (key: Parameters<typeof englishClaim>[0]) => englishClaim(key, 'service:xiefu-yuncang')
const sourceStats = [
  { stat: C.shippingAccuracy, label: '发货准确率', sub: '出库扫码复核' },
  { stat: C.singleWarehousePeak, label: '单仓峰值', sub: '弹性产能保大促' },
  { stat: '18:00前', label: '截单时间', sub: '当日24:00前发出' },
  { stat: C.partnerBrands, label: '合作品牌', sub: '多数涉及全渠道运营' },
]
const englishStats = [
  {
    stat: E('shippingAccuracy'),
    label: 'Dispatch accuracy',
    sub: 'Scan verification before dispatch',
  },
  {
    stat: E('singleWarehousePeak'),
    label: 'Single-warehouse peak',
    sub: 'Peak-period capacity preparation',
  },
  { stat: 'By 18:00', label: 'Daily order cut-off', sub: `Dispatch follows ${E('shippingSla')}` },
  { stat: E('partnerBrands'), label: 'Partner brands', sub: 'Many use omnichannel operations' },
]
const sourceFeatures = [
  {
    title: '全渠道一盘货',
    desc: 'B2C+B2B+O2O库存实时同步，支持天猫、京东、拼多多、唯品会JIT/JITX、抖音、小程序等全渠道，降低超卖与空单风险。',
  },
  {
    title: 'RFID智能识别',
    desc: '三代智能仓通过RFID、电子标签与自动化分拣协同管理鞋服款色码，减少拣货和复核差错。',
  },
  {
    title: '弹性产能机制',
    desc: `动态人力池配合多仓协同，实际单仓单日峰值${C.singleWarehousePeak}、地区单日峰值${C.regionalPeak}。`,
  },
  {
    title: '深度定制WMS',
    desc: '针对鞋服优化的WMS支持序列号、RFID、款色码管理和线上线下一体协同，可按项目使用奇门、EDI或定制接口；不收系统使用费，实施和定制费用按方案确认。',
  },
  {
    title: '精细库存管控',
    desc: `日动盘+周抽盘+月实盘+季忙盘+年度全盘体系，库存准确率${C.inventoryAccuracy}，综合损耗下降20%。`,
  },
  {
    title: '全程监控追溯',
    desc: '1080P拆包监控、操作台高低位双摄和关键区域监控，支持按订单调取录像与平台争议举证。',
  },
]
const englishFeatures = [
  {
    title: 'One inventory pool across channels',
    desc: 'Coordinates B2C, B2B and O2O inventory and orders across agreed platforms to support inventory checks and dispatch.',
  },
  {
    title: 'RFID-enabled item identification',
    desc: 'RFID, electronic labels and automated sorting support style, colour and size control, picking and verification.',
  },
  {
    title: 'Flexible capacity planning',
    desc: `A dynamic labour pool and multi-warehouse coordination support peak preparation. The reported single-warehouse peak is ${E('singleWarehousePeak')} and the regional peak is ${E('regionalPeak')}.`,
  },
  {
    title: 'Configurable WMS integration',
    desc: 'Supports serial-number, RFID and style-colour-size management with Qimen, EDI or project-specific interfaces. Implementation and customisation are confirmed by project.',
  },
  {
    title: 'Detailed inventory control',
    desc: `Routine and scheduled stock checks support inventory control. The reported warehouse inventory accuracy is ${E('inventoryAccuracy')}; service conditions are confirmed by project.`,
  },
  {
    title: 'End-to-end operational traceability',
    desc: 'Unpacking, workstations and key areas are recorded. Order-level records can support agreed dispute evidence.',
  },
]
const sourceFaqs = [
  {
    q: '鞋服云仓和普通仓库有什么区别？',
    a: '鞋服云仓围绕鞋服高SKU、多色多码、退货率高和季节性波动等特点配置系统与流程：WMS针对序列号、RFID和款色码管理进行优化，可同时对接天猫、京东、唯品会、抖音等多平台订单；仓内提供退货质检、瑕疵修复和二次上架，形成正向与逆向履约闭环；动态人力池和多仓协同用于应对旺季货量变化。',
  },
  {
    q: '新亦源鞋服云仓支持哪些电商平台对接？',
    a: '支持B2C、B2B和O2O全渠道对接。B2C平台包括天猫、淘宝、京东、唯品会JIT/JITX、拼多多、抖音、快手、小红书、得物和微信小程序；B2B支持批发、门店分仓和零售连锁补货；O2O支持线下门店库存与线上订单融合管理。可采用奇门、EDI等标准协议或客户定制接口，具体实施与定制范围以项目方案为准。',
  },
  {
    q: '鞋服云仓如何应对618/双11大促爆仓？',
    a: `新亦源通常在大促前根据品牌预测货量启动人力储备，并通过动态人力池、多仓协同、智能波次、RFID识别和自动化分拣应对旺季货量。实际单仓单日峰值${C.singleWarehousePeak}、地区单日峰值${C.regionalPeak}；具体项目会提前核对库存分布、仓容、人力、包材和物流通道，并在服务方案中确认峰值安排。`,
  },
  {
    q: '新亦源鞋服云仓发货时效是多少？',
    a: `${C.shippingSla}，发货准确率为${C.shippingAccuracy}。承运商运输时效受线路、目的地和平台规则影响，按项目确认。`,
  },
  {
    q: '小型品牌也可以入驻新亦源鞋服云仓吗？',
    a: '可以。新亦源支持不同规模品牌按项目评估合作，费用根据存储、操作、系统实施和增值服务需求确认。品牌可先以单仓方案开始，业务规模扩大后再评估三级仓网协同。',
  },
]
const englishFaqs = [
  {
    q: 'How does apparel fulfilment differ from a general warehouse?',
    a: 'Apparel fulfilment is organised around high SKU counts, style-colour-size variants, returns and seasonal variation. The project scope can include serial numbers, RFID, platform orders, returns inspection, repair and re-listing.',
  },
  {
    q: 'Which commerce platforms can apparel fulfilment connect to?',
    a: 'It supports B2C, B2B and O2O coordination. B2C can include Tmall, Taobao, JD, VIP JIT/JITX, Pinduoduo, Douyin, Kuaishou, Xiaohongshu, Dewu and WeChat Mini Programs; interface scope is agreed for each project.',
  },
  {
    q: 'How are 618 and Double 11 peak periods prepared for?',
    a: `Before peak periods, the project checks inventory, capacity, labour, packing materials and carrier routes. The reported single-warehouse peak is ${E('singleWarehousePeak')} and the regional peak is ${E('regionalPeak')}; arrangements are confirmed in the service plan.`,
  },
  {
    q: 'What is the dispatch timing?',
    a: `${E('shippingSla')}, with reported dispatch accuracy of ${E('shippingAccuracy')}. Carrier transit timing depends on route, destination and platform rules and is confirmed by project.`,
  },
  {
    q: 'Can smaller brands use apparel fulfilment?',
    a: 'Yes. Brands of different sizes can be assessed by project. Storage, operations, system implementation and value-added services are confirmed around the requirements; a single-warehouse plan can be the starting point.',
  },
]
export const FOOTWEAR_ENGLISH_SOURCE: EnglishServiceSource = {
  source: sourceContent(
    {
      title: '鞋服云仓服务｜B2C+B2B+O2O全渠道仓配｜新亦源',
      description: `新亦源鞋服云仓采用CDC/RDC/FDC三级仓网架构，实际单仓单日峰值${C.singleWarehousePeak}，${C.shippingSla}，支持B2C+B2B+O2O全渠道一盘货。`,
      breadcrumbLabel: '鞋服云仓',
      eyebrow: '鞋服云仓 · 专注鞋服行业的仓配服务商',
      h1: '鞋服云仓：全渠道一盘货与鞋服专用仓配',
      h1sub: 'B2C+B2B+O2O全渠道库存协同',
      heroDesc: `新亦源专注鞋服物流15年，RFID智能仓三代演进，支持B2C+B2B+O2O全渠道发货，采用CDC/RDC/FDC三级仓网架构，合作品牌${C.partnerBrands}，单仓单日峰值${C.singleWarehousePeak}。`,
      imgSrc: '/w-footwear-cloud.webp',
      imgAlt: '鞋服云仓 — 专业鞋服仓储配送',
      contentDesc: `适合需要全渠道一盘货管理的鞋服品牌，重点解决高SKU管理、旺季产能波动和多仓库存协同问题。三代智能仓采用RFID、电子标签和自动化分拣，配合动态人力池与CDC/RDC/FDC三级仓网。库存准确率${C.inventoryAccuracy}，综合损耗下降20%。`,
      featuresLabel: '核心能力',
    },
    sourceStats,
    sourceFeatures
  ),
  english: sourceContent(
    {
      title: 'Apparel fulfilment | One inventory pool across channels',
      description: `Apparel fulfilment coordinates inventory and orders across B2C, B2B and O2O. Reported single-warehouse peak: ${E('singleWarehousePeak')}; ${E('shippingSla')}.`,
      breadcrumbLabel: 'Apparel fulfilment',
      eyebrow: 'Apparel fulfilment · warehouse operations for apparel',
      h1: 'Apparel fulfilment: one inventory pool across channels',
      h1sub: 'Coordinated inventory for B2C, B2B and O2O',
      heroDesc: `For apparel brands needing style-colour-size control, omnichannel dispatch and coordinated inventory. The reported partner-brand base is ${E('partnerBrands')} and the single-warehouse peak is ${E('singleWarehousePeak')}.`,
      imgSrc: '/w-footwear-cloud.webp',
      imgAlt: 'Apparel fulfilment warehouse operations',
      contentDesc: `For apparel brands managing high SKU counts, seasonal capacity and inventory across channels. RFID, electronic labels and automated sorting support agreed workflows; reported inventory accuracy is ${E('inventoryAccuracy')}.`,
      featuresLabel: 'Core capability',
    },
    englishStats,
    englishFeatures
  ),
  sourceFaqs,
  englishFaqs,
}
