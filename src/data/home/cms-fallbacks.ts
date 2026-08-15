import type { HomepageStat, Service } from '@/lib/directus'
import { CLAIM_TEXT, getClaimPresentation, type BrandClaimKey } from '@/lib/claims'

function fallbackStat(
  id: number,
  claimKey: BrandClaimKey,
  label: string,
  detail: string
): HomepageStat {
  const { value, unit } = getClaimPresentation(claimKey, 'home')
  return { id, sort: id, claimKey, value, unit, label, detail }
}

export const HOME_STATS_FALLBACKS: HomepageStat[] = [
  fallbackStat(1, 'partnerBrands', '合作品牌', '鞋服及相关细分行业'),
  fallbackStat(2, 'warehouseArea', '直营仓储', '华南、华东、华中仓网'),
  fallbackStat(3, 'coveredCities', '覆盖城市', '仓配与运输服务网络'),
  fallbackStat(4, 'managedSkus', '管理SKU', '鞋服款色码精细管理'),
  fallbackStat(5, 'newGoodsInspectionAnnual', '全年新货质检', '按项目规则验货'),
  fallbackStat(6, 'returnInspectionAnnual', '全年退货质检', '质检、分流与二次上架'),
  fallbackStat(7, 'inventoryAccuracy', '库存准确率', '系统与仓内流程协同'),
  fallbackStat(8, 'servedStores', '服务门店', '连锁与全渠道零售场景'),
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
