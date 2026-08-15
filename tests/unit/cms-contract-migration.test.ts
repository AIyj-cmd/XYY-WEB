import { describe, expect, it, vi } from 'vitest'

import {
  applyCmsContractPlan,
  buildCmsContractMigrationPlan,
  CMS_CONTRACT_MIGRATION_COLLECTIONS,
} from '../../scripts/lib/cms-contract-migration.mjs'

type CmsSnapshot = Record<string, Array<Record<string, unknown>>>

const fixture = (): CmsSnapshot => ({
  homepage_content: [
    {
      id: 1,
      key: 'main',
      stats: [
        { id: 1, label: '合作品牌', detail: '鞋服及相关细分行业' },
        { id: 2, label: '直营仓储', detail: '华南、华东、华中仓网' },
      ],
    },
  ],
  faq_pages: [
    { id: 10, key: 'home' },
    { id: 11, key: 'about' },
  ],
  faqs: [{ id: 101, page_key: 'home', faq_page: null, sort: 1, question: '问题一' }],
  warehouses: [{ id: 201, name: '旧显示名' }],
  about_history: [],
  about_honors: [],
  news: [],
})

const mappings = {
  faqs: {
    101: {
      targetStableKey: 'faq-home-service-fit',
      expectedBefore: { question: '问题一' },
    },
  },
  warehouses: {
    201: {
      targetStableKey: 'warehouse-guangzhou-huangpu',
      expectedBefore: { name: '旧显示名' },
    },
  },
}

describe('CMS contract migration planning', () => {
  it('excludes the private contact collection from migration reads', () => {
    expect(CMS_CONTRACT_MIGRATION_COLLECTIONS).not.toContain('contact_leads')
  })
  it('excludes retained legacy collections from content migration reads', () => {
    expect(CMS_CONTRACT_MIGRATION_COLLECTIONS).not.toEqual(
      expect.arrayContaining([
        'homepage_stats',
        'case_details',
        'case_stats',
        'service_stats',
        'service_features',
      ])
    )
  })
  it('plans exact stable keys, FAQ relationships and homepage claimKey references', () => {
    const result = buildCmsContractMigrationPlan(fixture(), mappings)
    expect(result.issues).toEqual([])
    expect(result.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: 'faqs',
          id: 101,
          patch: expect.objectContaining({
            content_key: 'faq-home-service-fit',
            faq_page: 10,
          }),
        }),
        expect.objectContaining({
          collection: 'warehouses',
          id: 201,
          patch: { content_key: 'warehouse-guangzhou-huangpu' },
        }),
        expect.objectContaining({ collection: 'homepage_content', id: 1 }),
      ])
    )
  })

  it('blocks unknown records instead of guessing from labels, names or sort', () => {
    const result = buildCmsContractMigrationPlan(fixture(), {})
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('manual_mapping_required collection=faqs id=101'),
        expect.stringContaining('manual_mapping_required collection=warehouses id=201'),
      ])
    )
  })

  it('rejects an ID mapping when the selected record fails its expected-before assertion', () => {
    const result = buildCmsContractMigrationPlan(fixture(), {
      ...mappings,
      warehouses: {
        201: {
          targetStableKey: 'warehouse-guangzhou-huangpu',
          expectedBefore: { name: '另一个仓库' },
        },
      },
    })
    expect(result.issues.join('\n')).toContain(
      'manual_mapping_required collection=warehouses id=201 reason=missing_or_expected_before_mismatch'
    )
  })

  it('requires a stable legacy ID for every homepage stat instead of using array order', () => {
    const snapshot = fixture()
    snapshot.homepage_content[0].stats = [{ label: '合作品牌', detail: '鞋服及相关细分行业' }]
    expect(buildCmsContractMigrationPlan(snapshot, mappings).issues.join('\n')).toContain(
      'stable_id_required'
    )
  })

  it('rejects duplicate stable identities before apply', () => {
    const snapshot = fixture()
    snapshot.warehouses = [
      { id: 201, name: '甲', content_key: 'warehouse-duplicate' },
      { id: 202, name: '乙', content_key: 'warehouse-duplicate' },
    ]
    expect(buildCmsContractMigrationPlan(snapshot, mappings).issues.join('\n')).toContain(
      'duplicate_identity collection=warehouses'
    )
  })

  it('blocks dangling FAQ relations and duplicate page ordering', () => {
    const snapshot = fixture()
    snapshot.faqs = [
      { id: 101, content_key: 'faq-one', page_key: 'home', faq_page: 999, sort: 1 },
      { id: 102, content_key: 'faq-two', page_key: 'home', faq_page: 10, sort: 1 },
    ]
    const issues = buildCmsContractMigrationPlan(snapshot, mappings).issues.join('\n')
    expect(issues).toContain('dangling_relation collection=faqs id=101')
    expect(issues).toContain('duplicate_sort collection=faqs page=home sort=1')
  })

  it('treats faq_page as authoritative and only repairs a conflicting legacy page_key', () => {
    const snapshot = fixture()
    snapshot.faqs = [
      {
        id: 101,
        content_key: 'faq-home-service-fit',
        page_key: 'about',
        faq_page: 10,
        sort: 1,
      },
    ]
    expect(buildCmsContractMigrationPlan(snapshot, mappings).changes).toEqual(
      expect.arrayContaining([{ collection: 'faqs', id: 101, patch: { page_key: 'home' } }])
    )
  })

  it('keeps dry-run read-only and applies only planned patches when explicitly requested', async () => {
    const plan = buildCmsContractMigrationPlan(fixture(), mappings)
    const directus = {
      request: vi.fn(async (method: string, ...requestArgs: [string, unknown?]) => {
        void requestArgs
        return method === 'GET' ? [{ id: 201, content_key: 'warehouse-guangzhou-huangpu' }] : {}
      }),
    }

    await applyCmsContractPlan(directus, plan, { apply: false })
    expect(directus.request).not.toHaveBeenCalled()

    await applyCmsContractPlan(directus, plan, { apply: true })
    expect(directus.request).toHaveBeenCalledTimes(plan.changes.length)
    expect(directus.request).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('contact_leads'),
      expect.anything()
    )
  })

  it('fails fast on a write error and safely reapplies the idempotent plan', async () => {
    const plan = buildCmsContractMigrationPlan(fixture(), mappings)
    const failing = {
      request: vi
        .fn()
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('fixture write failed')),
    }
    await expect(applyCmsContractPlan(failing, plan, { apply: true })).rejects.toThrow(
      'fixture write failed'
    )

    const retry = { request: vi.fn(async () => ({})) }
    await expect(applyCmsContractPlan(retry, plan, { apply: true })).resolves.toEqual({
      applied: plan.changes.length,
      schemaApplied: 0,
    })
  })

  it('produces zero changes after the planned patches are reflected in the fixture', () => {
    const snapshot = fixture()
    const first = buildCmsContractMigrationPlan(snapshot, mappings)
    for (const change of first.changes) {
      const record = snapshot[change.collection].find((item) => item.id === change.id)
      if (!record) throw new Error(`Missing fixture record ${change.collection}:${change.id}`)
      Object.assign(record, change.patch)
    }
    expect(buildCmsContractMigrationPlan(snapshot, mappings)).toMatchObject({
      changes: [],
      issues: [],
    })
  })
})
