import { CLAIM_TEXT } from '@/lib/claims'

export const DIGITAL_PRODUCTS = [
  {
    id: 'yundao-platform',
    tag: '商圈物流O2O',
    name: '运到智能寄件平台',
    subtitle: '商圈零售门店一站式智能寄件',
    description:
      '新亦源自研商圈物流O2O平台，以信息和数据协同运输资源，已对接顺丰、京东、EMS等11家主流承运商，可根据线路、货量和时效要求智能匹配方案，为连锁门店、电商平台及企业机构提供正向与逆向寄件协同服务。',
    features: [
      '对接顺丰、京东、EMS等11家主流承运商',
      '覆盖门店寄件、调拨、退仓等正向与逆向场景',
      '服务网络覆盖多地，部分线路费用最高可节省50%，具体以实际线路和报价为准',
      '专属客服+在线工单，智能报表+数据保密',
    ],
    href: '/yundao-zhineng-jijian',
  },
] as const

export const ABOUT_STATS = [
  {
    value: CLAIM_TEXT.newGoodsInspectionAnnual.replace('件', ''),
    unit: '件/年',
    label: '新货质检',
  },
  { value: CLAIM_TEXT.returnInspectionAnnual.replace('件', ''), unit: '件/年', label: '退货质检' },
  { value: CLAIM_TEXT.inventoryAccuracy.replace('%', ''), unit: '%', label: '库存准确率' },
  { value: CLAIM_TEXT.recognizableAnomalies.replace('种', ''), unit: '种', label: '缺陷识别' },
  { value: CLAIM_TEXT.returnTurnaround.replace('小时', ''), unit: '小时', label: '退货二次上架' },
  { value: CLAIM_TEXT.repairSuccessRate.replace('%', ''), unit: '%', label: '瑕疵修复成功率' },
  { value: '40', unit: '%↑', label: 'RFID拣货提效' },
  { value: '30', unit: '%↑', label: '人效提升' },
] as const

export const CAPABILITIES = [
  {
    title: `${CLAIM_TEXT.shippingAccuracy} 发货准确率`,
    desc: `${CLAIM_TEXT.shippingSla}，发货全流程扫码复核`,
  },
  {
    title: '三级仓网协同',
    desc: 'CDC中心仓 / RDC区域仓 / FDC产地仓按项目配置',
  },
  {
    title: 'RFID 智能仓',
    desc: '三代智能仓结合RFID、电子标签与自动化分拣',
  },
  {
    title: '全渠道一盘货',
    desc: 'B2C+B2B+O2O库存实时同步，支持唯品会JIT/JITX',
  },
  {
    title: '弹性产能保大促',
    desc: `动态人力池+小时级调配，地区单日峰值${CLAIM_TEXT.regionalPeak}`,
  },
  {
    title: '全流程监控可追溯',
    desc: '1080P拆包监控+操作台高低位双摄，按订单调取录像',
  },
] as const
