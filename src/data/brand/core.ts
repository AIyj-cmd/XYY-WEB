import { getClaimText } from '@/lib/claims'
import { SITE_URL } from '@/lib/site-config'

const seoClaim = (key: Parameters<typeof getClaimText>[0]) => getClaimText(key, 'seo')

export const BRAND = {
  name: '新亦源供应链',
  fullName: '广州新亦源供应链管理有限公司',
  shortName: '新亦源',
  tagline: '让物流更简单·让服务更快捷',
  mission: '让发货更准确、高效、快捷',
  description: `广州新亦源供应链管理有限公司，总部位于广州，2011年成立，专注鞋服仓配与质检服务。合作品牌${seoClaim('partnerBrands')}，直营仓储${seoClaim('warehouseArea')}，服务门店${seoClaim('servedStores')}，管理SKU ${seoClaim('managedSkus')}。`,
  url: SITE_URL,
  icp: '粤ICP备17001688号',
  founded: 2011,
  phone: { toll: '400-6865-156' },
  locations: {
    south: {
      label: '华南总部',
      address: '广东省广州市黄埔区果园一路2号',
      city: '广州',
      region: 'Guangdong',
    },
  },
} as const

export const SERVICE_FACTS = {
  shippingSla: seoClaim('shippingSla'),
  returnTurnaround: seoClaim('returnTurnaround'),
  orderPickupCutoff: '18:00',
  orderDispatchDeadline: '24:00',
  shippingAccuracy: seoClaim('shippingAccuracy'),
  inventoryAccuracy: seoClaim('inventoryAccuracy'),
  returnInspectionAnnual: seoClaim('returnInspectionAnnual'),
  newGoodsInspectionAnnual: seoClaim('newGoodsInspectionAnnual'),
  repairSuccessRate: seoClaim('repairSuccessRate'),
  recognizableDefects: seoClaim('recognizableAnomalies'),
  defectCategories: '7大类',
} as const
