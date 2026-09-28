import { describe, expect, it } from 'vitest'

import { CASE_CLAIMS, CASE_CLAIM_PAGE_SCOPES, getApprovedCaseClaim } from '@/lib/claims/cases'
import { validateClaimRegistry } from '@/lib/claims/validation'

describe('English case claim registry', () => {
  it('keeps case claims separate from the global brand-claim key guard and validates them', () => {
    expect(() => validateClaimRegistry(CASE_CLAIMS)).not.toThrow()
    expect(Object.keys(CASE_CLAIMS).length).toBeGreaterThanOrEqual(32)
    expect(new Set(Object.values(CASE_CLAIMS).map((claim) => claim.claimKey))).toHaveLength(
      Object.keys(CASE_CLAIMS).length
    )
  })

  it('records the published snapshot, field and review metadata for every case claim', () => {
    for (const claim of Object.values(CASE_CLAIMS)) {
      expect(claim.allowedPages).toEqual(CASE_CLAIM_PAGE_SCOPES)
      expect(claim.publishStatus).toBe('approved')
      expect(claim.sourceType).toBe('operational_record')
      expect(claim.verifiedAt).toBe('2026-09-28')
      expect(claim.notes).toContain('统计周期未提供')
      expect(claim.notes).toContain('不构成独立业务审计')
    }

    expect(CASE_CLAIMS.urInventory.sourceReference).toContain('slug=ur, field=stats[0]')
    expect(CASE_CLAIMS.toyouthInventoryManagement.sourceReference).toContain(
      'slug=toyouth, field=stats[0]'
    )
    expect(CASE_CLAIMS.inmanInventoryManagement.sourceReference).toContain(
      'Existing audited offline fallback'
    )
  })

  it('resolves complete units, ranges and non-numeric capabilities only on the approved case scopes', () => {
    expect(getApprovedCaseClaim('urInventory', 'cases')).toMatchObject({
      displayValue: '2,600,000+',
      rawValue: 2600000,
      unit: 'units',
    })
    expect(getApprovedCaseClaim('meiyiAnnualDispatch', 'cases')).toMatchObject({
      displayValue: '1,000,000–1,500,000',
      rawValue: '1000000–1500000',
      unit: 'units/year',
    })
    expect(getApprovedCaseClaim('urFlagshipGrowth', 'cases')).toMatchObject({
      displayValue: '116',
      rawValue: 116,
      unit: '%',
    })
    expect(getApprovedCaseClaim('romiReplenishment', 'home')).toMatchObject({
      displayValue: 'Fast replenishment',
      unit: '',
    })
    expect(getApprovedCaseClaim('toyouthBrandOperation', 'llms')).toMatchObject({
      displayValue: 'Online and offline',
      unit: 'integrated operations',
    })
  })
})
