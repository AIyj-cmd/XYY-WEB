import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST, __resetContactRateLimitForTests } from '@/pages/api/contact'

function request(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const payload = JSON.stringify(body)
  return new Request('https://wz.tomatopia.top/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': String(payload.length),
      ...headers,
    },
    body: payload,
  })
}

describe('contact API', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    __resetContactRateLimitForTests()
  })

  it('rejects missing required fields', async () => {
    const response = await POST({ request: request({ name: '', phone: '', message: '' }) } as any)

    expect(response.status).toBe(400)
  })

  it('silently accepts honeypot submissions', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({
      request: request({ name: '张三', phone: '13800138000', message: '咨询', website: 'bot' }),
    } as any)

    expect(response.status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('stores valid leads in Directus when configured', async () => {
    vi.stubEnv('DIRECTUS_URL', 'https://directus.test')
    vi.stubEnv('DIRECTUS_TOKEN', 'token')

    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ data: { id: 1 } }), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({
      request: request({
        name: '张三',
        phone: '13800138000',
        company: '测试公司',
        email: 'test@example.com',
        service: 'cloud-warehouse',
        message: '想了解仓配一体方案',
      }),
    } as any)

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.test/items/contact_leads',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('rate limits repeated submissions from the same IP', async () => {
    const body = { name: '张三', phone: '13800138000', message: '咨询' }
    let lastResponse = new Response(null)

    for (let i = 0; i < 6; i += 1) {
      lastResponse = await POST({
        request: request(body, { 'x-forwarded-for': '203.0.113.1' }),
      } as any)
    }

    expect(lastResponse.status).toBe(429)
  })
})
