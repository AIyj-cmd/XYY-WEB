import { describe, expect, it, vi } from 'vitest'

import { CMS_COLLECTION_DEFINITIONS } from '../../scripts/data/cms-collection-definitions.mjs'
import { createCmsSetupRuntime } from '../../scripts/lib/cms-setup-runtime.mjs'

describe('CMS setup domains', () => {
  it('keeps collection definitions declarative and uniquely named', () => {
    expect(CMS_COLLECTION_DEFINITIONS.map(({ name }) => name)).toEqual([
      'homepage_stats',
      'services',
      'warehouses',
    ])
    for (const definition of CMS_COLLECTION_DEFINITIONS) {
      expect(new Set(definition.fields.map(({ field }) => field)).size).toBe(
        definition.fields.length
      )
    }
  })

  it('creates a collection before its fields and seeds published items', async () => {
    const request = vi.fn(async (method: string, path: string, body?: unknown) => ({
      method,
      path,
      body,
    }))
    const runtime = createCmsSetupRuntime({ request })
    await runtime.createCollection({
      name: 'sample',
      fields: [{ field: 'title', type: 'string', meta: { required: true } }],
    })
    await runtime.seed('sample', [{ title: '测试' }])

    expect(request.mock.calls.map(([, path]) => path)).toEqual([
      '/collections',
      '/fields/sample',
      '/items/sample',
    ])
    expect(request.mock.calls[2][2]).toEqual({ status: 'published', title: '测试' })
  })
})
