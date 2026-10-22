import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST, __resetContactRateLimitForTests } from '@/pages/api/contact'

function request(body: Record<string, unknown>) {
  const payload = JSON.stringify(body)
  return new Request('https://56xyy.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': String(payload.length) },
    body: payload,
  })
}

const validLead = {
  name: '张三',
  countryOrRegion: '中国',
  phone: '13800138000',
  message: '想了解仓配一体方案',
  privacyConsent: 'on',
}

describe('contact country or region API validation', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.stubEnv('XIANSUO_API_URL', 'https://xs.test')
    vi.stubEnv('XIANSUO_INGEST_TOKEN', 't'.repeat(32))
    __resetContactRateLimitForTests()
  })

  it.each([
    ['missing', undefined],
    ['Unicode whitespace only', '　'],
    ['non-string', { value: '中国' }],
    ['overlong', '中'.repeat(81)],
    ['line break', '中国\n香港'],
  ])('rejects a %s country or region before storage', async (_label, countryOrRegion) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request({ ...validLead, countryOrRegion }) } as any)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ code: 'validation_failed' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a message over the shared 1100-character limit before storage', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({
      request: request({ ...validLead, message: 'x'.repeat(1101) }),
    } as any)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: '需求描述不能超过1100个字符',
      code: 'validation_failed',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
