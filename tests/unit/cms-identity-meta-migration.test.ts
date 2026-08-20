import { describe, expect, it, vi } from 'vitest'

import {
  applyCmsContractPlan,
  buildCmsContractMigrationPlan,
} from '../../scripts/lib/cms-contract-migration.mjs'

describe('CMS identity admin metadata migration', () => {
  it('restores editable identity metadata after safe constraint migration', async () => {
    const plan = buildCmsContractMigrationPlan({
      records: {
        services: [{ id: 1, slug: 'warehouse-service' }],
        news: [{ id: 2, slug: 'cms-ui-test' }],
      },
      fields: {
        services: [
          {
            field: 'slug',
            type: 'string',
            meta: { required: true, readonly: true },
            schema: { is_nullable: false, is_unique: true },
          },
        ],
        news: [
          {
            field: 'slug',
            type: 'string',
            meta: { required: true, readonly: true, interface: 'input', options: null },
            schema: { is_nullable: false, is_unique: true },
          },
        ],
      },
    })

    expect(plan.issues).toEqual([])
    expect(plan.schemaChanges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'identity_meta',
          collection: 'services',
          field: 'slug',
          meta: expect.objectContaining({ required: true, readonly: false }),
        }),
        expect.objectContaining({
          phase: 'identity_meta',
          collection: 'news',
          field: 'slug',
          meta: expect.objectContaining({
            required: true,
            readonly: false,
            interface: 'input',
            options: { trim: true, slug: true },
          }),
        }),
      ])
    )

    const directus = { request: vi.fn(async () => ({})) }
    await applyCmsContractPlan(directus, plan, { apply: true })
    expect(directus.request.mock.calls).toEqual(
      expect.arrayContaining([
        [
          'PATCH',
          '/fields/services/slug',
          { meta: expect.objectContaining({ required: true, readonly: false }) },
        ],
        [
          'PATCH',
          '/fields/news/slug',
          {
            meta: expect.objectContaining({
              required: true,
              readonly: false,
              options: { trim: true, slug: true },
            }),
          },
        ],
      ])
    )
  })
})
