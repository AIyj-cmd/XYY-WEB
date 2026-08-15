import { describe, expect, it, vi } from 'vitest'

import {
  applyCmsContractPlan,
  buildCmsContractMigrationPlan,
  readCmsContractMigrationSnapshot,
} from '../../scripts/lib/cms-contract-migration.mjs'

const currentFields = {
  news: [
    { field: 'slug', type: 'string', meta: { required: true }, schema: { is_unique: false } },
    { field: 'summary', type: 'text', meta: { required: true }, schema: {} },
    { field: 'published_at', type: 'timestamp', meta: {}, schema: {} },
  ],
  contact_leads: [
    { field: 'status', type: 'string', meta: {}, schema: { default_value: null } },
    { field: 'source', type: 'string', meta: {}, schema: { default_value: null } },
  ],
}

describe('real-environment CMS contract convergence', () => {
  it('never plans legacy stable identities or legacy manual mappings', () => {
    const result = buildCmsContractMigrationPlan({
      homepage_stats: [{ id: 1 }],
      case_stats: [{ id: 2 }],
      service_stats: [{ id: 3 }],
      service_features: [{ id: 4 }],
    })
    expect(result.changes).toEqual([])
    expect(result.issues.join('\n')).not.toMatch(
      /homepage_stats|case_stats|service_stats|service_features/
    )
  })

  it('reads private contact schema metadata without reading private records', async () => {
    const directus = {
      request: vi.fn(async (...requestArgs: [string, string, unknown?]) => {
        void requestArgs
        return []
      }),
    }
    await readCmsContractMigrationSnapshot(directus)
    expect(directus.request).toHaveBeenCalledWith('GET', '/fields/contact_leads')
    expect(
      directus.request.mock.calls.some(([, path]) => path.startsWith('/items/contact_leads'))
    ).toBe(false)
  })

  it('plans only news uniqueness and private contact defaults', () => {
    const plan = buildCmsContractMigrationPlan({
      records: { news: [] },
      fields: currentFields,
    })
    expect(plan.schemaChanges).toEqual(
      expect.arrayContaining([
        { phase: 'unique', collection: 'news', field: 'slug' },
        { phase: 'default', collection: 'contact_leads', field: 'status', value: 'new' },
        { phase: 'default', collection: 'contact_leads', field: 'source', value: 'website' },
      ])
    )
    expect(plan.schemaChanges.map(({ collection, field }) => `${collection}.${field}`)).not.toEqual(
      expect.arrayContaining(['cases.metrics', 'news.summary', 'news.published_at'])
    )
  })

  it('applies private defaults as schema metadata without accessing private records', async () => {
    const plan = buildCmsContractMigrationPlan({
      records: { news: [] },
      fields: {
        ...currentFields,
        news: [
          { field: 'slug', type: 'string', meta: {}, schema: { is_unique: true } },
          { field: 'summary', type: 'text', meta: { required: true }, schema: {} },
          { field: 'published_at', type: 'timestamp', meta: {}, schema: {} },
        ],
      },
    })
    const directus = {
      request: vi.fn(async (...requestArgs: [string, string, unknown?]) => {
        void requestArgs
        return {}
      }),
    }
    await applyCmsContractPlan(directus, plan, { apply: true })
    expect(directus.request.mock.calls).toEqual([
      ['PATCH', '/fields/contact_leads/status', { schema: { default_value: 'new' } }],
      ['PATCH', '/fields/contact_leads/source', { schema: { default_value: 'website' } }],
    ])
  })

  it('plans and applies the reviewed field convergence without content writes', async () => {
    const plan = buildCmsContractMigrationPlan({
      records: {
        cases: [{ id: 1, metrics: '短指标摘要' }],
        news: [],
        faq_pages: [{ id: 10, key: 'home' }],
        faqs: [{ id: 1, page_key: 'home', faq_page: 10, content_key: 'faq-home-01' }],
        about_honors: [{ id: 1, image: '/honor.jpg', content_key: 'honor-one' }],
      },
      fields: {
        cases: [{ field: 'metrics', type: 'string', meta: {}, schema: {} }],
        news: [
          { field: 'slug', type: 'string', meta: {}, schema: { is_unique: true } },
          { field: 'summary', type: 'string', meta: {}, schema: {} },
          { field: 'published_at', type: 'string', meta: {}, schema: {} },
        ],
        faqs: [
          { field: 'page_key', type: 'string', meta: { required: false }, schema: {} },
          {
            field: 'content_key',
            type: 'string',
            meta: { required: true },
            schema: { is_nullable: false, is_unique: true },
          },
        ],
        about_honors: [
          { field: 'image', type: 'string', meta: { required: false }, schema: {} },
          {
            field: 'content_key',
            type: 'string',
            meta: { required: true },
            schema: { is_nullable: false, is_unique: true },
          },
        ],
      },
    })
    expect(plan.issues).toEqual([])
    expect(plan.schemaChanges).toEqual([
      { phase: 'type', collection: 'cases', field: 'metrics', type: 'text' },
      { phase: 'type', collection: 'news', field: 'summary', type: 'text' },
      { phase: 'type', collection: 'news', field: 'published_at', type: 'timestamp' },
      { phase: 'require_contract', collection: 'faqs', field: 'page_key' },
      { phase: 'require_contract', collection: 'about_honors', field: 'image' },
    ])
    const directus = { request: vi.fn(async () => ({})) }
    await expect(applyCmsContractPlan(directus, plan, { apply: true })).resolves.toEqual({
      applied: 0,
      schemaApplied: 5,
    })
    expect(directus.request.mock.calls).toEqual([
      ['PATCH', '/fields/cases/metrics', { type: 'text' }],
      ['PATCH', '/fields/news/summary', { type: 'text' }],
      ['PATCH', '/fields/news/published_at', { type: 'timestamp' }],
      ['PATCH', '/fields/faqs/page_key', expect.any(Object)],
      ['PATCH', '/fields/about_honors/image', expect.any(Object)],
    ])
  })

  it('blocks unsafe timestamp conversion and required constraints with empty data', () => {
    const plan = buildCmsContractMigrationPlan({
      records: {
        news: [{ id: 1, published_at: '15/08/2026' }],
        about_honors: [{ id: 1, image: null, content_key: 'honor-one' }],
      },
      fields: {
        news: [
          { field: 'summary', type: 'text', meta: {}, schema: {} },
          { field: 'published_at', type: 'string', meta: {}, schema: {} },
        ],
        about_honors: [
          { field: 'image', type: 'string', meta: { required: false }, schema: {} },
          {
            field: 'content_key',
            type: 'string',
            meta: { required: true },
            schema: { is_nullable: false, is_unique: true },
          },
        ],
      },
    })
    expect(plan.issues).toEqual(
      expect.arrayContaining([
        'data_validation_required collection=news field=published_at',
        'data_validation_required collection=about_honors field=image',
      ])
    )
    expect(plan.schemaChanges).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ collection: 'news', field: 'published_at' }),
        expect.objectContaining({ collection: 'about_honors', field: 'image' }),
      ])
    )
  })
})
