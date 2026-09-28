import type { BrandClaim } from './types'
import { resolveApprovedClaim, validateClaimRegistry } from './validation'
import { INMAN_CASE_CLAIMS } from './cases/inman'
import { MAXRIENY_CASE_CLAIMS } from './cases/maxrieny'
import { MEIYI_CASE_CLAIMS } from './cases/meiyi'
import { ROMI_CASE_CLAIMS } from './cases/romi'
import type { CaseClaimPageScope } from './cases/shared'
import { TOYOUTH_CASE_CLAIMS } from './cases/toyouth'
import { UR_CASE_CLAIMS } from './cases/ur'
import { XINGMIAN_CASE_CLAIMS } from './cases/xingmian'

export { CASE_CLAIM_PAGE_SCOPES, type CaseClaimPageScope } from './cases/shared'

export const CASE_CLAIMS = {
  ...UR_CASE_CLAIMS,
  ...MAXRIENY_CASE_CLAIMS,
  ...XINGMIAN_CASE_CLAIMS,
  ...MEIYI_CASE_CLAIMS,
  ...ROMI_CASE_CLAIMS,
  ...TOYOUTH_CASE_CLAIMS,
  ...INMAN_CASE_CLAIMS,
} as const satisfies Record<string, BrandClaim>

export type CaseClaimKey = keyof typeof CASE_CLAIMS

validateClaimRegistry(CASE_CLAIMS)

export function getApprovedCaseClaim(key: CaseClaimKey, pageScope: CaseClaimPageScope) {
  return resolveApprovedClaim(CASE_CLAIMS, key, pageScope)
}

export function getCaseClaimText(key: CaseClaimKey, pageScope: CaseClaimPageScope) {
  const claim = getApprovedCaseClaim(key, pageScope)
  if (claim.unit === '%') return `${claim.displayValue}%`
  return [claim.displayValue, claim.unit].filter(Boolean).join(' ')
}
