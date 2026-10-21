import { describe, expect, it, vi } from 'vitest'

import { CASE_NEWS_COLLECTION_DEFINITIONS } from '../../scripts/data/case-news-collection-definitions.mjs'
import { ENGLISH_NEWS_COLLECTION_DEFINITION } from '../../scripts/data/english-news-collection-definition.mjs'
import {
  applyEnglishNewsSeparationPlan,
  buildEnglishNewsSeparationPlan,
} from '../../scripts/lib/english-news-separation-migration.mjs'
import { planEnglishNewsSchema } from '../../scripts/lib/english-news-separation-schema.mjs'

const past = '2026-10-01T00:00:00.000Z'
const later = '2026-10-02T00:00:00.000Z'
const legacy = {
  id: 9,
  status: 'published',
  title: '中文标题',
  slug: 'english-one',
  category: '行业资讯',
  published_at: '2026-10-02 08:00:00',
  title_en: 'English one',
  summary_en: 'Reviewed summary',
  content_en: '<p>Reviewed body</p>',
  english_status: 'published',
  english_published_at: past,
}

const base = (overrides = {}) => ({
  collections: [{ collection: 'news', meta: { group: 'website_content', sort: 1 } }],
  fields: [],
  relations: [],
  legacyRows: [legacy],
  legacyFields: [],
  targetRows: [],
  ...overrides,
})

