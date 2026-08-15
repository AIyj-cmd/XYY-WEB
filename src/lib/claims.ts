/**
 * Stable public facade for reviewed business claims.
 * Domain records live in `claims/`; consumers should keep importing this file.
 */
import { FULFILLMENT_CLAIMS } from './claims/fulfillment'
import { presentClaim } from './claims/presentation'
import { QUALITY_CLAIMS } from './claims/quality'
import {
  ClaimContractError,
  resolveApprovedClaim,
  validateClaimRegistry,
} from './claims/validation'

export type { BrandClaim, ClaimStatus } from './claims/types'
export { ClaimContractError, resolveApprovedClaim, validateClaimRegistry }

export const BRAND_CLAIMS = {
  ...FULFILLMENT_CLAIMS,
  ...QUALITY_CLAIMS,
} as const

export type BrandClaimKey = keyof typeof BRAND_CLAIMS
type GlobalBrandClaimKey = {
  [Key in BrandClaimKey]: '*' extends (typeof BRAND_CLAIMS)[Key]['allowedPages'][number]
    ? Key
    : never
}[BrandClaimKey]

validateClaimRegistry(BRAND_CLAIMS)

export function isBrandClaimKey(key: string): key is BrandClaimKey {
  return Object.prototype.hasOwnProperty.call(BRAND_CLAIMS, key)
}

export function getApprovedClaim(key: BrandClaimKey, pageScope: string) {
  return resolveApprovedClaim(BRAND_CLAIMS, key, pageScope)
}

export function getClaimText(key: BrandClaimKey, pageScope: string) {
  return getApprovedClaim(key, pageScope).displayValue
}

export function getClaimPresentation(key: BrandClaimKey, pageScope: string) {
  return presentClaim(getApprovedClaim(key, pageScope))
}

export const CLAIM_TEXT = Object.fromEntries(
  Object.keys(BRAND_CLAIMS)
    .filter((key) => BRAND_CLAIMS[key as BrandClaimKey].allowedPages.includes('*'))
    .map((key) => [key, getClaimText(key as BrandClaimKey, '*')])
) as Record<GlobalBrandClaimKey, string>
