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

export const ALL_PUBLIC_PAGES = ['*'] as const
