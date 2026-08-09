import { CLAIM_TEXT } from '@/lib/claims'

export const CLOUD_WAREHOUSE_FEATURES = [
  { title: '多渠道订单履约', detail: '电商平台、门店订单、批发订单统一协同' },
  { title: '鞋服库存管理', detail: '支持多SKU、多尺码、多颜色与批次管理' },
  {
    title: '快速订单处理',
    detail: `${CLAIM_TEXT.shippingSla}；单仓日峰值${CLAIM_TEXT.singleWarehousePeak}`,
  },
  { title: '智能仓储管理', detail: 'RFID、电子标签与系统流程协同管理' },
] as const

export const RETURN_QUALITY_FEATURES = [
  {
    title: '标准化质检',
    detail: `按AQL标准执行，可识别7大类${CLAIM_TEXT.recognizableAnomalies}鞋服异常`,
  },
  { title: '分级处置', detail: '根据质检结果进入可售、修复、退供或报废流程' },
  { title: '瑕疵修复', detail: '设置九大修复专区，完成后按照品牌标准重新复检' },
  {
    title: '快速二次上架',
    detail: `退货质检+二次上架${CLAIM_TEXT.returnTurnaround}，平均拆包4小时、质检12小时`,
  },
] as const

export const DIGITAL_LOGISTICS_FEATURES = [
  { title: '多系统协同', detail: '物流网关、WMS、LMS、人效管理及履约监控模块统一协作' },
  { title: '全链路可视', detail: '订单、库存、仓内作业、物流轨迹与签收状态实时查看' },
  { title: '灵活系统对接', detail: '支持奇门、EDI、API及客户定制接口，适配不同业务系统' },
  {
    title: '物流履约管理',
    detail: '对接顺丰、京东、EMS等主流承运商，支持路由匹配、轨迹查询与异常处理',
  },
] as const

export const YUNDAO_FEATURES = [
  { title: '多承运商统一接入', detail: '已对接顺丰、京东、EMS等11家主流承运商' },
  { title: '智能路由匹配', detail: '根据线路、货量、价格和时效要求匹配寄件方案' },
  { title: '正逆向寄件协同', detail: '支持门店寄件、门店调拨、退仓及企业寄件场景' },
  { title: '全程服务管理', detail: '支持轨迹查询、异常处理、在线工单和数据报表' },
] as const
