import { describe, expect, it } from 'vitest'

import { APPROVED_CMS_CONTRACT_MAPPINGS } from '../../scripts/data/approved-cms-contract-mappings.mjs'
import {
  buildCmsContractMigrationPlan,
  createCmsMigrationPreconditionHash,
  createCmsMigrationValueHash,
} from '../../scripts/lib/cms-contract-migration.mjs'

const approvedRecords = APPROVED_CMS_CONTRACT_MAPPINGS as unknown as Record<
  string,
  Record<string, { targetStableKey: string }>
>

const faq = {
  id: 101,
  status: 'published',
  page_key: 'home',
  faq_page: 10,
  sort: 1,
  question: '问题一',
  answer: '答案一',
}
const fields = ['answer', 'page_key', 'question', 'sort', 'status']

type CmsSnapshot = Record<string, Array<Record<string, unknown>>>

const snapshot = (): CmsSnapshot => ({
  homepage_content: [{ id: 1, key: 'main', stats: [] }],
  faq_pages: [{ id: 10, key: 'home' }],
  faqs: [{ ...faq }],
  warehouses: [{ id: 201, content_key: 'warehouse-reviewed' }],
  about_history: [],
  about_honors: [],
  news: [],
})

describe('CMS migration canonical preconditions', () => {
  it('contains one explicit approved mapping for every active staging record', () => {
    expect({
      warehouses: Object.keys(approvedRecords.warehouses).length,
      faqs: Object.keys(approvedRecords.faqs).length,
      about_history: Object.keys(approvedRecords.about_history).length,
      about_honors: Object.keys(approvedRecords.about_honors).length,
    }).toEqual({ warehouses: 12, faqs: 100, about_history: 9, about_honors: 15 })
    expect(Object.keys(APPROVED_CMS_CONTRACT_MAPPINGS.homepage_content)).toEqual(['1'])
    for (const id of [4, 5, 6] as const) {
      expect(approvedRecords.warehouses[id].targetStableKey).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
    }
  })

  it('ignores Directus metadata but detects reviewed FAQ business changes', () => {
    const before = createCmsMigrationPreconditionHash(faq, fields, { faqPageKey: 'home' })
    expect(
      createCmsMigrationPreconditionHash(
        { ...faq, date_updated: '2026-08-15T00:00:00Z', user_updated: 'system-user' },
        fields,
        { faqPageKey: 'home' }
      )
    ).toBe(before)
    expect(
      createCmsMigrationPreconditionHash({ ...faq, answer: '已变更答案' }, fields, {
        faqPageKey: 'home',
      })
    ).not.toBe(before)
  })

  it('detects a related FAQ page key change', () => {
    expect(createCmsMigrationPreconditionHash(faq, fields, { faqPageKey: 'home' })).not.toBe(
      createCmsMigrationPreconditionHash(faq, fields, { faqPageKey: 'about' })
    )
  })

  it('requires record ID, stable key and canonical hash to approve a FAQ mapping', () => {
    const reviewed = {
      targetStableKey: 'faq-home-service-fit',
      expectedBeforeFields: fields,
      expectedFaqPageKey: 'home',
      expectedBeforeSha256: createCmsMigrationPreconditionHash(faq, fields, {
        faqPageKey: 'home',
      }),
    }
    expect(buildCmsContractMigrationPlan(snapshot(), { faqs: { 101: reviewed } }).issues).toEqual(
      []
    )
    expect(
      buildCmsContractMigrationPlan(snapshot(), { faqs: { 102: reviewed } }).issues.join('\n')
    ).toContain('manual_mapping_required collection=faqs id=101')
    expect(
      buildCmsContractMigrationPlan(snapshot(), {
        faqs: { 101: { ...reviewed, targetStableKey: '' } },
      }).issues.join('\n')
    ).toContain('manual_mapping_required collection=faqs id=101')
  })

  it('adds homepage claim keys through reviewed whole-array and item hashes', () => {
    const current = snapshot()
    const stats = [
      { label: '合作品牌', detail: '鞋服及相关细分行业' },
      { label: '直营仓储', detail: '华南、华东、华中仓网' },
    ]
    current.homepage_content[0].stats = stats
    current.faqs[0].content_key = 'faq-home-service-fit'
    const result = buildCmsContractMigrationPlan(current, {
      homepage_content: {
        1: {
          expectedStatsBeforeSha256: createCmsMigrationValueHash(stats),
          stats: [
            [stats[0], 'partnerBrands'],
            [stats[1], 'warehouseArea'],
          ].map(([stat, targetStableKey]) => ({
            sourceItemSha256: createCmsMigrationValueHash(stat),
            targetStableKey,
          })),
        },
      },
    })
    expect(result.issues).toEqual([])
    expect(result.changes).toContainEqual({
      collection: 'homepage_content',
      id: 1,
      patch: {
        stats: [
          { ...stats[0], claimKey: 'partnerBrands' },
          { ...stats[1], claimKey: 'warehouseArea' },
        ],
      },
    })
  })
})
