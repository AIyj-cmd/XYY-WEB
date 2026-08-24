import { beforeEach, describe, expect, it, vi } from 'vitest'
import { randomBytes } from 'node:crypto'

import { POST, __resetContactRateLimitForTests } from '@/pages/api/contact'

const lead = {
  name: '张三',
  phone: '13800138000',
  company: '测试公司',
  email: 'test@example.com',
  service: 'cloud-warehouse',
  message: '想了解仓配一体方案',
  privacyConsent: 'on',
}
const integrationToken = randomBytes(32).toString('base64url')

function request(body: Record<string, unknown>) {
  const payload = JSON.stringify(body)
  return new Request('https://56xyy.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': String(payload.length) },
    body: payload,
  })
}

describe('contact Xiansuo integration', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.stubEnv('XIANSUO_API_URL', 'https://xs.test')
    vi.stubEnv('XIANSUO_INGEST_TOKEN', integrationToken)
    __resetContactRateLimitForTests()
  })

  it('sends only the validated public payload through the server-side integration', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ code: 0, data: { id: 1, duplicate: false } })
    )
    vi.stubGlobal('fetch', fetchMock)
    const response = await POST({
      request: request({ ...lead, owner_id: 99, status: 'attacker-controlled' }),
    } as any)

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://xs.test/api/integrations/website-leads',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: `Bearer ${integrationToken}` }),
        signal: expect.any(AbortSignal),
        body: JSON.stringify({ ...lead, privacyConsent: undefined }),
      })
    )
  })

  it('treats duplicate as a successful submission', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ code: 0, data: { duplicate: true } }))
    )
    const response = await POST({ request: request(lead) } as any)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
  })

  it.each([
    ['HTTP 400', async () => new Response('{}', { status: 400 })],
    ['HTTP 401', async () => new Response('{}', { status: 401 })],
    ['HTTP 403', async () => new Response('{}', { status: 403 })],
    ['HTTP 500', async () => new Response('{}', { status: 500 })],
    ['invalid response', async () => Response.json({ code: 0, data: {} })],
    ['invalid JSON response', async () => new Response('not JSON', { status: 200 })],
    ['timeout rejection', async () => Promise.reject(new DOMException('timeout', 'TimeoutError'))],
    ['network failure', async () => Promise.reject(new TypeError('network unavailable'))],
  ])('fails closed for Xiansuo %s', async (_label, fetchResult) => {
    vi.stubGlobal('fetch', vi.fn(fetchResult))
    const response = await POST({ request: request(lead) } as any)
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: '提交失败，请稍后重试或直接拨打客服热线',
    })
  })

  it('rejects missing or insecure storage configuration without a request', async () => {
    vi.stubEnv('XIANSUO_API_URL', 'http://xs.test')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await POST({ request: request(lead) } as any)
    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a short token configuration without a request', async () => {
    vi.stubEnv('XIANSUO_INGEST_TOKEN', 'short')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await POST({ request: request(lead) } as any)
    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
