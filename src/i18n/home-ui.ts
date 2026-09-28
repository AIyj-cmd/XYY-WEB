import type { BrandClaimKey } from '@/lib/claims'
import type { SiteLocale } from '@/i18n/routes'
import { homeUiEn } from './home-ui-en'
import { homeUiZh } from './home-ui-zh'

export type HomeUi = typeof homeUiEn

export const homeUi = (locale: SiteLocale = 'zh-CN'): HomeUi =>
  locale === 'en' ? homeUiEn : (homeUiZh as unknown as HomeUi)

export const homeStatGroup = (claimKey: BrandClaimKey | undefined) => {
  if (claimKey === 'warehouseArea' || claimKey === 'managedSkus') return 'warehouse'
  if (claimKey === 'partnerBrands' || claimKey === 'servedStores' || claimKey === 'coveredCities')
    return 'network'
  if (claimKey === 'newGoodsInspectionAnnual' || claimKey === 'returnInspectionAnnual')
    return 'inspection'
  return claimKey === 'inventoryAccuracy' ? 'accuracy' : undefined
}
