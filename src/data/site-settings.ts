import { BRAND } from '@/lib/brand'
import { CLAIM_TEXT } from '@/lib/claims'
import type { SiteSettingsRecord } from '@/lib/directus-types'

export const DEFAULT_SITE_SETTINGS: Omit<SiteSettingsRecord, 'id' | 'status' | 'key'> = {
  phone: BRAND.phone.toll,
  headquarters_label: BRAND.locations.south.label,
  headquarters_address: BRAND.locations.south.address,
  icp: BRAND.icp,
  footer_description: `2011年成立，深耕鞋服物流15年。服务${CLAIM_TEXT.partnerBrands}品牌、${CLAIM_TEXT.servedStores}门店，覆盖${CLAIM_TEXT.coveredCities}城市，直营仓储${CLAIM_TEXT.warehouseArea}。`,
}
