import { describe, expect, it } from 'vitest'

import {
  getApprovedClaim,
  getClaimPresentation,
  getClaimText,
  resolveApprovedClaim,
  validateClaimRegistry,
} from '@/lib/claims'
import { interpolateClaimTemplate } from '@/lib/claims/interpolation'
import type { BrandClaim } from '@/lib/claims/types'

const reviewedClaim = (overrides: Partial<BrandClaim> = {}): BrandClaim => ({
  claimKey: 'fixture_claim',
  displayValue: '12单位',
  rawValue: 12,
  unit: '单位',
  scope: '测试范围',
  periodStart: null,
  periodEnd: null,
  sourceType: 'company_material',
  sourceReference: '测试资料索引',
  verifiedBy: '测试审核角色',
  verifiedAt: '2026-08-01',
  expiresAt: null,
  publishStatus: 'approved',
  allowedPages: ['home'],
  notes: '测试事实不适用统计周期。',
  ...overrides,
})

describe('reviewed business claim contract', () => {
  it('rejects duplicate canonical claim keys', () => {
    const registry = {
      first: reviewedClaim(),
      second: reviewedClaim({ displayValue: '13单位', rawValue: 13 }),
    }

    expect(() => validateClaimRegistry(registry)).toThrow(/duplicate_claim_key.*fixture_claim/i)
  })

  it.each([
    ['unapproved', { publishStatus: 'pending_review' as const }, /not_approved/i],
    ['expired', { expiresAt: '2025-01-01' }, /expired/i],
    ['disallowed page', { allowedPages: ['about'] }, /page_not_allowed/i],
    ['invalid verified date', { verifiedAt: 'not-a-date' }, /invalid_verified_at/i],
    ['missing source reference', { sourceReference: '' }, /missing_source_reference/i],
    ['empty allowed pages', { allowedPages: [] }, /empty_allowed_pages/i],
  ])('rejects %s claims before public use', (_name, overrides, expected) => {
    const registry = { fixture: reviewedClaim(overrides) }

    expect(() =>
      resolveApprovedClaim(registry, 'fixture', 'home', new Date('2026-08-15T00:00:00Z'))
    ).toThrow(expected)
  })

  it('provides one presentation split without duplicating its unit', () => {
    const area = getClaimPresentation('warehouseArea', 'home')
    const peak = getClaimPresentation('singleWarehousePeak', 'home')

    expect(`${area.value}${area.unit}`).toBe(getClaimText('warehouseArea', 'home'))
    expect(`${peak.value}${peak.unit}`).toBe(getClaimText('singleWarehousePeak', 'home'))
    expect(area.text).toBe(getApprovedClaim('warehouseArea', 'home').displayValue)
  })
})

describe('strict CMS claim interpolation', () => {
  const registry = {
    fixture: reviewedClaim(),
    pending: reviewedClaim({ claimKey: 'pending_claim', publishStatus: 'pending_review' }),
    expired: reviewedClaim({ claimKey: 'expired_claim', expiresAt: '2025-01-01' }),
    aboutOnly: reviewedClaim({ claimKey: 'about_claim', allowedPages: ['about'] }),
  }
  const context = {
    pageScope: 'home',
    source: { collection: 'faqs', recordId: 'fixture', field: 'answer' },
    now: new Date('2026-08-15T00:00:00Z'),
  }

  it('replaces an approved placeholder', () => {
    expect(interpolateClaimTemplate('值：{{fixture}}', context, registry)).toBe('值：12单位')
  })

  it.each([
    ['unknown', '{{missing}}', /unknown_claim/i],
    ['unapproved', '{{pending}}', /not_approved/i],
    ['expired', '{{expired}}', /expired/i],
    ['page-disallowed', '{{aboutOnly}}', /page_not_allowed/i],
  ])('fails for %s placeholders', (_name, value, expected) => {
    expect(() => interpolateClaimTemplate(value, context, registry)).toThrow(expected)
  })

  it('never returns unresolved claim syntax', () => {
    const output = interpolateClaimTemplate('值：{{fixture}}', context, registry)
    expect(output).not.toMatch(/\{\{[^}]+\}\}/)
  })
})
