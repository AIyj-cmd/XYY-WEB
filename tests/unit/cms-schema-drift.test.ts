import { describe, expect, it } from 'vitest'

import { CMS_CONTRACT_BY_COLLECTION } from '../../scripts/data/cms-contract-definitions.mjs'
import { validateCollectionSnapshot } from '../../scripts/lib/cms-contract-runtime.mjs'

type ContractField = {
  field: string
  type: string
  meta?: Record<string, unknown>
  schema?: Record<string, unknown>
}

const snapshotField = (field: ContractField) => ({
  field: field.field,
  type: field.type,
  meta: { required: Boolean(field.meta?.required) },
  schema: {
    is_nullable: !field.meta?.required,
    is_unique: Boolean(field.schema?.is_unique),
    ...field.schema,
  },
})

describe('migrated CMS schema drift', () => {
  it.each([
    ['cases', 'metrics', 'string', false, 'field_type'],
    ['news', 'summary', 'string', true, 'field_type'],
    ['news', 'published_at', 'string', false, 'field_type'],
    ['faqs', 'page_key', 'string', false, 'required'],
    ['about_honors', 'image', 'string', false, 'required'],
  ])('rejects a drifted schema for %s.%s', (collection, field, type, isRequired, errorKind) => {
    const contract = CMS_CONTRACT_BY_COLLECTION[collection]
    const fields = contract.fields.map((candidate: ContractField) => {
      const actual = snapshotField(candidate)
      return candidate.field === field
        ? {
            ...actual,
            type,
            meta: { required: isRequired },
            schema: { ...actual.schema, is_nullable: !isRequired },
          }
        : actual
    })
    const result = validateCollectionSnapshot(contract, {
      collection: { collection, meta: { singleton: Boolean(contract.meta?.singleton) } },
      fields,
      relations: contract.relations ?? [],
      records: [],
    })
    expect(result.errors.join('\n')).toContain(`migration_required:${errorKind}`)
  })
})
