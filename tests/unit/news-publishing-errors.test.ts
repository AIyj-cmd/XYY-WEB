import { randomBytes } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
}

function request(body: unknown) {
  const payload = JSON.stringify(body)
  return new Request('https://example.test/api/integrations/news/batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${callerToken}`,
      'Content-Type': 'application/json',
      'Content-Length': String(new TextEncoder().encode(payload).byteLength),
    },
    body: payload,
  })
}

describe('News publishing integration errors', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.stubEnv('NEWS_PUBLISH_API_TOKEN', callerToken)
    vi.stubEnv('DIRECTUS_NEWS_WRITE_TOKEN', writeToken)
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', contentToken)
    vi.stubEnv('DIRECTUS_URL', 'http://127.0.0.1:8055')
  })

  it.each([
    ['duplicate status', async () => Response.json({ errors: [] }, { status: 409 }), 409],
    [
      'unique constraint response',
      async () =>
        Response.json({ errors: [{ extensions: { code: 'RECORD_NOT_UNIQUE' } }] }, { status: 400 }),
      409,
    ],
    [
      'downstream 400',
      async () => Response.json({ errors: [{ message: 'internal' }] }, { status: 400 }),
      502,
    ],
    ['downstream 500', async () => Response.json({ errors: [] }, { status: 500 }), 502],
    ['invalid JSON', async () => new Response('not JSON', { status: 200 }), 502],
    ['invalid success contract', async () => Response.json({ data: [] }), 502],
    ['network failure', async () => Promise.reject(new TypeError('network failure')), 502],
    ['timeout', async () => Promise.reject(new DOMException('timeout', 'TimeoutError')), 502],
  ])('maps Directus %s to a stable non-sensitive response', async (_label, fetchResult, status) => {
    vi.stubGlobal('fetch', vi.fn(fetchResult))

    const response = await POST({ request: request({ articles: [article] }) } as any)
    const body = await response.text()

    expect(response.status).toBe(status)
    expect(body).not.toContain(writeToken)
    expect(body).not.toContain(contentToken)
    expect(body).not.toContain('internal')
  })

  it('does not use a missing, short, or read-only-reused Directus token', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    vi.stubEnv('DIRECTUS_NEWS_WRITE_TOKEN', '')
    expect((await POST({ request: request({ articles: [article] }) } as any)).status).toBe(503)

    vi.stubEnv('DIRECTUS_NEWS_WRITE_TOKEN', 'short')
    expect((await POST({ request: request({ articles: [article] }) } as any)).status).toBe(503)

    vi.stubEnv('DIRECTUS_NEWS_WRITE_TOKEN', contentToken)
    expect((await POST({ request: request({ articles: [article] }) } as any)).status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    ['https://directus.example.test/cms', 'https://directus.example.test/cms/items/news'],
    ['http://localhost:8055/cms', 'http://localhost:8055/cms/items/news'],
    ['http://127.0.0.1:8055/cms', 'http://127.0.0.1:8055/cms/items/news'],
    ['http://[::1]:8055/cms', 'http://[::1]:8055/cms/items/news'],
  ])('allows secure Directus write URL %s', async (directusUrl, expectedUrl) => {
    vi.stubEnv('DIRECTUS_URL', directusUrl)
    const fetchMock = vi.fn(async () => Response.json({ data: [{ id: 42 }] }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request({ articles: [article] }) } as any)

    expect(response.status).toBe(201)
    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.anything())
  })

  it.each([
    'http://directus.example.test',
    'http://localhost.evil.test',
    'http://127.0.0.1.evil.test',
    'http://2130706433',
    'ftp://127.0.0.1:8055',
    'https://user:pass@directus.example.test',
    'https://directus.example.test?token=unexpected',
    'https://directus.example.test#unexpected',
  ])('rejects unsafe Directus write URL %s before fetch', async (directusUrl) => {
    vi.stubEnv('DIRECTUS_URL', directusUrl)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request({ articles: [article] }) } as any)

    expect(response.status).toBe(502)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([undefined, '', 0, -1, 1.5, '0', '-1', '1.5', 'not-an-id', '9007199254740992'])(
    'rejects invalid Directus success identifier %s',
    async (id) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => Response.json({ data: [{ id }] }))
      )

      const response = await POST({ request: request({ articles: [article] }) } as any)

      expect(response.status).toBe(502)
    }
  )
})
