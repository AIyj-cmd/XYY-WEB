import type { HomepageStat, Service } from '@/lib/directus'
import { CLAIM_TEXT } from '@/lib/claims'

const withoutSuffix = (value: string, suffix: string) => value.replace(suffix, '')

export const HOME_STATS_FALLBACKS: HomepageStat[] = [
  {
    id: 1,
    sort: 1,
    value: CLAIM_TEXT.partnerBrands,
    label: '合作品牌',
    unit: '家',
    detail: '鞋服及相关细分行业',
  },
  {
    id: 2,
    sort: 2,
    value: withoutSuffix(CLAIM_TEXT.warehouseArea, '㎡'),
    label: '直营仓储',
    unit: '㎡',
    detail: '华南、华东、华中仓网',
  },
  {
    id: 3,
    sort: 3,
    value: CLAIM_TEXT.coveredCities,
    label: '覆盖城市',
    unit: '个',
    detail: '仓配与运输服务网络',
  },
  {
    id: 4,
    sort: 4,
    value: CLAIM_TEXT.managedSkus,
    label: '管理SKU',
    unit: '',
    detail: '鞋服款色码精细管理',
  },
  {
    id: 5,
    sort: 5,
    value: withoutSuffix(CLAIM_TEXT.newGoodsInspectionAnnual, '件'),
    label: '全年新货质检',
    unit: '件',
    detail: '按项目规则验货',
  },
  {
    id: 6,
    sort: 6,
    value: withoutSuffix(CLAIM_TEXT.returnInspectionAnnual, '件'),
    label: '全年退货质检',
    unit: '件',
    detail: '质检、分流与二次上架',
  },
  {
    id: 7,
    sort: 7,
    value: withoutSuffix(CLAIM_TEXT.inventoryAccuracy, '%'),
    label: '库存准确率',
    unit: '%',
    detail: '系统与仓内流程协同',
  },
  {
    id: 8,
    sort: 8,
    value: CLAIM_TEXT.servedStores,
    label: '服务门店',
    unit: '家',
    detail: '连锁与全渠道零售场景',
  },
]

export const HOME_SERVICE_FALLBACKS: Service[] = [
  {
    id: 1,
    sort: 1,
    slug: 'cloud-warehouse',
    icon: 'warehouse',
    name: '鞋服云仓',
    subtitle: '全渠道一盘货与鞋服专用仓配',
    description: '提供B2C+B2B+O2O全渠道仓配、库存同步和门店补货服务，支持鞋服款色码精细管理。',
    features: [
      `发货准确率${CLAIM_TEXT.shippingAccuracy}，库存准确率${CLAIM_TEXT.inventoryAccuracy}`,
      CLAIM_TEXT.shippingSla,
      `实际单仓单日峰值${CLAIM_TEXT.singleWarehousePeak}`,
      'RFID、电子标签与出库复核协同管理款色码',
    ],
  },
  {
    id: 2,
    sort: 2,
    slug: 'quality-inspection',
    icon: 'inspection',
    name: '退货质检与瑕疵修复',
    subtitle: `${CLAIM_TEXT.recognizableAnomalies}异常识别，退货质检+二次上架${CLAIM_TEXT.returnTurnaround}`,
    description: '从退货拆包、质检分级到清洁修复和二次上架，为鞋服品牌建立标准化的逆向处理体系。',
    features: [
      `可识别7大类${CLAIM_TEXT.recognizableAnomalies}异常`,
      `退货质检与二次上架${CLAIM_TEXT.returnTurnaround}`,
      `瑕疵修复成功率${CLAIM_TEXT.repairSuccessRate}`,
      '设置九大修复专区，完成后按品牌标准复检',
    ],
  },
  {
    id: 3,
    sort: 3,
    slug: 'logistics-cloud',
    icon: 'logistics',
    name: '物流数字化能力',
    subtitle: '六大系统模块与OTD物流服务中台协同',
    description: '连接订单、库存、仓内作业、物流轨迹与签收数据，支持异常预警和履约状态查询。',
    features: [
      '多系统协同统一订单与库存数据',
      '物流轨迹与异常节点可视化',
      '支持奇门、EDI、API及客户定制接口',
      '在线工单与运营报表支持履约复盘',
    ],
  },
]
