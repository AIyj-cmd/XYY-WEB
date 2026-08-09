import type { ServiceVariant } from './types'

export const SERVICE_EXPERIENCE_COPY: Record<
  ServiceVariant,
  { detailCode: string; detailTitle: string; faqCode: string; ctaPrompt: string }
> = {
  journey: {
    detailCode: 'OPERATING SYSTEM',
    detailTitle: '沿着货物流，查看每一项作业能力',
    faqCode: 'FLOW NOTES',
    ctaPrompt: '带上 SKU、渠道和订单波峰，我们一起画出仓内履约路线',
  },
  showroom: {
    detailCode: 'CATEGORY NOTES',
    detailTitle: '从品类和存储方式理解服务边界',
    faqCode: 'MATERIAL NOTES',
    ctaPrompt: '带上品类、面料和包装要求，我们一起规划专属仓储空间',
  },
  'guangzhou-hub': {
    detailCode: 'LOCAL DOSSIER',
    detailTitle: '围绕广州仓点拆解本地服务能力',
    faqCode: 'GUANGZHOU FILE',
    ctaPrompt: '告诉我们货源与订单分布，一起确认合适的广州仓点',
  },
  'south-network': {
    detailCode: 'REGIONAL RESOURCES',
    detailTitle: '四类资源如何支撑华南多仓协同',
    faqCode: 'SOUTH NETWORK',
    ctaPrompt: '提供货量与区域分布，我们一起配置华南仓网资源',
  },
  'east-radius': {
    detailCode: 'DELIVERY RADIUS',
    detailTitle: '从库存前置到签收监控的区域能力',
    faqCode: 'EAST COVERAGE',
    ctaPrompt: '带上华东订单热区，我们一起评估库存前置方案',
  },
  'store-rhythm': {
    detailCode: 'STORE OPERATIONS',
    detailTitle: '把门店需求拆进补货作业单',
    faqCode: 'STORE MANUAL',
    ctaPrompt: '提供门店数、补货频率和箱规，我们一起制定补货节奏',
  },
  'global-tower': {
    detailCode: 'ROUTE CONTROL',
    detailTitle: '逐节点说明跨境正向与逆向能力',
    faqCode: 'ROUTE BRIEF',
    ctaPrompt: '告诉我们目的市场与货物流向，一起梳理跨境仓配链路',
  },
  'live-command': {
    detailCode: 'LIVE SIGNALS',
    detailTitle: '围绕直播时间线配置履约资源',
    faqCode: 'COMMAND LOG',
    ctaPrompt: '带上排期、货盘和峰值预估，我们一起做直播履约预案',
  },
  'jit-radar': {
    detailCode: 'RISK CONTROL',
    detailTitle: '把平台履约风险拆到每个作业节点',
    faqCode: 'SLA CHECK',
    ctaPrompt: '提供平台模式与活动计划，我们一起核对 JIT/JITX 履约条件',
  },
  'evidence-lab': {
    detailCode: 'QC EVIDENCE',
    detailTitle: '质检判断、图片证据与处置规则逐项对应',
    faqCode: 'LAB RECORD',
    ctaPrompt: '带上商品与判定标准，我们一起建立退货质检规则',
  },
  'repair-workshop': {
    detailCode: 'REPAIR STATIONS',
    detailTitle: '不同瑕疵进入不同工位',
    faqCode: 'WORKSHOP NOTES',
    ctaPrompt: '提供样品与验收标准，我们一起评估可采用的修复工艺',
  },
  'delivery-desk': {
    detailCode: 'DELIVERY OPERATIONS',
    detailTitle: '把寄件选择、运输状态与异常处理放进同一条链路',
    faqCode: 'DELIVERY NOTES',
    ctaPrompt: '带上门店数量、寄件线路和货量，我们一起确认寄件协同方案',
  },
}
