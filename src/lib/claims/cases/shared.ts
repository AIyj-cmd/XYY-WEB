import type { BrandClaim } from '../types'

export const CASE_CLAIM_PAGE_SCOPES = ['home', 'cases', 'llms'] as const
export type CaseClaimPageScope = (typeof CASE_CLAIM_PAGE_SCOPES)[number]

export const caseClaim = (
  claimKey: string,
  displayValue: string,
  rawValue: number | string,
  unit: string,
  scope: string,
  sourceReference: string
) =>
  ({
    claimKey,
    displayValue,
    rawValue,
    unit,
    scope,
    periodStart: null,
    periodEnd: null,
    sourceType: 'operational_record',
    sourceReference,
    verifiedBy: 'XYY case-source review',
    verifiedAt: '2026-09-28',
    expiresAt: null,
    publishStatus: 'approved',
    allowedPages: CASE_CLAIM_PAGE_SCOPES,
    notes: '统计周期未提供；仅对 Directus 已发布案例快照进行英文表达核对，不构成独立业务审计。',
  }) satisfies BrandClaim

export const publishedSource = (slug: string, field: string) =>
  `Directus cases published GET (200), slug=${slug}, field=${field}; tracked snapshot tests/fixtures/cases.published.json; verified against output/diagnostics/xyy-20260928-04/published-cases.json on 2026-09-28.`

export const fallbackSource = (slug: string, field: string) =>
  `Existing audited offline fallback, slug=${slug}, field=${field}; src/data/brand/case-details.ts via src/data/cases/fallbacks.ts, verified on 2026-09-28.`
