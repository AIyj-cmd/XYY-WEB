import { beforeEach, describe, expect, it, vi } from 'vitest'

import { __setDirectusRequesterForTests, getNewsArticle, getPublishedNews } from '@/lib/directus'
import { buildCmsContractMigrationPlan } from '../../scripts/lib/cms-contract-migration.mjs'

describe('CMS news hardening', () => {
  beforeEach(() => __setDirectusRequesterForTests(null))

  it('drops malformed published news and rejects non-canonical article slugs', async () => {
    const requester = vi.fn(async () => [
      {
        id: 1,
        title: '非法文章',
        slug: ' Bad Slug ',
        summary: '摘要',
        category: '行业资讯',
        published_at: null,
      },
    ])
    __setDirectusRequesterForTests(requester)

    await expect(getPublishedNews()).resolves.toEqual([])
    await expect(getNewsArticle(' Bad Slug ')).resolves.toBeNull()
    expect(requester).toHaveBeenCalledTimes(1)
  })

  it('requests fresh valid news on every call', async () => {
    const rows = [
      { slug: 'first', published_at: '2026-08-01T00:00:00.000Z' },
      { slug: 'second', published_at: '2026-08-02T00:00:00.000Z' },
    ]
    const requester = vi.fn().mockResolvedValueOnce([rows[0]]).mockResolvedValueOnce([rows[1]])
    __setDirectusRequesterForTests(requester)

    await expect(getPublishedNews(1, 1)).resolves.toEqual([rows[0]])
    await expect(getPublishedNews(1, 1)).resolves.toEqual([rows[1]])
    expect(requester).toHaveBeenCalledTimes(2)
  })

  it('converts a legacy cover column only when every stored value is a UUID', () => {
    const fields = {
      news: [
        { field: 'slug', type: 'string', meta: {}, schema: { is_unique: true } },
        {
          field: 'cover_image',
          type: 'uuid',
          meta: {},
          schema: { data_type: 'character varying' },
        },
      ],
    }
    const valid = buildCmsContractMigrationPlan({
      records: {
        news: [
          {
            id: 1,
            slug: 'valid-slug',
            cover_image: '11111111-1111-4111-8111-111111111111',
          },
        ],
      },
      fields,
    })
    expect(valid.issues).toEqual([])
    expect(valid.schemaChanges).toContainEqual({
      phase: 'type',
      collection: 'news',
      field: 'cover_image',
      type: 'uuid',
    })

    const invalid = buildCmsContractMigrationPlan({
      records: { news: [{ id: 1, slug: 'valid-slug', cover_image: '/legacy.jpg' }] },
      fields,
    })
    expect(invalid.issues).toContain('data_validation_required collection=news field=cover_image')
    expect(invalid.schemaChanges).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'cover_image' })])
    )
  })

  it.each([
    [' Bad-Slug ', 'whitespace'],
    ['Bad-Slug', 'format'],
  ])('rejects non-canonical slug %s even when the column is unique', (slug, reason) => {
    const plan = buildCmsContractMigrationPlan({
      records: { news: [{ id: 1, slug }] },
      fields: {
        news: [{ field: 'slug', type: 'string', meta: {}, schema: { is_unique: true } }],
      },
    })
    expect(plan.issues).toContain(
      `data_validation_required collection=news field=slug reason=${reason}`
    )
  })
})
