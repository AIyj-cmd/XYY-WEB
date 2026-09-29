import { describe, expect, it, vi } from 'vitest'

import { createCmsSetupRuntime } from '../../scripts/lib/cms-setup-runtime.mjs'

describe('CMS setup aliases', () => {
  it('creates group aliases before their grouped fields and keeps relation aliases last', async () => {
    const fields = new Map<string, { field: string; type: string; meta: object; schema: object }>()
    let relationCreated = false
    const request = vi.fn(
      async (
        method: string,
        path: string,
        body?: { field?: string; type?: string; meta?: object; schema?: object }
      ) => {
        if (method === 'GET' && path === '/collections') return [{ collection: 'news' }]
        if (method === 'GET' && path === '/fields/news') return [...fields.values()]
        if (method === 'GET' && path === '/relations/news')
          return relationCreated
            ? [{ field: 'cover_image', related_collection: 'directus_files' }]
            : []
        if (method === 'POST' && path === '/fields/news' && body?.field) {
          fields.set(body.field, {
            field: body.field,
            type: body.type ?? 'alias',
            meta: body.meta ?? {},
            schema: body.schema ?? {},
          })
        }
        if (method === 'POST' && path === '/relations') relationCreated = true
        return {}
      }
    )
    const runtime = createCmsSetupRuntime({ request })
    const definition = {
      name: 'news',
      fields: [{ field: 'title_en', type: 'string', meta: { group: 'english_content' } }],
      aliases: [
        { field: 'english_content', type: 'alias' as const, meta: { special: ['group'] } },
        { field: 'items', type: 'alias' as const, meta: { special: ['o2m'] } },
      ],
      relations: [
        { collection: 'news', field: 'cover_image', related_collection: 'directus_files' },
      ],
    }

    await runtime.createCollection(definition)
    const writes = request.mock.calls.filter(([method]) => method === 'POST')
    expect(writes.map(([, path, body]) => [path, (body as { field?: string })?.field])).toEqual([
      ['/fields/news', 'english_content'],
      ['/fields/news', 'title_en'],
      ['/relations', 'cover_image'],
      ['/fields/news', 'items'],
    ])

    await runtime.createCollection(definition)
    expect(request.mock.calls.filter(([method]) => method === 'POST')).toHaveLength(4)
  })
})
