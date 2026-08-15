import { describe, expect, it, vi } from 'vitest'

import { CMS_CONTRACT_BY_COLLECTION } from '../../scripts/data/cms-contract-definitions.mjs'
import {
  loadCollectionSnapshot,
  validateCollectionSnapshot,
} from '../../scripts/lib/cms-contract-runtime.mjs'

const homepage = CMS_CONTRACT_BY_COLLECTION.homepage_content
const faqContract = CMS_CONTRACT_BY_COLLECTION.faqs

type ContractField = {
  field: string
  type: string
  meta?: Record<string, unknown>
  schema?: Record<string, unknown>
}

type ContractRelation = {
  field: string
  related_collection: string
  schema?: Record<string, unknown>
}

const toSnapshotField = (field: ContractField) => ({
  field: field.field,
  type: field.type,
  meta: { required: Boolean(field.meta?.required) },
  schema: {
    is_nullable: field.schema?.is_nullable ?? !field.meta?.required,
    is_unique: Boolean(field.schema?.is_unique),
    ...(Object.hasOwn(field.schema ?? {}, 'default_value')
      ? { default_value: field.schema?.default_value }
      : {}),
  },
})

const validHomepageSnapshot = {
  collection: { collection: 'homepage_content', meta: { singleton: true } },
  fields: homepage.fields.map((field: ContractField) => toSnapshotField(field)),
  relations: [],
  records: [{ id: 1, key: 'main' }],
}

describe('CMS contract runtime validation', () => {
  it('accepts a compatible collection snapshot', () => {
    expect(validateCollectionSnapshot(homepage, validHomepageSnapshot)).toEqual({
      errors: [],
      warnings: [],
    })
  })

  it.each([
    ['field_type', { type: 'integer' }],
    ['required', { meta: { required: false }, schema: { is_nullable: true, is_unique: true } }],
    ['unique', { schema: { is_nullable: false, is_unique: false } }],
  ])('blocks incompatible stable identity %s semantics', (kind, patch) => {
    const snapshot = structuredClone(validHomepageSnapshot)
    const field = snapshot.fields.find((candidate: ContractField) => candidate.field === 'key')!
    Object.assign(field, patch)
    const result = validateCollectionSnapshot(homepage, snapshot)
    expect(result.errors.join('\n')).toContain(`migration_required:${kind}`)
  })

  it('blocks an incompatible singleton contract', () => {
    const snapshot = structuredClone(validHomepageSnapshot)
    snapshot.collection.meta.singleton = false
    expect(validateCollectionSnapshot(homepage, snapshot).errors.join('\n')).toContain(
      'migration_required:singleton'
    )
  })

  it('blocks an incompatible default value', () => {
    const contract = CMS_CONTRACT_BY_COLLECTION.contact_leads
    const snapshot = {
      collection: { collection: 'contact_leads', meta: { singleton: false } },
      fields: contract.fields.map((field: ContractField) => {
        return {
          field: field.field,
          type: field.type,
          meta: { required: Boolean(field.meta?.required) },
          schema: {
            is_nullable: !field.meta?.required,
            is_unique: Boolean(field.schema?.is_unique),
            default_value: field.field === 'source' ? 'legacy' : field.schema?.default_value,
          },
        }
      }),
      relations: [],
      records: [],
    }
    expect(validateCollectionSnapshot(contract, snapshot).errors.join('\n')).toContain(
      'migration_required:default'
    )
  })

  it.each([
    ['relation_target', { related_collection: 'services' }],
    ['relation_on_delete', { schema: { on_delete: 'CASCADE' } }],
  ])('blocks incompatible FAQ %s semantics', (kind, patch) => {
    const relation = (faqContract as { relations: ContractRelation[] }).relations[0]
    const snapshot = {
      collection: { collection: 'faqs', meta: { singleton: false } },
      fields: faqContract.fields.map((field: ContractField) => toSnapshotField(field)),
      relations: [
        {
          field: relation.field,
          related_collection: relation.related_collection,
          schema: { on_delete: relation.schema?.on_delete ?? null },
          ...patch,
        },
      ],
      records: [{ id: 1, content_key: 'faq-home-service-fit' }],
    }
    expect(validateCollectionSnapshot(faqContract, snapshot).errors.join('\n')).toContain(
      `migration_required:${kind}`
    )
  })

  it('emits an explicit warning for an approved legacy field exception', () => {
    const contract = CMS_CONTRACT_BY_COLLECTION.cases
    const result = validateCollectionSnapshot(contract, {
      collection: { collection: 'cases', meta: { singleton: false } },
      fields: [{ field: 'image_file', type: 'string', meta: {}, schema: {} }],
      relations: [],
      records: [],
    })
    expect(result.warnings.join('\n')).toContain('legacy_field collection=cases field=image_file')
  })

  it.each([
    ['homepage_stats', 'metric_key'],
    ['case_stats', 'metric_key'],
    ['service_stats', 'metric_key'],
    ['service_features', 'content_key'],
  ])('does not require retired legacy identity field %s.%s', (collection, field) => {
    const contract = CMS_CONTRACT_BY_COLLECTION[collection]
    expect(contract.fields.some((candidate: ContractField) => candidate.field === field)).toBe(
      false
    )
    expect(contract.identity.fields).toEqual([])
  })

  it.each([
    ['cases', 'metrics'],
    ['news', 'summary'],
    ['news', 'published_at'],
  ])('accepts the current string contract for %s.%s', (collection, field) => {
    const contract = CMS_CONTRACT_BY_COLLECTION[collection]
    expect(
      contract.fields.find((candidate: ContractField) => candidate.field === field)?.type
    ).toBe('string')
  })

  it('does not read retained legacy records while verifying their schema', async () => {
    const contract = CMS_CONTRACT_BY_COLLECTION.case_stats
    const request = vi.fn(async (_method: string, path: string) => {
      if (path === '/collections/case_stats') {
        return { collection: 'case_stats', meta: { singleton: false } }
      }
      if (path === '/fields/case_stats') {
        return contract.fields.map((field: ContractField) => toSnapshotField(field))
      }
      return []
    })
    await expect(loadCollectionSnapshot({ request }, contract)).resolves.toMatchObject({
      records: [],
    })
    expect(request.mock.calls.some(([, path]) => path.startsWith('/items/case_stats'))).toBe(false)
  })

  it('blocks an unknown legacy exception instead of weakening validation', () => {
    const result = validateCollectionSnapshot(homepage, validHomepageSnapshot, {
      legacyAllowlist: [
        {
          collection: 'homepage_content',
          field: 'unknown_field',
          reason: 'test only',
          removeWhen: 'never',
        },
      ],
    })
    expect(result.errors.join('\n')).toContain('migration_required:unknown_legacy_exception')
  })

  it('verifies private collection schema without reading private records', async () => {
    const contract = CMS_CONTRACT_BY_COLLECTION.contact_leads
    const request = vi.fn(async (_method: string, path: string) => {
      if (path === '/collections/contact_leads') {
        return { collection: 'contact_leads', meta: { singleton: false } }
      }
      if (path === '/fields/contact_leads') {
        return contract.fields.map((field: ContractField) => toSnapshotField(field))
      }
      return []
    })
    await expect(loadCollectionSnapshot({ request }, contract)).resolves.toMatchObject({
      records: [],
    })
    expect(request.mock.calls.some(([, path]) => path.startsWith('/items/contact_leads'))).toBe(
      false
    )
  })
})
