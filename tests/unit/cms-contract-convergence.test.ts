import { describe, expect, it, vi } from 'vitest'

import {
  applyCmsContractPlan,
  buildCmsContractMigrationPlan,
  readCmsContractMigrationSnapshot,
} from '../../scripts/lib/cms-contract-migration.mjs'

const currentFields = {
  news: [
    { field: 'slug', type: 'string', meta: { required: true }, schema: { is_unique: false } },
    { field: 'summary', type: 'string', meta: { required: true }, schema: {} },
    { field: 'published_at', type: 'string', meta: {}, schema: {} },
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
        news: [{ field: 'slug', type: 'string', meta: {}, schema: { is_unique: true } }],
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
})
