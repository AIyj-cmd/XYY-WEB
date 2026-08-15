import { describe, expect, it, vi } from 'vitest'

import {
  applyCmsContractPlan,
  buildCmsContractMigrationPlan,
} from '../../scripts/lib/cms-contract-migration.mjs'

const mappings = {
  warehouses: {
    201: {
      targetStableKey: 'warehouse-guangzhou-huangpu',
      expectedBefore: { name: '旧显示名' },
    },
  },
}

const pendingWarehouseIdentity = () => ({
  records: { warehouses: [{ id: 201, name: '旧显示名' }] },
  fields: { warehouses: [] },
})

describe('CMS contract identity schema migration', () => {
  it('creates nullable identity fields, backfills, then tightens required and unique in order', async () => {
    const plan = buildCmsContractMigrationPlan(pendingWarehouseIdentity(), mappings)
    expect(plan.issues).toEqual([])
    expect(plan.schemaChanges.map(({ phase }) => phase)).toEqual([
      'create_nullable',
      'require',
      'unique',
    ])
    const directus = {
      request: vi.fn(async (method: string, ...requestArgs: [string, unknown?]) => {
        void requestArgs
        return method === 'GET' ? [{ id: 201, content_key: 'warehouse-guangzhou-huangpu' }] : {}
      }),
    }
    await applyCmsContractPlan(directus, plan, { apply: true })
    expect(directus.request.mock.calls.map(([method, path]) => `${method} ${path}`)).toEqual([
      'POST /fields/warehouses',
      'PATCH /items/warehouses/201',
      'GET /items/warehouses?limit=-1&fields=id,content_key',
      'PATCH /fields/warehouses/content_key',
      'PATCH /fields/warehouses/content_key',
    ])
    expect(directus.request.mock.calls[0][2]).toMatchObject({
      meta: { required: false, readonly: true },
      schema: { is_nullable: true, is_unique: false },
    })
    expect(directus.request.mock.calls[3][2]).toMatchObject({
      meta: { required: true },
      schema: { is_nullable: false },
    })
    expect(directus.request.mock.calls[4][2]).toEqual({ schema: { is_unique: true } })
  })

  it('can safely replan after a failure between field creation and record backfill', async () => {
    const first = buildCmsContractMigrationPlan(pendingWarehouseIdentity(), mappings)
    const failing = {
      request: vi.fn(async (method: string, path: string) => {
        if (method === 'PATCH' && path.startsWith('/items/')) throw new Error('interrupted')
        return {}
      }),
    }
    await expect(applyCmsContractPlan(failing, first, { apply: true })).rejects.toThrow(
      'interrupted'
    )

    const retryPlan = buildCmsContractMigrationPlan(
      {
        records: { warehouses: [{ id: 201, name: '旧显示名' }] },
        fields: {
          warehouses: [
            {
              field: 'content_key',
              type: 'string',
              meta: { required: false },
              schema: { is_nullable: true, is_unique: false },
            },
          ],
        },
      },
      mappings
    )
    expect(retryPlan.schemaChanges.map(({ phase }) => phase)).toEqual(['require', 'unique'])
    const retry = {
      request: vi.fn(async (method: string) =>
        method === 'GET' ? [{ id: 201, content_key: 'warehouse-guangzhou-huangpu' }] : {}
      ),
    }
    await expect(applyCmsContractPlan(retry, retryPlan, { apply: true })).resolves.toEqual({
      applied: 1,
      schemaApplied: 2,
    })
  })

  it('rechecks remote nulls and duplicates before tightening schema constraints', async () => {
    const plan = buildCmsContractMigrationPlan(pendingWarehouseIdentity(), mappings)
    const directus = {
      request: vi.fn(async (method: string, ...requestArgs: [string, unknown?]) => {
        void requestArgs
        return method === 'GET' ? [{ id: 201, content_key: null }] : {}
      }),
    }
    await expect(applyCmsContractPlan(directus, plan, { apply: true })).rejects.toThrow(
      /migration_required:identity_null collection=warehouses field=content_key/
    )
    expect(
      directus.request.mock.calls.filter(
        ([method, path]) => method === 'PATCH' && path === '/fields/warehouses/content_key'
      )
    ).toHaveLength(0)
  })

  it('produces zero schema or content changes after all phases are reflected', () => {
    const migrated = {
      records: {
        warehouses: [{ id: 201, name: '已改显示名', content_key: 'warehouse-guangzhou-huangpu' }],
      },
      fields: {
        warehouses: [
          {
            field: 'content_key',
            type: 'string',
            meta: { required: true },
            schema: { is_nullable: false, is_unique: true },
          },
        ],
      },
    }
    expect(buildCmsContractMigrationPlan(migrated, mappings)).toMatchObject({
      changes: [],
      schemaChanges: [],
      issues: [],
    })
  })
})
