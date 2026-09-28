import type { Service } from '@/lib/directus'
import { CLAIM_TEXT } from '@/lib/claims'

type HomeServiceSource = Pick<Service, 'slug' | 'name' | 'subtitle' | 'description' | 'features'>

/**
 * Audited published-service content from the established CMS seed. These strings
 * are source fingerprints only; public English figures continue to come from
 * the claims registry in home-content.ts.
 */
export const HOME_SERVICE_PUBLISHED_SOURCES = [
  {
    slug: 'cloud-warehouse',
    name: '鞋服云仓',
    subtitle: '全渠道一盘货与鞋服专用仓配',
    description: `提供B2C+B2B+O2O全渠道仓配、库存同步和门店补货服务。实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}，${CLAIM_TEXT.shippingSla}。`,
    features: [
      '发货准确率99.99%，库存准确率99.99%',
      CLAIM_TEXT.shippingSla,
      `实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}`,
      'RFID、电子标签与出库复核协同管理款色码',
      '支持唯品会JIT/JITX等项目，平台规则按项目核验',
    ],
  },
  {
    slug: 'quality-inspection',
    name: '退货质检与瑕疵修复',
    subtitle: `${CLAIM_TEXT.recognizableAnomalies}异常识别，${CLAIM_TEXT.returnTurnaround}二次上架`,
    description: `与广检集团合作QC团队，按AQL 1.0–6.5执行；质检技师经广检集团资深讲师培训认证。可识别7大类${CLAIM_TEXT.recognizableAnomalies}异常，按质检结果进入对应修复流程；退货质检与二次上架${CLAIM_TEXT.returnTurnaround}，瑕疵修复成功率${CLAIM_TEXT.repairSuccessRate}。`,
    features: [
      `可识别7大类${CLAIM_TEXT.recognizableAnomalies}异常`,
      `退货质检与二次上架${CLAIM_TEXT.returnTurnaround}，平均拆包4小时、质检12小时`,
      `瑕疵修复成功率${CLAIM_TEXT.repairSuccessRate}`,
      '设置九大修复专区，完成后按品牌标准复检',
      `全年新货质检${CLAIM_TEXT.newGoodsInspectionAnnual}，退货质检${CLAIM_TEXT.returnInspectionAnnual}`,
    ],
  },
  {
    slug: 'logistics-cloud',
    name: '物流数字化能力',
    subtitle: '六大系统模块与OTD物流服务中台协同',
    description:
      '以OTD物流服务中台为数字化底座，由物流网关、WMS、LMS、人效通、发货时效监控、轨迹与签收监控六大模块协同订单、库存、仓内作业与物流履约，支持路由、轨迹和异常管理。',
    features: [
      '运到已对接顺丰、京东、EMS等11家主流承运商',
      '物流轨迹与异常节点可视化',
      '可采用奇门、EDI、API或客户定制接口',
      '不收系统使用费；实施、接口联调、定制开发和其他服务费用按方案确认',
      '在线工单与运营报表支持履约复盘',
    ],
  },
] satisfies HomeServiceSource[]

/** Current expansion of scripts/data/approved-services.mjs claim templates. */
export const HOME_SERVICE_APPROVED_TEMPLATE_SOURCES = [
  {
    slug: 'cloud-warehouse',
    name: '鞋服云仓',
    subtitle: '全渠道一盘货与鞋服专用仓配',
    description: `提供B2C+B2B+O2O全渠道仓配、库存同步和门店补货服务。实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}，${CLAIM_TEXT.shippingSla}。`,
    features: [
      `发货准确率${CLAIM_TEXT.shippingAccuracy}，库存准确率${CLAIM_TEXT.inventoryAccuracy}`,
      CLAIM_TEXT.shippingSla,
      `实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}`,
      'RFID、电子标签与出库复核协同管理款色码',
      '支持唯品会JIT/JITX等项目，平台规则按项目核验',
    ],
  },
  {
    slug: 'quality-inspection',
    name: '退货质检与瑕疵修复',
    subtitle: `${CLAIM_TEXT.recognizableAnomalies}异常识别，${CLAIM_TEXT.returnTurnaround}二次上架`,
    description: `与广检集团合作QC团队，按AQL 1.0–6.5执行；质检技师经广检集团资深讲师培训认证。可识别7大类${CLAIM_TEXT.recognizableAnomalies}异常，按质检结果进入对应修复流程；退货质检与二次上架${CLAIM_TEXT.returnTurnaround}，瑕疵修复成功率${CLAIM_TEXT.repairSuccessRate}。`,
    features: [
      `可识别7大类${CLAIM_TEXT.recognizableAnomalies}异常`,
      `退货质检与二次上架${CLAIM_TEXT.returnTurnaround}，平均拆包4小时、质检12小时`,
      `瑕疵修复成功率${CLAIM_TEXT.repairSuccessRate}`,
      '设置九大修复专区，完成后按品牌标准复检',
      `全年新货质检${CLAIM_TEXT.newGoodsInspectionAnnual}，退货质检${CLAIM_TEXT.returnInspectionAnnual}`,
    ],
  },
  {
    slug: 'logistics-cloud',
    name: '物流数字化能力',
    subtitle: '六大系统模块与OTD物流服务中台协同',
    description:
      '以OTD物流服务中台为数字化底座，由物流网关、WMS、LMS、人效通、发货时效监控、轨迹与签收监控六大模块协同订单、库存、仓内作业与物流履约，支持路由、轨迹和异常管理。',
    features: [
      '运到已对接顺丰、京东、EMS等11家主流承运商',
      '物流轨迹与异常节点可视化',
      '可采用奇门、EDI、API或客户定制接口',
      '不收系统使用费；实施、接口联调、定制开发和其他服务费用按方案确认',
      '在线工单与运营报表支持履约复盘',
    ],
  },
] satisfies HomeServiceSource[]
