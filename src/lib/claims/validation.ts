import type { BrandClaim, ClaimStatus } from './types'

export type ClaimRegistry = Readonly<Record<string, BrandClaim>>

export type ClaimContractErrorCode =
  | 'unknown_claim'
  | 'duplicate_claim_key'
  | 'not_approved'
  | 'expired'
  | 'page_not_allowed'
  | 'empty_display_value'
  | 'missing_raw_value'
  | 'missing_unit'
  | 'empty_scope'
  | 'invalid_source_type'
  | 'missing_source_reference'
  | 'missing_verified_by'
  | 'invalid_verified_at'
  | 'invalid_expires_at'
  | 'invalid_publish_status'
  | 'empty_allowed_pages'
  | 'missing_period_note'

export class ClaimContractError extends Error {
  readonly code: ClaimContractErrorCode
  readonly claimKey: string
  readonly pageScope?: string

  constructor(code: ClaimContractErrorCode, claimKey: string, pageScope?: string) {
    super(`[claims:${code}] claimKey=${claimKey}${pageScope ? ` pageScope=${pageScope}` : ''}`)
    this.name = 'ClaimContractError'
    this.code = code
    this.claimKey = claimKey
    this.pageScope = pageScope
  }
}

const SOURCE_TYPES = new Set(['user_confirmation', 'company_material', 'operational_record'])
const CLAIM_STATUSES = new Set<ClaimStatus>([
  'draft',
  'pending_review',
  'approved',
  'expired',
  'rejected',
])

function validDate(value: string) {
  return value.trim().length > 0 && Number.isFinite(Date.parse(value))
}

function assertClaimMetadata(claim: BrandClaim, alias: string) {
  if (!claim.displayValue.trim()) throw new ClaimContractError('empty_display_value', alias)
  if (claim.rawValue === null || claim.rawValue === undefined || claim.rawValue === '') {
    throw new ClaimContractError('missing_raw_value', alias)
  }
  if (typeof claim.unit !== 'string') throw new ClaimContractError('missing_unit', alias)
  if (!claim.scope.trim()) throw new ClaimContractError('empty_scope', alias)
  if (!SOURCE_TYPES.has(claim.sourceType)) {
    throw new ClaimContractError('invalid_source_type', alias)
  }
  if (!claim.sourceReference.trim()) {
    throw new ClaimContractError('missing_source_reference', alias)
  }
  if (!claim.verifiedBy.trim()) throw new ClaimContractError('missing_verified_by', alias)
  if (!validDate(claim.verifiedAt)) throw new ClaimContractError('invalid_verified_at', alias)
  if (claim.expiresAt !== null && !validDate(claim.expiresAt)) {
    throw new ClaimContractError('invalid_expires_at', alias)
  }
  if (!CLAIM_STATUSES.has(claim.publishStatus)) {
    throw new ClaimContractError('invalid_publish_status', alias)
  }
  if (!claim.allowedPages.length) throw new ClaimContractError('empty_allowed_pages', alias)
  if (
    claim.periodStart === null &&
    claim.periodEnd === null &&
    !/(统计周期|统计年度|不适用|待.{0,12}补录|未提供)/u.test(claim.notes)
  ) {
    throw new ClaimContractError('missing_period_note', alias)
  }
}

export function validateClaimRegistry(registry: ClaimRegistry) {
  const canonicalKeys = new Set<string>()
  for (const [alias, claim] of Object.entries(registry)) {
    assertClaimMetadata(claim, alias)
    if (canonicalKeys.has(claim.claimKey)) {
      throw new ClaimContractError('duplicate_claim_key', claim.claimKey)
    }
    canonicalKeys.add(claim.claimKey)
  }
  return registry
}

export function resolveApprovedClaim<Registry extends ClaimRegistry, Key extends keyof Registry>(
  registry: Registry,
  key: Key,
  pageScope: string,
  now = new Date()
): Registry[Key] {
  const alias = String(key)
  const claim = registry[key]
  if (!claim) throw new ClaimContractError('unknown_claim', alias, pageScope)
  assertClaimMetadata(claim, alias)
  if (claim.publishStatus !== 'approved') {
    throw new ClaimContractError('not_approved', alias, pageScope)
  }
  if (!claim.allowedPages.includes('*') && !claim.allowedPages.includes(pageScope)) {
    throw new ClaimContractError('page_not_allowed', alias, pageScope)
  }
  if (claim.expiresAt && Date.parse(claim.expiresAt) <= now.getTime()) {
    throw new ClaimContractError('expired', alias, pageScope)
  }
  return claim
}
