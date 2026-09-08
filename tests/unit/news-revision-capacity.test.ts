import { randomBytes } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '@/pages/api/integrations/news/batch'

const callerToken = randomBytes(32).toString('base64url')
const writeToken = randomBytes(32).toString('base64url')
const contentToken = randomBytes(32).toString('base64url')

function article(content: string) {
  return {
    title: '容量回归文章',
    slug: `revision-capacity-${content.length}`,
    category: '行业资讯',
    summary: '容量回归测试摘要',
    content,
    cover_image: null,
  }
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

describe('News revision-capacity regression', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.stubEnv('NEWS_PUBLISH_API_TOKEN', callerToken)
    vi.stubEnv('DIRECTUS_NEWS_WRITE_TOKEN', writeToken)
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', contentToken)
    vi.stubEnv('DIRECTUS_URL', 'http://127.0.0.1:8055')
  })

  it.each([5000, 11000])(
    'keeps %s Chinese characters intact in one Directus news write',
    async (count) => {
      const content = `<p>${'中'.repeat(count)}</p>`
      expect(new TextEncoder().encode(content).byteLength).toBeGreaterThan(
        count === 5000 ? 14_939 : 32_767
      )
      const fetchMock = vi.fn<typeof fetch>(async () => Response.json({ data: [{ id: 42 }] }))
      vi.stubGlobal('fetch', fetchMock)

      const response = await POST({ request: request({ articles: [article(content)] }) } as any)

      expect(response.status).toBe(201)
      expect(fetchMock).toHaveBeenCalledOnce()
      const call = fetchMock.mock.calls[0]
      expect(call).toBeDefined()
      if (!call) throw new Error('expected Directus request')
      const [url, options] = call
      expect(url).toBe('http://127.0.0.1:8055/items/news')
      expect(String(url)).not.toContain('directus_revisions')
      expect(typeof options?.body).toBe('string')
      if (typeof options?.body !== 'string') throw new Error('expected JSON request body')
      const body = JSON.parse(options.body)
      expect(body[0].content).toBe(content)
      expect(body[0]).not.toHaveProperty('accountability')
      expect(JSON.stringify(body)).not.toContain('directus_revisions')
    }
  )

  it.each(['data', 'delta'])(
    'maps an Oracle revision %s failure to a non-sensitive 502',
    async (column) => {
      const rawError = `INSERT INTO "XYY_DIRECTUS"."directus_revisions" ("${column}") VALUES ('${callerToken}', '${writeToken}', '${contentToken}') failed: ORA-12899`
      const fetchMock = vi.fn<typeof fetch>(async () =>
        Response.json({ errors: [{ message: rawError }] }, { status: 500 })
      )
      vi.stubGlobal('fetch', fetchMock)

      const response = await POST({
        request: request({ articles: [article('<p>正常正文</p>')] }),
      } as any)
      const body = await response.text()

      expect(response.status).toBe(502)
      expect(fetchMock).toHaveBeenCalledOnce()
      expect(body).not.toContain('ORA-12899')
      expect(body).not.toContain('XYY_DIRECTUS')
      expect(body).not.toContain(callerToken)
      expect(body).not.toContain(writeToken)
      expect(body).not.toContain(contentToken)
    }
  )
})
