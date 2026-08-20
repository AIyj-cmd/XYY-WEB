import { describe, expect, it, vi } from 'vitest'

import {
  applyCmsContractPlan,
  buildCmsContractMigrationPlan,
  readCmsContractMigrationSnapshot,
} from '../../scripts/lib/cms-contract-migration.mjs'

const newsFields = (coverDataType: string) => [
  {
    field: 'slug',
    type: 'string',
    meta: { required: true },
    schema: { is_nullable: false, is_unique: true },
  },
  {
    field: 'cover_image',
    type: 'uuid',
    meta: { interface: 'file-image', special: ['file'] },
    schema: { data_type: coverDataType, is_nullable: true },
  },
]

const fileRelation = {
  collection: 'news',
  field: 'cover_image',
  related_collection: 'directus_files',
  schema: { on_delete: 'SET NULL' },
  meta: {
    many_collection: 'news',
    many_field: 'cover_image',
    one_collection: 'directus_files',
    one_field: null,
    one_deselect_action: 'nullify',
  },
}

function snapshot(coverDataType: string, relations: unknown[] = []) {
  return {
    records: { news: [] },
    fields: { news: newsFields(coverDataType) },
    relations: { news: relations },
  }
}

describe('CMS news cover relation migration', () => {
  it('plans and applies the file relation after converting the physical column to UUID', async () => {
    const plan = buildCmsContractMigrationPlan(snapshot('character varying'))

    expect(plan.issues).toEqual([])
    expect(plan.schemaChanges).toEqual([
      { phase: 'type', collection: 'news', field: 'cover_image', type: 'uuid' },
      { phase: 'relation', ...fileRelation },
    ])

    const directus = { request: vi.fn(async () => ({})) }
    await expect(applyCmsContractPlan(directus, plan, { apply: true })).resolves.toEqual({
      applied: 0,
      schemaApplied: 2,
    })
    expect(directus.request.mock.calls).toEqual([
      ['PATCH', '/fields/news/cover_image', { type: 'uuid', schema: {} }],
      ['POST', '/relations', fileRelation],
    ])
  })

  it('repairs a missing relation after an interrupted type migration and then replans to zero', () => {
    const interrupted = buildCmsContractMigrationPlan(snapshot('uuid'))
    expect(interrupted.issues).toEqual([])
    expect(interrupted.schemaChanges).toEqual([{ phase: 'relation', ...fileRelation }])

    expect(buildCmsContractMigrationPlan(snapshot('uuid', [fileRelation]))).toMatchObject({
      changes: [],
      schemaChanges: [],
      issues: [],
    })
  })

  it('reads relation metadata for relation-bearing contract collections', async () => {
    const directus = { request: vi.fn(async () => []) }
    await readCmsContractMigrationSnapshot(directus)
    expect(directus.request).toHaveBeenCalledWith('GET', '/relations/news')
  })
})
