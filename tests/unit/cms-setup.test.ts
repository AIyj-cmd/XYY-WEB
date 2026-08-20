import { describe, expect, it, vi } from 'vitest'

import { CMS_COLLECTION_DEFINITIONS } from '../../scripts/data/cms-collection-definitions.mjs'
import { APPROVED_FAQ_SEEDS } from '../../scripts/data/approved-faq-seeds.mjs'
import {
  APPROVED_ABOUT_CONTENT_SEEDS,
  APPROVED_CASE_DETAIL_SEEDS,
  APPROVED_PUBLICATION_SEEDS,
  APPROVED_SERVICE_PAGE_SEEDS,
  APPROVED_SITE_SETTING_SEEDS,
} from '../../scripts/data/approved-cms-page-seeds.mjs'
import { FAQ_PAGE_OPTIONS } from '../../scripts/data/faq-page-options.mjs'
import { createCmsSetupRuntime } from '../../scripts/lib/cms-setup-runtime.mjs'

describe('CMS setup domains', () => {
  it('keeps collection definitions declarative and uniquely named', () => {
    expect(CMS_COLLECTION_DEFINITIONS.map(({ name }) => name)).toEqual([
      'homepage_stats',
      'homepage_content',
      'faq_pages',
      'services',
      'warehouses',
      'cases',
      'news',
      'faqs',
      'case_details',
      'case_stats',
      'publications',
      'service_pages',
      'service_stats',
      'service_features',
      'about_content',
      'about_history',
      'about_honors',
      'site_settings',
      'contact_leads',
    ])
    for (const definition of CMS_COLLECTION_DEFINITIONS) {
      expect(new Set(definition.fields.map(({ field }) => field)).size).toBe(
        definition.fields.length
      )
    }

    const news = CMS_COLLECTION_DEFINITIONS.find((definition) => definition.name === 'news')
    const slug = news?.fields.find(({ field }) => field === 'slug')
    const publishedAt = news?.fields.find(({ field }) => field === 'published_at')
    expect(slug?.meta).toMatchObject({
      options: { trim: true, slug: true },
      validation: { slug: { _regex: expect.any(String) } },
    })
    expect((publishedAt?.meta as { conditions?: unknown[] })?.conditions).toEqual(
      expect.arrayContaining([expect.objectContaining({ required: true })])
    )
    const newsRelations = news && 'relations' in news ? news.relations : undefined
    expect(newsRelations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: 'news',
          field: 'cover_image',
          related_collection: 'directus_files',
        }),
      ])
    )
  })

  it('keeps all reviewed page FAQs available for first-time CMS initialization', () => {
    expect(APPROVED_FAQ_SEEDS).toHaveLength(100)
    expect(new Set(APPROVED_FAQ_SEEDS.map(({ page_key }) => page_key))).toEqual(
      new Set(FAQ_PAGE_OPTIONS.map(({ value }) => value))
    )
    expect(
      new Set(APPROVED_FAQ_SEEDS.map(({ page_key, sort }) => `${page_key}:${sort}`)).size
    ).toBe(APPROVED_FAQ_SEEDS.length)
  })

  it('keeps the five structured content domains ready for first-time initialization', () => {
    expect(APPROVED_CASE_DETAIL_SEEDS).toHaveLength(6)
    expect(APPROVED_PUBLICATION_SEEDS).toHaveLength(14)
    expect(APPROVED_SERVICE_PAGE_SEEDS).toHaveLength(12)
    expect(APPROVED_ABOUT_CONTENT_SEEDS).toHaveLength(1)
    expect(APPROVED_SITE_SETTING_SEEDS).toHaveLength(1)
    expect(new Set(APPROVED_SERVICE_PAGE_SEEDS.map(({ slug }) => slug)).size).toBe(12)
    expect(APPROVED_PUBLICATION_SEEDS.filter(({ is_latest }) => is_latest)).toHaveLength(1)
  })

  it('creates a missing collection before its fields and seeds published items', async () => {
    const request = vi.fn(async (method: string, path: string, body?: unknown) => {
      if (method === 'GET' && path === '/collections') return []
      return { method, path, body }
    })
    const runtime = createCmsSetupRuntime({ request })
    await runtime.createCollection({
      name: 'sample',
      fields: [{ field: 'title', type: 'string', meta: { required: true } }],
    })
    await runtime.seed('sample', [{ title: '测试' }])

    expect(request.mock.calls.map(([, path]) => path)).toEqual([
      '/collections',
      '/collections',
      '/fields/sample',
      '/items/sample',
    ])
    expect(request.mock.calls[3][2]).toEqual({ status: 'published', title: '测试' })
  })

  it('creates navigation folders as schema-less collections', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path === '/collections') return []
      return {}
    })
    const runtime = createCmsSetupRuntime({ request })
    await runtime.createNavigationGroup({ name: 'website_content', icon: 'web' })

    expect(request).toHaveBeenCalledWith('POST', '/collections', {
      collection: 'website_content',
      schema: null,
      meta: expect.objectContaining({ icon: 'web', collapse: 'open' }),
    })
  })

  it('repairs only missing fields and relations on an existing collection', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path === '/collections') return [{ collection: 'news' }]
      if (method === 'GET' && path === '/fields/news') {
        return [{ field: 'title', type: 'string', meta: {}, schema: {} }]
      }
      if (method === 'GET' && path === '/relations/news') return []
      return {}
    })
    const runtime = createCmsSetupRuntime({ request })

    await runtime.createCollection({
      name: 'news',
      fields: [
        { field: 'title', type: 'string' },
        { field: 'cover_image', type: 'uuid' },
      ],
      relations: [
        {
          collection: 'news',
          field: 'cover_image',
          related_collection: 'directus_files',
        },
      ],
    })

    expect(request).not.toHaveBeenCalledWith('POST', '/collections', expect.anything())
    expect(request).not.toHaveBeenCalledWith(
      'POST',
      '/fields/news',
      expect.objectContaining({ field: 'title' })
    )
    expect(request).toHaveBeenCalledWith(
      'POST',
      '/fields/news',
      expect.objectContaining({ field: 'cover_image' })
    )
    expect(request).toHaveBeenCalledWith(
      'POST',
      '/relations',
      expect.objectContaining({ field: 'cover_image' })
    )
  })

  it('fails loudly when an existing news cover column still needs UUID migration', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path === '/collections') return [{ collection: 'news' }]
      if (method === 'GET' && path === '/fields/news') {
        return [
          {
            field: 'cover_image',
            type: 'uuid',
            schema: { data_type: 'character varying' },
          },
        ]
      }
      if (method === 'GET' && path === '/relations/news') return []
      return {}
    })
    const runtime = createCmsSetupRuntime({ request })

    await expect(
      runtime.createCollection({
        name: 'news',
        fields: [{ field: 'cover_image', type: 'uuid', meta: { interface: 'file-image' } }],
        relations: [
          {
            collection: 'news',
            field: 'cover_image',
            related_collection: 'directus_files',
          },
        ],
      })
    ).rejects.toThrow('migration_required:relation_type collection=news field=cover_image')
  })

  it('seeds only missing reviewed records when setup is re-run', async () => {
    const request = vi.fn(async (method: string, path: string, body?: unknown) => {
      if (method === 'GET') return [{ label: '已有案例' }]
      return { method, path, body }
    })
    const runtime = createCmsSetupRuntime({ request })

    await runtime.seedMissing('cases', [{ label: '已有案例' }, { label: '新增案例' }], ['label'])

    expect(request).toHaveBeenCalledWith('GET', '/items/cases?limit=-1&fields=label')
    expect(request).toHaveBeenCalledWith('POST', '/items/cases', {
      status: 'published',
      label: '新增案例',
    })
    expect(request).not.toHaveBeenCalledWith(
      'POST',
      '/items/cases',
      expect.objectContaining({ label: '已有案例' })
    )
  })
})
