import { beforeEach, describe, expect, it, vi } from 'vitest'
import { randomBytes } from 'node:crypto'

import { POST, __resetContactRateLimitForTests } from '@/pages/api/contact'

const integrationToken = randomBytes(32).toString('base64url')

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
    vi.stubEnv('XIANSUO_API_URL', '')
    vi.stubEnv('XIANSUO_INGEST_TOKEN', '')
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

  it('fails closed without Xiansuo configuration and never falls back to Directus', async () => {
    vi.stubEnv('DIRECTUS_URL', 'https://directus.test')
    vi.stubEnv('DIRECTUS_CONTACT_TOKEN', 'legacy-contact-token')
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
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects valid leads when Xiansuo storage is not configured', async () => {
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
    vi.stubEnv('XIANSUO_API_URL', 'https://xs.test')
    vi.stubEnv('XIANSUO_INGEST_TOKEN', integrationToken)
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ code: 0, data: { id: 1, duplicate: false } }), {
            status: 200,
          })
      )
    )
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
    vi.stubEnv('XIANSUO_API_URL', 'https://xs.test')
    vi.stubEnv('XIANSUO_INGEST_TOKEN', integrationToken)
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ code: 0, data: { id: 1, duplicate: false } }), {
            status: 200,
          })
      )
    )
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
