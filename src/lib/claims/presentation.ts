import type { BrandClaim } from './types'

export interface ClaimPresentation {
  text: string
  value: string
  unit: string
}

export function presentClaim(claim: BrandClaim): ClaimPresentation {
  const text = claim.displayValue
  const unit = claim.claimKey === 'managed_sku_count' ? '' : claim.unit
  const value = unit && text.endsWith(unit) ? text.slice(0, -unit.length) : text
  return { text, value, unit }
}
