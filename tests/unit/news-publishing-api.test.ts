import { randomBytes } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '@/pages/api/integrations/news/batch'

const callerToken = randomBytes(32).toString('base64url')
const writeToken = randomBytes(32).toString('base64url')
const contentToken = randomBytes(32).toString('base64url')

const article = {
  title: '测试文章',
  slug: 'test-news-article',
  category: '行业资讯',
  summary: '测试摘要',
  content: '<p>测试正文</p>',
  cover_image: null,
}

function request(body: unknown, headers: Record<string, string> = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  return new Request('https://example.test/api/integrations/news/batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${callerToken}`,
      'Content-Type': 'application/json',
      'Content-Length': String(new TextEncoder().encode(payload).byteLength),
      ...headers,
    },
    body: payload,
  })
}

function directusSuccess() {
  return Response.json({ data: [{ id: 42 }] }, { status: 200 })
}

describe('News publishing integration API', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.stubEnv('NEWS_PUBLISH_API_TOKEN', callerToken)
    vi.stubEnv('DIRECTUS_NEWS_WRITE_TOKEN', writeToken)
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', contentToken)
    vi.stubEnv('DIRECTUS_URL', 'http://127.0.0.1:8055')
  })

  afterEach(() => vi.useRealTimers())

  it.each([
    ['missing authorization', { Authorization: '' }],
    ['non-Bearer authorization', { Authorization: callerToken }],
    ['wrong caller token', { Authorization: `Bearer ${randomBytes(32).toString('base64url')}` }],
    ['employee JWT', { Authorization: `Bearer ${randomBytes(32).toString('base64url')}` }],
  ])('rejects %s without calling Directus', async (_label, headers) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request({ articles: [article] }, headers) } as any)

    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fails closed when the API token is missing or too short', async () => {
    vi.stubEnv('NEWS_PUBLISH_API_TOKEN', 'short')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request({ articles: [article] }) } as any)

    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    ['missing caller token', 'NEWS_PUBLISH_API_TOKEN', ''],
    ['short caller token', 'NEWS_PUBLISH_API_TOKEN', 'short'],
    ['missing write token', 'DIRECTUS_NEWS_WRITE_TOKEN', ''],
    ['short write token', 'DIRECTUS_NEWS_WRITE_TOKEN', 'short'],
    ['missing content token', 'DIRECTUS_CONTENT_TOKEN', ''],
    ['short content token', 'DIRECTUS_CONTENT_TOKEN', 'short'],
    ['caller/content token reuse', 'DIRECTUS_CONTENT_TOKEN', callerToken],
  ])('fails closed for %s before calling Directus', async (_label, name, value) => {
    vi.stubEnv(name, value)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request({ articles: [article] }) } as any)

    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    [
      'non-JSON content type',
      request({ articles: [article] }, { 'Content-Type': 'text/plain' }),
      415,
    ],
    [
      'lookalike JSON content type',
      request({ articles: [article] }, { 'Content-Type': 'text/application/json' }),
      415,
    ],
    ['invalid JSON', request('{', {}), 400],
    ['unknown top-level field', request({ articles: [article], status: 'published' }), 400],
    ['unknown system article field', request({ articles: [{ ...article, id: 1 }] }), 400],
    ['invalid category', request({ articles: [{ ...article, category: '其他' }] }), 400],
    ['invalid slug', request({ articles: [{ ...article, slug: 'Bad Slug' }] }), 400],
    [
      'invalid cover image',
      request({ articles: [{ ...article, cover_image: '/cover.jpg' }] }),
      400,
    ],
    [
      'naive published time',
      request({ articles: [{ ...article, published_at: '2026-08-31T14:24:00' }] }),
      400,
    ],
    [
      'invalid calendar time',
      request({ articles: [{ ...article, published_at: '2026-02-30T14:24:00Z' }] }),
      400,
    ],
    [
      'duplicate batch slug',
      request({ articles: [article, { ...article, title: '重复', slug: article.slug }] }),
      400,
    ],
    [
      'batch limit',
      request({
        articles: Array.from({ length: 21 }, (_, id) => ({ ...article, slug: `news-${id}` })),
      }),
      400,
    ],
  ])('rejects %s before calling Directus', async (_label, apiRequest, status) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: apiRequest } as any)

    expect(response.status).toBe(status)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a body over the one-megabyte limit', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await POST({
      request: request({ articles: [{ ...article, content: 'x'.repeat(1024 * 1024) }] }),
    } as any)

    expect(response.status).toBe(413)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('writes a strict server-controlled payload with the dedicated write token', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-31T06:30:00.000Z'))
    const fetchMock = vi.fn(async () => directusSuccess())
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({
      request: request({ articles: [{ ...article, owner_id: 99, status: 'draft' }] }),
    } as any)

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()

    const successResponse = await POST({ request: request({ articles: [article] }) } as any)
    expect(successResponse.status).toBe(201)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8055/items/news',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${writeToken}`,
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
        body: JSON.stringify([
          {
            ...article,
            published_at: '2026-08-31T06:30:00.000Z',
            status: 'published',
          },
        ]),
      })
    )
    await expect(successResponse.json()).resolves.toEqual({
      success: true,
      data: { articles: [{ id: 42, slug: article.slug }] },
    })
  })

  it('rejects a Directus write token reused as the caller credential', async () => {
    vi.stubEnv('DIRECTUS_NEWS_WRITE_TOKEN', callerToken)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request({ articles: [article] }) } as any)

    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
