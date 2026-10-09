import { describe, expect, it, vi } from 'vitest'

import { runNewsControlledAcceptance } from '../../scripts/lib/news-controlled-acceptance.mjs'
import {
  preflightNewsTokens,
  verifyNewsWriterPermissionPayload,
} from '../../scripts/lib/news-token-preflight.mjs'
import { POST } from '@/pages/api/integrations/news/batch'

const tokens = {
  apiToken: 'a'.repeat(32),
  writeToken: 'b'.repeat(32),
  contentToken: 'c'.repeat(32),
}

describe('news controlled acceptance helpers', () => {
  it('uses trimmed distinct tokens and create-only scope', () => {
    expect(preflightNewsTokens({ ...tokens, writerPermissions: ['news:create'] })).toMatchObject({
      writerPermissions: ['news:create'],
    })
    expect(() =>
      preflightNewsTokens({
        ...tokens,
        apiToken: ` ${tokens.writeToken} `,
        writerPermissions: ['news:create'],
      })
    ).toThrow('not_distinct')
  })

  it('validates a read-back permission payload instead of trusting a declared scope', () => {
    const payload = {
      data: {
        news: {
          create: {
            access: 'partial',
            fields: [
              'title',
              'slug',
              'category',
              'summary',
              'content',
              'published_at',
              'status',
              'cover_image',
            ],
          },
          read: { access: 'none' },
        },
      },
    }
    expect(verifyNewsWriterPermissionPayload(payload)).toMatchObject({
      writerPermissions: ['news:create'],
    })
    expect(() =>
      verifyNewsWriterPermissionPayload({
        data: { news: { create: { access: 'full', fields: [] }, read: { access: 'full' } } },
      })
    ).toThrow('create_fields')
  })
  it('rejects missing or extra writer create fields', () => {
    const fields = [
      'title',
      'slug',
      'category',
      'summary',
      'content',
      'published_at',
      'status',
      'cover_image',
    ]
    expect(() =>
      verifyNewsWriterPermissionPayload({
        data: {
          news: {
            create: {
              access: 'partial',
              fields: fields.filter((field) => field !== 'cover_image'),
            },
          },
        },
      })
    ).toThrow('create_fields')
    expect(() =>
      verifyNewsWriterPermissionPayload({
        data: { news: { create: { access: 'partial', fields: [...fields, 'owner_id'] } } },
      })
    ).toThrow('create_fields')
  })

  it('cleans an exact marked possible 204 create and reports its failure', async () => {
    const now = new Date('2026-10-04T00:00:00.000Z')
    const records: any[] = []
    const admin = {
      readByExactSlugs: vi.fn(async () => records),
      deleteByExactId: vi.fn(async (id) =>
        records.splice(
          records.findIndex((record) => record.id === id),
          1
        )
      ),
    }
    const create = vi.fn(async (payload) => {
      records.push({ id: 71, ...payload, status: 'published' })
      return { status: 204 }
    })
    await expect(
      runNewsControlledAcceptance({ admin, create, runId: 'run-a', now })
    ).rejects.toThrow('status=204')
    expect(admin.deleteByExactId).toHaveBeenCalledWith(71)
  })

  it('accepts the actual batch handler success contract through a local mock adapter', async () => {
    const now = new Date('2026-10-04T00:00:00.000Z')
    const records: any[] = []
    const apiToken = 'd'.repeat(32)
    vi.stubEnv('NEWS_PUBLISH_API_TOKEN', apiToken)
    vi.stubEnv('DIRECTUS_NEWS_WRITE_TOKEN', 'e'.repeat(32))
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'f'.repeat(32))
    vi.stubEnv('DIRECTUS_URL', 'http://127.0.0.1:8055')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ data: [{ id: 72 }] }))
    )
    const admin = {
      readByExactSlugs: vi.fn(async () => records),
      deleteByExactId: vi.fn(async (id) =>
        records.splice(
          records.findIndex((record) => record.id === id),
          1
        )
      ),
    }
    const create = async (article: Record<string, unknown>) => {
      const request = new Request('https://example.test/api/integrations/news/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: [article] }),
      })
      const response = await POST({ request } as any)
      const body = await response.json()
      if (response.status === 201)
        records.push({ id: body.data.articles[0].id, ...article, status: 'published' })
      return { status: response.status, body }
    }
    await expect(
      runNewsControlledAcceptance({ admin, create, runId: 'run-d', now })
    ).resolves.toMatchObject({ slug: 'xyy-20261004-03-run-d-1' })
    expect(admin.deleteByExactId).toHaveBeenCalledWith(72)
  })

  it('refuses a preexisting slug without deletion', async () => {
    const admin = {
      readByExactSlugs: vi.fn(async () => [{ id: 71, slug: 'xyy-20261004-03-run-b-1' }]),
      deleteByExactId: vi.fn(),
    }
    await expect(
      runNewsControlledAcceptance({ admin, create: vi.fn(), runId: 'run-b' })
    ).rejects.toThrow('slug_already_exists')
    expect(admin.deleteByExactId).not.toHaveBeenCalled()
  })

  it('fails rather than deleting a marker mismatch', async () => {
    let calls = 0
    const admin = {
      readByExactSlugs: vi.fn(async () =>
        ++calls === 1
          ? []
          : [{ id: 71, slug: 'xyy-20261004-03-run-c-1', status: 'published', title: 'other' }]
      ),
      deleteByExactId: vi.fn(),
    }
    await expect(
      runNewsControlledAcceptance({ admin, create: vi.fn(), runId: 'run-c' })
    ).rejects.toThrow('cleanup_mismatch')
    expect(admin.deleteByExactId).not.toHaveBeenCalled()
  })
})