describe('English news separation migration', () => {
  it('defines an independent non-singleton English list with archived status', () => {
    const status = ENGLISH_NEWS_COLLECTION_DEFINITION.fields.find(({ field }) => field === 'status')
    const chineseNews = CASE_NEWS_COLLECTION_DEFINITIONS.find(({ name }) => name === 'news')
    const chineseStatus = chineseNews?.fields.find(({ field }) => field === 'status')
    expect(ENGLISH_NEWS_COLLECTION_DEFINITION.meta).toMatchObject({ singleton: false })
    expect(status).toMatchObject({
      schema: { default_value: 'draft' },
      meta: {
        options: {
          choices: [
            { text: '已发布', value: 'published' },
            { text: '草稿', value: 'draft' },
            { text: '已归档', value: 'archived' },
          ],
        },
      },
    })
    expect(ENGLISH_NEWS_COLLECTION_DEFINITION.fields.map(({ field }) => field)).not.toEqual(
      expect.arrayContaining(['english_content', 'title_en', 'summary_en', 'content_en'])
    )
    expect(chineseStatus).toHaveProperty('meta.options.choices', [
      { text: '已发布', value: 'published' },
      { text: '草稿', value: 'draft' },
    ])
  })

  it('converges an existing English collection away from singleton metadata', () => {
    const schema = planEnglishNewsSchema(
      [
        {
          collection: 'english_news',
          meta: {
            icon: 'translate',
            group: 'website_content',
            hidden: false,
            singleton: true,
            translations: [{ language: 'zh-CN', translation: '英文文章管理' }],
          },
        },
      ],
      ENGLISH_NEWS_COLLECTION_DEFINITION.fields,
      ENGLISH_NEWS_COLLECTION_DEFINITION.relations
    )
    expect(schema.schema.collectionMeta).toMatchObject({ singleton: false })
  })

  it('normalizes a bare Shanghai Chinese max time for published records', () => {
    const plan = buildEnglishNewsSeparationPlan(base())
    expect(plan.issues).toEqual([])
    expect(plan.records).toEqual([
      expect.objectContaining({ status: 'published', slug: 'english-one', published_at: later }),
    ])
    expect(plan.navigation).toEqual([
      expect.objectContaining({
        collection: 'english_news',
        meta: expect.objectContaining({ sort: 2 }),
      }),
    ])
  })

  it('preserves archived and draft English times as normalized UTC', () => {
    const archived = {
      ...legacy,
      english_status: 'archived',
      english_published_at: '2026-10-01 08:00:00',
    }
    const draft = {
      ...legacy,
      status: 'draft',
      english_status: 'published',
      english_published_at: '2026-10-01T08:00:00+08:00',
    }
    const plan = buildEnglishNewsSeparationPlan(
      base({ legacyRows: [archived, { ...draft, id: 10, slug: 'english-two' }] })
    )
    expect(plan.records).toMatchObject([
      { status: 'archived', published_at: past },
      { status: 'draft', published_at: past },
    ])
  })

  it('keeps a legacy published status with no English time as a draft', () => {
    const plan = buildEnglishNewsSeparationPlan(
      base({ legacyRows: [{ ...legacy, english_published_at: null }] })
    )
    expect(plan.records).toMatchObject([{ status: 'draft', published_at: null }])
  })

  it('keeps equivalent Z and +08 times at the same UTC instant', () => {
    const plan = buildEnglishNewsSeparationPlan(
      base({
        legacyRows: [
          {
            ...legacy,
            published_at: '2026-10-01T00:00:00.000Z',
            english_published_at: '2026-10-01T08:00:00+08:00',
          },
        ],
      })
    )
    expect(plan.records).toMatchObject([{ status: 'published', published_at: past }])
  })

  it('rejects invalid English times instead of normalizing them', () => {
    const plan = buildEnglishNewsSeparationPlan(
      base({ legacyRows: [{ ...legacy, english_published_at: '2026-02-30 08:00:00' }] })
    )
    expect(plan.issues).toContain('invalid_legacy_time id=9 field=english_published_at')
    expect(plan.records).toEqual([])
  })

  it('fails closed before any write for incomplete content or a slug conflict', async () => {
    const incomplete = buildEnglishNewsSeparationPlan(
      base({ legacyRows: [{ ...legacy, content_en: '' }] })
    )
    expect(incomplete.issues).toContain('incomplete_legacy_record id=9')
    const request = vi.fn()
    await expect(
      applyEnglishNewsSeparationPlan({ request }, incomplete, { apply: true })
    ).rejects.toThrow('incomplete_legacy_record')
    expect(request).not.toHaveBeenCalled()
  })

  it('is idempotent after readback-normalized target data and hidden legacy fields', () => {
    const first = buildEnglishNewsSeparationPlan(base())
    const fields = ENGLISH_NEWS_COLLECTION_DEFINITION.fields.map((field) => ({ ...field }))
    const plan = buildEnglishNewsSeparationPlan(
      base({
        collections: [
          { collection: 'news', meta: { group: 'website_content', sort: 1 } },
          {
            collection: 'english_news',
            meta: { group: 'website_content', singleton: false, sort: 2 },
          },
        ],
        fields,
        relations: ENGLISH_NEWS_COLLECTION_DEFINITION.relations,
        targetRows: [
          { ...first.records[0], legacy_news_id: '9', published_at: '2026-10-02T08:00:00+08:00' },
        ],
        legacyFields: [{ field: 'title_en', meta: { hidden: true, readonly: true } }],
      })
    )
    expect(plan).toMatchObject({ issues: [], records: [], navigation: [], legacyFields: [] })
  })

  it('restores the Chinese menu label without discarding other collection translations', () => {
    const plan = buildEnglishNewsSeparationPlan(
      base({
        collections: [
          { collection: 'news', meta: { group: 'website_content', sort: 1 } },
          {
            collection: 'english_news',
            meta: {
              group: 'website_content',
              sort: 2,
              icon: 'wrong',
              translations: [{ language: 'en-US', translation: 'English news' }],
            },
          },
        ],
      })
    )
    expect(plan.schema.collectionMeta?.translations).toEqual(
      expect.arrayContaining([
        { language: 'en-US', translation: 'English news' },
        { language: 'zh-CN', translation: '英文文章管理' },
      ])
    )
  })

  it('keeps dry-runs read-only', async () => {
    const request = vi.fn()
    await expect(
      applyEnglishNewsSeparationPlan({ request }, buildEnglishNewsSeparationPlan(base()))
    ).resolves.toEqual({ applied: 0 })
    expect(request).not.toHaveBeenCalled()
  })
})
