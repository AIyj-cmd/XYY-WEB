import { describe, expect, it, vi } from 'vitest'

import { fieldTranslations } from '../../scripts/data/cms-admin-translations.mjs'
import { createCmsSetupRuntime } from '../../scripts/lib/cms-setup-runtime.mjs'

describe('CMS setup contract enforcement', () => {
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
