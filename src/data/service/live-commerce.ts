import { CLAIM_TEXT } from '@/lib/claims'

export const LIVE_PLATFORM_ROWS = [
  {
    platform: '主流直播电商平台',
    model: '品牌自播 / 达播等',
    sla: '以平台当前规则为准',
    risk: '延迟履约可能影响店铺指标',
    note: '接口与字段范围按项目确认',
  },
] as const

export const LIVE_CHALLENGE_ITEMS = [
  {
    icon: '⚡',
    title: '爆单不可预测',
    problem: '一场直播几分钟内涌入数万订单，普通仓无弹性产能应对，导致超时发货',
    solution: `大促或直播前根据预测货量预排班，并以动态人力池和多仓协同扩充产能；实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}`,
  },
  {
    icon: '📦',
    title: '库存超卖风险',
    problem: '直播间库存与仓库实际库存不同步，导致超卖后取消订单，买家差评爆发',
    solution: `RFID+WMS与主流直播电商平台实时同步库存，降低超卖风险，库存准确率${CLAIM_TEXT.inventoryAccuracy}`,
  },
  {
    icon: '↩️',
    title: '退货率高、处理慢',
    problem: '直播电商退货率普遍高于传统电商，退货积压导致库存沉淀、资金占用',
    solution: `退货质检与二次上架${CLAIM_TEXT.returnTurnaround}完成，具体质检规则和资源按项目确认`,
  },
] as const
