import { describe, expect, it } from 'vitest'

import { CMS_COLLECTION_CONTRACTS, CMS_SCHEMA_VERSION } from '../../config/cms-contract.mjs'
import { CMS_COLLECTION_DEFINITIONS } from '../../scripts/data/cms-collection-definitions.mjs'

const MUTABLE_IDENTITY_FIELDS = new Set(['label', 'name', 'title', 'sort', 'year'])

describe('CMS model contract', () => {
  it('publishes one stable schema version and one contract per collection definition', () => {
    expect(CMS_SCHEMA_VERSION).toBe('2026-08-phase3')
    expect(CMS_COLLECTION_CONTRACTS.map(({ name }) => name)).toEqual(
      CMS_COLLECTION_DEFINITIONS.map(({ name }) => name)
    )
    expect(new Set(CMS_COLLECTION_CONTRACTS.map(({ name }) => name)).size).toBe(
      CMS_COLLECTION_CONTRACTS.length
    )
  })

  it('classifies every collection and never uses mutable display fields as seed identity', () => {
    for (const contract of CMS_COLLECTION_CONTRACTS) {
      expect(['active', 'legacy', 'private']).toContain(contract.lifecycle)
      expect(contract.identity.fields.length).toBeGreaterThan(0)
      expect(['normal', 'migration_only', 'never']).toContain(contract.seedPolicy)
      if (contract.seedPolicy === 'normal') {
        expect(contract.identity.fields.some((field) => MUTABLE_IDENTITY_FIELDS.has(field))).toBe(
          false
        )
      }
    }
  })

  it('keeps legacy seeds migration-only and private seeds disabled', () => {
    const seedPolicies = Object.fromEntries(
      CMS_COLLECTION_CONTRACTS.map(({ name, seedPolicy }) => [name, seedPolicy])
    )
    expect(seedPolicies).toMatchObject({
      case_details: 'migration_only',
      case_stats: 'migration_only',
      service_stats: 'migration_only',
      service_features: 'migration_only',
      contact_leads: 'never',
    })
  })

  it('keeps the confirmed lifecycle boundaries explicit', () => {
    const lifecycle = Object.fromEntries(
      CMS_COLLECTION_CONTRACTS.map(({ name, lifecycle }) => [name, lifecycle])
    )
    expect(lifecycle).toMatchObject({
      homepage_content: 'active',
      services: 'active',
      warehouses: 'active',
      cases: 'active',
      faqs: 'active',
      homepage_stats: 'legacy',
      case_details: 'legacy',
      case_stats: 'legacy',
      service_stats: 'legacy',
      service_features: 'legacy',
      contact_leads: 'private',
    })
  })
})
