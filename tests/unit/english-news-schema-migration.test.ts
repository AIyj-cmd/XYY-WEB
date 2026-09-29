import { describe, expect, it, vi } from 'vitest'

import {
  applyEnglishNewsSchemaPlan,
  buildEnglishNewsSchemaPlan,
} from '../../scripts/lib/english-news-schema-migration.mjs'

describe('English news schema migration', () => {
  it('plans an English group before its optional draft fields', () => {
    const plan = buildEnglishNewsSchemaPlan([])

    expect(plan.aliases.map((item: { field: string }) => item.field)).toEqual(['english_content'])
    expect(plan.fields.map((item: { field: string }) => item.field)).toEqual([
      'title_en',
      'summary_en',
      'content_en',
      'english_status',
      'english_published_at',
    ])
    expect(
      (
        plan.fields.find((item: { field: string }) => item.field === 'english_status') as {
          schema?: object
        }
      )?.schema
    ).toEqual({
      is_nullable: true,
      default_value: 'draft',
    })
  })

  it('keeps dry-runs read-only and applies the group before fields only when explicit', async () => {
    const request = vi.fn(async (method: string, path: string, body?: { field: string }) => ({
      method,
      path,
      body,
    }))
    const plan = buildEnglishNewsSchemaPlan([])

    await expect(applyEnglishNewsSchemaPlan({ request }, plan)).resolves.toEqual({
      aliasesApplied: 0,
      fieldsApplied: 0,
    })
    expect(request).not.toHaveBeenCalled()

    await expect(applyEnglishNewsSchemaPlan({ request }, plan, { apply: true })).resolves.toEqual({
      aliasesApplied: 1,
      fieldsApplied: 5,
    })
    expect(request.mock.calls[0]).toMatchObject([
      'POST',
      '/fields/news',
      { field: 'english_content' },
    ])
    expect(request.mock.calls.slice(1).map(([, , body]) => body?.field)).toEqual([
      'title_en',
      'summary_en',
      'content_en',
      'english_status',
      'english_published_at',
    ])
  })

  it('stops on incompatible existing English field or group metadata', () => {
    expect(() =>
      buildEnglishNewsSchemaPlan([
        {
          field: 'english_content',
          type: 'alias',
          meta: { special: ['group'] },
          schema: null,
        },
        {
          field: 'english_status',
          type: 'string',
          meta: { group: 'english_content' },
          schema: { is_nullable: true, default_value: 'published' },
        },
      ])
    ).toThrow('migration_required:english_news_default field=english_status')
    expect(() =>
      buildEnglishNewsSchemaPlan([
        { field: 'english_content', type: 'string', meta: {}, schema: {} },
      ])
    ).toThrow('migration_required:english_news_group_alias field=english_content')
  })
})
