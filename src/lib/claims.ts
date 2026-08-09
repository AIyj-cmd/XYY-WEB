/**
 * Stable public facade for reviewed business claims.
 * Domain records live in `claims/`; consumers should keep importing this file.
 */
import { FULFILLMENT_CLAIMS } from './claims/fulfillment'
import { QUALITY_CLAIMS } from './claims/quality'

export type { BrandClaim, ClaimStatus } from './claims/types'

export const BRAND_CLAIMS = {
  ...FULFILLMENT_CLAIMS,
  ...QUALITY_CLAIMS,
} as const

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
  Object.keys(BRAND_CLAIMS).map((key) => [key, getApprovedClaim(key as BrandClaimKey).displayValue])
) as Record<BrandClaimKey, string>
