import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST, __resetContactRateLimitForTests } from '@/pages/api/contact'

function request(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const payload = JSON.stringify(body)
  return new Request('https://56xyy.com/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': String(payload.length),
      ...headers,
    },
    body: payload,
  })
}

function requestWithoutContentLength(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  return new Request('https://56xyy.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
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

  it('rejects an invalid optional email before storage', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({
      request: request({
        name: '张三',
        phone: '13800138000',
        email: 'not-an-email',
        message: '想了解仓配一体方案',
        privacyConsent: 'on',
      }),
    } as any)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: '请输入有效的邮箱地址' })
    expect(fetchMock).not.toHaveBeenCalled()
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
    vi.stubEnv('DIRECTUS_CONTACT_TOKEN', 'contact-token')
    vi.stubEnv('DIRECTUS_TOKEN', 'legacy-token')

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
        privacyConsent: 'on',
      }),
    } as any)

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.test/items/contact_leads',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer contact-token' }),
        body: JSON.stringify({
          name: '张三',
          phone: '13800138000',
          company: '测试公司',
          email: 'test@example.com',
          service: 'cloud-warehouse',
          message: '想了解仓配一体方案',
        }),
      })
    )
  })

  it('rejects valid leads when Directus storage is not configured', async () => {
    vi.stubEnv('DIRECTUS_URL', '')
    vi.stubEnv('DIRECTUS_CONTACT_TOKEN', '')
    vi.stubEnv('DIRECTUS_TOKEN', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({
      request: request({
        name: '张三',
        phone: '13800138000',
        message: '想了解仓配一体方案',
        privacyConsent: 'on',
      }),
    } as any)

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: '提交失败，请稍后重试或直接拨打客服热线',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rate limits repeated submissions from the same IP', async () => {
    const body = { name: '张三', phone: '13800138000', message: '咨询', privacyConsent: 'on' }
    let lastResponse = new Response(null)

    for (let i = 0; i < 6; i += 1) {
      lastResponse = await POST({
        request: request(body, { 'x-forwarded-for': '203.0.113.1' }),
      } as any)
    }

    expect(lastResponse.status).toBe(429)
  })

  it('rejects oversized bodies even when Content-Length is absent', async () => {
    const response = await POST({
      request: requestWithoutContentLength({ message: '测'.repeat(9000) }),
    } as any)

    expect(response.status).toBe(413)
  })

  it('does not let spoofed X-Forwarded-For prefixes evade rate limiting', async () => {
    const body = { name: '张三', phone: '13800138000', message: '咨询', privacyConsent: 'on' }
    let lastResponse = new Response(null)

    for (let i = 0; i < 6; i += 1) {
      lastResponse = await POST({
        request: requestWithoutContentLength(body, {
          'x-forwarded-for': `198.51.100.${i}, 203.0.113.8`,
        }),
      } as any)
    }

    expect(lastResponse.status).toBe(429)
  })
})
