import { describe, expect, it, vi } from 'vitest'

import { fieldTranslations } from '../../scripts/data/cms-admin-translations.mjs'
import { createCmsSetupRuntime } from '../../scripts/lib/cms-setup-runtime.mjs'

describe('CMS setup contract enforcement', () => {
  const legacyDefinition = {
    name: 'legacy_sample',
    lifecycle: 'legacy' as const,
    identity: { fields: [] },
    seedPolicy: 'migration_only' as const,
    fields: [{ field: 'legacy_value', type: 'string', meta: {}, schema: {} }],
    relations: [],
  }

  it('preserves an absent legacy collection without creating it', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path === '/collections') return []
      throw new Error(`unexpected request ${method} ${path}`)
    })
    const runtime = createCmsSetupRuntime({ request })

    await expect(runtime.createCollection(legacyDefinition)).resolves.toEqual({
      status: 'legacy_missing',
    })
    expect(request).toHaveBeenCalledTimes(1)
    expect(request).not.toHaveBeenCalledWith('POST', '/collections', expect.anything())
  })

  it('only verifies a present legacy collection and blocks incompatible structure', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path === '/collections') {
        return [{ collection: 'legacy_sample', meta: { singleton: false } }]
      }
      if (method === 'GET' && path === '/fields/legacy_sample') {
        return [{ field: 'legacy_value', type: 'integer', meta: {}, schema: {} }]
      }
      if (method === 'GET' && path === '/relations/legacy_sample') return []
      throw new Error(`unexpected request ${method} ${path}`)
    })
    const runtime = createCmsSetupRuntime({ request })

    await expect(runtime.createCollection(legacyDefinition)).rejects.toThrow(
      /migration_required:field_type.*legacy_sample.*legacy_value/i
    )
    expect(request.mock.calls.every(([method]) => method === 'GET')).toBe(true)
  })

  it('performs no writes when an existing collection already matches the contract', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path === '/collections') {
        return [{ collection: 'sample', meta: { singleton: false, icon: 'database' } }]
      }
      if (method === 'GET' && path === '/fields/sample') {
        return [
          {
            field: 'slug',
            type: 'string',
            meta: { required: true, translations: fieldTranslations('sample', 'slug') },
            schema: { is_nullable: false, is_unique: true },
          },
        ]
      }
      return []
    })
    const runtime = createCmsSetupRuntime({ request })
    await runtime.createCollection({
      name: 'sample',
      lifecycle: 'active',
      identity: { fields: ['slug'] },
      seedPolicy: 'normal',
      fields: [
        {
          field: 'slug',
          type: 'string',
          meta: { required: true },
          schema: { is_nullable: false, is_unique: true },
        },
      ],
    })

    expect(request.mock.calls.every(([method]) => method === 'GET')).toBe(true)
  })

  it('blocks an existing field with an incompatible type', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path === '/collections') {
        return [{ collection: 'sample', meta: { singleton: false } }]
      }
      if (method === 'GET' && path === '/fields/sample') {
        return [{ field: 'slug', type: 'integer', meta: { required: true }, schema: {} }]
      }
      return []
    })
    const runtime = createCmsSetupRuntime({ request })
    await expect(
      runtime.createCollection({
        name: 'sample',
        lifecycle: 'active',
        identity: { fields: ['slug'] },
        seedPolicy: 'normal',
        fields: [{ field: 'slug', type: 'string', meta: { required: true } }],
      })
    ).rejects.toThrow(/migration_required:field_type.*sample.*slug/i)
  })

  it('requires migration before adding a required unique identity to populated data', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path === '/collections') {
        return [{ collection: 'sample', meta: { singleton: false } }]
      }
      if (method === 'GET' && path === '/fields/sample') return []
      if (method === 'GET' && path === '/items/sample?limit=1') return [{ id: 1 }]
      return []
    })
    const runtime = createCmsSetupRuntime({ request })
    await expect(
      runtime.createCollection({
        name: 'sample',
        lifecycle: 'active',
        identity: { fields: ['content_key'] },
        seedPolicy: 'normal',
        fields: [
          {
            field: 'content_key',
            type: 'string',
            meta: { required: true },
            schema: { is_nullable: false, is_unique: true },
          },
        ],
      })
    ).rejects.toThrow(/migration_required:missing_identity_field.*sample.*content_key/i)
  })
})
