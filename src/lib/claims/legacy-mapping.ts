import type { BrandClaimKey } from '../claims'

export const LEGACY_HOMEPAGE_CLAIM_BY_ID: Readonly<Record<number, BrandClaimKey>> = {
  1: 'partnerBrands',
  2: 'warehouseArea',
  3: 'coveredCities',
  4: 'managedSkus',
  5: 'newGoodsInspectionAnnual',
  6: 'returnInspectionAnnual',
  7: 'inventoryAccuracy',
  8: 'servedStores',
}

export function resolveLegacyHomepageClaim(id: number | undefined) {
  return id === undefined ? undefined : LEGACY_HOMEPAGE_CLAIM_BY_ID[id]
}
