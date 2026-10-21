import { describe, expect, it, vi } from 'vitest'

import { ENGLISH_NEWS_COLLECTION_DEFINITION } from '../../scripts/data/english-news-collection-definition.mjs'
import {
  applyEnglishNewsSeparationPlan,
  buildEnglishNewsSeparationPlan,
} from '../../scripts/lib/english-news-separation-migration.mjs'
import { planEnglishNewsSchema } from '../../scripts/lib/english-news-separation-schema.mjs'

const legacy = {
  id: 9,
  status: 'published',
  slug: 'english-one',
  category: '行业资讯',
  published_at: '2026-10-02T00:00:00.000Z',
  title_en: 'English one',
  summary_en: 'Reviewed summary',
  content_en: '<p>Reviewed body</p>',
  english_status: 'published',
  english_published_at: '2026-10-01T00:00:00.000Z',
}

const collections = [
  { collection: 'news', meta: { group: 'website_content', sort: 1 } },
  {
    collection: 'english_news',
    meta: {
      icon: 'translate',
      group: 'website_content',
      hidden: false,
      singleton: false,
      sort: 2,
      translations: [{ language: 'zh-CN', translation: '英文文章管理' }],
    },
  },
]

type ApiField = {
  field: string
  type: string
  meta: Record<string, unknown>
  schema: Record<string, unknown>
}

function choiceOptions(field: ApiField) {
  const options = field.meta.options
  if (
    !options ||
    typeof options !== 'object' ||
    !('choices' in options) ||
    !Array.isArray(options.choices)
  ) {
    throw new Error(`fixture field ${field.field} has no choices`)
  }
  return options.choices
}

const apiFields = (): ApiField[] =>
  ENGLISH_NEWS_COLLECTION_DEFINITION.fields.map((field) => {
    const meta: Record<string, unknown> = { ...field.meta }
    const schema: Record<string, unknown> =
      'schema' in field && field.schema && typeof field.schema === 'object'
        ? { ...field.schema }
        : {}
    if (meta.required === true) schema.is_nullable = false
    return { field: field.field, type: field.type, meta, schema }
  })

const snapshot = (overrides = {}) => ({
  collections,
  fields: apiFields(),
  relations: ENGLISH_NEWS_COLLECTION_DEFINITION.relations,
  legacyRows: [legacy],
  legacyFields: [],
  targetRows: [],
  ...overrides,
})

describe('English news separation contract', () => {
  it.each(['<p>&#8203;</p>', '<p>\u200B</p>', '<p>&shy;</p>'])(
    'fails closed for sanitized-invisible legacy content %s',
    async (content_en) => {
      const plan = buildEnglishNewsSeparationPlan(
        snapshot({ legacyRows: [{ ...legacy, content_en }] })
      )
      const request = vi.fn()

      expect(plan.issues).toContain('incomplete_legacy_record id=9')
      await expect(
        applyEnglishNewsSeparationPlan({ request }, plan, { apply: true })
      ).rejects.toThrow('incomplete_legacy_record')
      expect(request).not.toHaveBeenCalled()
    }
  )

  it('keeps image-only and ZWJ emoji bodies valid for migration', () => {
    const plan = buildEnglishNewsSeparationPlan(
      snapshot({
        legacyRows: [
          { ...legacy, content_en: '<img src="/cover.jpg">' },
          {
            ...legacy,
            id: 10,
            slug: 'english-two',
            title_en: 'Returns 👩‍💻 guide',
            content_en: '<p>Warehouse 👩‍💻 updates.</p>',
          },
        ],
      })
    )

    expect(plan.issues).toEqual([])
    expect(plan.records).toHaveLength(2)
  })

  it('rejects choice drift and extra required fields before writes', async () => {
    const fields = apiFields()
    const status = fields.find(({ field }) => field === 'status')
    const category = fields.find(({ field }) => field === 'category')
    if (!status || !category) throw new Error('fixture fields missing')
    status.meta.options = { choices: choiceOptions(status).slice(0, 2) }
    category.meta.options = JSON.stringify({ choices: choiceOptions(category).slice(0, 1) })
    fields.push({ field: 'chinese_required', type: 'string', meta: { required: true }, schema: {} })
    fields.push({
      field: 'id',
      type: 'integer',
      meta: { required: true },
      schema: { is_primary_key: true },
    })
    const plan = buildEnglishNewsSeparationPlan(snapshot({ fields }))
    const request = vi.fn()

    expect(plan.issues).toEqual(
      expect.arrayContaining([
        'incompatible_field field=status reason=options',
        'incompatible_field field=category reason=options',
        'unexpected_required_field field=chinese_required',
      ])
    )
    await expect(
      applyEnglishNewsSeparationPlan({ request }, plan, { apply: true })
    ).rejects.toThrow('incompatible_field field=status reason=options')
    expect(request).not.toHaveBeenCalled()
  })

  it('accepts API-normalized field shapes when the declared contract is intact', () => {
    const schema = planEnglishNewsSchema(
      collections,
      apiFields(),
      ENGLISH_NEWS_COLLECTION_DEFINITION.relations
    )

    expect(schema.issues).toEqual([])
    expect(schema.schema).toMatchObject({ collectionMeta: null, fields: [], relations: [] })
  })
})
