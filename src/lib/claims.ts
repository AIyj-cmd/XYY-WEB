/**
 * Public business-claim registry.
 *
 * This is the single source used while the equivalent Directus `brand_claims`
 * collection is being prepared. Only `approved` claims may be rendered.
 * Missing periods are deliberately left null rather than inferred.
 *
 * TODO(Directus): migrate these records to a reviewed `brand_claims` collection
 * without changing the claim keys consumed by the frontend.
 */
export type ClaimStatus = 'draft' | 'pending_review' | 'approved' | 'expired' | 'rejected'

export interface BrandClaim {
  claimKey: string
  displayValue: string
  rawValue: number | string
  unit: string
  scope: string
  periodStart: string | null
  periodEnd: string | null
  sourceType: 'user_confirmation' | 'company_material' | 'operational_record'
  sourceReference: string
  verifiedBy: string
  verifiedAt: string
  expiresAt: string | null
  publishStatus: ClaimStatus
  allowedPages: readonly string[]
  notes: string
}

const ALL_PUBLIC_PAGES = ['*'] as const

export const BRAND_CLAIMS = {
  shippingSla: {
    claimKey: 'shipping_sla',
    displayValue: '18:00前截单，当日24:00前发出',
    rawValue: '18:00/24:00',
    unit: '',
    scope: '正向订单履约',
    periodStart: null,
    periodEnd: null,
    sourceType: 'user_confirmation',
    sourceReference: 'SEO/GEO上线审计 E-003；用户于2026-07-28确认',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-28',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '不得改写为17:00或当日揽收。',
  },
  returnTurnaround: {
    claimKey: 'return_inspection_relisting_sla',
    displayValue: '24小时',
    rawValue: 24,
    unit: '小时',
    scope: '退货质检与二次上架整体流程',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '不拆分为未经确认的固定等级时效。',
  },
  shippingAccuracy: {
    claimKey: 'shipping_accuracy',
    displayValue: '99.99%',
    rawValue: 99.99,
    unit: '%',
    scope: '发货准确率',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '统计周期待经营数据报告补录。',
  },
  inventoryAccuracy: {
    claimKey: 'inventory_accuracy',
    displayValue: '99.99%',
    rawValue: 99.99,
    unit: '%',
    scope: '库存准确率',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '统计周期待经营数据报告补录。',
  },
  warehouseArea: {
    claimKey: 'direct_operated_warehouse_area',
    displayValue: '50万㎡',
    rawValue: 500000,
    unit: '㎡',
    scope: '全网直营仓储面积',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '不得拆算为未经验证的地区仓面积。',
  },
  partnerBrands: {
    claimKey: 'partner_brand_count',
    displayValue: '140+',
    rawValue: 140,
    unit: '家',
    scope: '合作品牌数量',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '统计周期待合作品牌台账补录。',
  },
  servedStores: {
    claimKey: 'served_store_count',
    displayValue: '10000+',
    rawValue: 10000,
    unit: '家',
    scope: '服务门店数量',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '统计周期待运营台账补录。',
  },
  managedSkus: {
    claimKey: 'managed_sku_count',
    displayValue: '45万+',
    rawValue: 450000,
    unit: 'SKU',
    scope: '管理SKU数量',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '统计周期待运营台账补录。',
  },
  returnInspectionAnnual: {
    claimKey: 'annual_return_inspection_volume',
    displayValue: '1.53亿件',
    rawValue: 153000000,
    unit: '件',
    scope: '全年退货质检量',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '具体统计年度待经营数据报告补录，不在页面虚构年份。',
  },
  newGoodsInspectionAnnual: {
    claimKey: 'annual_new_goods_inspection_volume',
    displayValue: '1.17亿件',
    rawValue: 117000000,
    unit: '件',
    scope: '全年新货质检量',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '具体统计年度待经营数据报告补录，不在页面虚构年份。',
  },
  singleWarehousePeak: {
    claimKey: 'single_warehouse_daily_peak',
    displayValue: '50万单/日',
    rawValue: 500000,
    unit: '单/日',
    scope: '实际单仓单日运营峰值',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '不得与WMS系统容量混写。',
  },
  regionalPeak: {
    claimKey: 'regional_daily_peak',
    displayValue: '100万单/日',
    rawValue: 1000000,
    unit: '单/日',
    scope: '地区单日运营峰值',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '不得表述为日常发货量。',
  },
  recognizableAnomalies: {
    claimKey: 'recognizable_anomaly_count',
    displayValue: '135+种',
    rawValue: 135,
    unit: '种',
    scope: '可识别鞋服异常类型',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '只代表识别能力，不代表全部可以修复。',
  },
  repairSuccessRate: {
    claimKey: 'repair_success_rate',
    displayValue: '90%',
    rawValue: 90,
    unit: '%',
    scope: '瑕疵修复成功率',
    periodStart: null,
    periodEnd: null,
    sourceType: 'company_material',
    sourceReference: '资料库.md（2026-07-27）',
    verifiedBy: '业务负责人',
    verifiedAt: '2026-07-27',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: ALL_PUBLIC_PAGES,
    notes: '统计周期及样本范围待修复项目报表补录。',
  },
} as const satisfies Record<string, BrandClaim>

export type BrandClaimKey = keyof typeof BRAND_CLAIMS

export function getApprovedClaim(key: BrandClaimKey, page = '*') {
  const claim = BRAND_CLAIMS[key]
  const allowedPages = claim.allowedPages as readonly string[]
  if (claim.publishStatus !== 'approved') {
    throw new Error(`Claim "${claim.claimKey}" is not approved for publication`)
  }
  if (!allowedPages.includes('*') && !allowedPages.includes(page)) {
    throw new Error(`Claim "${claim.claimKey}" is not allowed on "${page}"`)
  }
  if (claim.expiresAt && new Date(claim.expiresAt).getTime() <= Date.now()) {
    throw new Error(`Claim "${claim.claimKey}" has expired`)
  }
  return claim
}

export const CLAIM_TEXT = Object.fromEntries(
  Object.keys(BRAND_CLAIMS).map((key) => [
    key,
    getApprovedClaim(key as BrandClaimKey).displayValue,
  ])
) as Record<BrandClaimKey, string>
