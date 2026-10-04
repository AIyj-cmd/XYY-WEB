import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST, __resetContactRateLimitForTests } from '@/pages/api/contact'

const integrationToken = 't'.repeat(32)
const lead = {
  name: '张三',
  phone: '13800138000',
  message: '想了解仓配一体方案',
  privacyConsent: 'on',
}

function request(contentType: string | undefined, body = JSON.stringify(lead)) {
  if (contentType === undefined) {
    const bytes = new TextEncoder().encode(body)
    return new Request('https://56xyy.com/api/contact', {
      method: 'POST',
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(bytes)
          controller.close()
        },
      }),
      duplex: 'half',
    } as RequestInit)
  }
  const headers = new Headers()
  headers.set('content-type', contentType)
  return new Request('https://56xyy.com/api/contact', { method: 'POST', headers, body })
}

describe('contact content type gate', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.stubEnv('XIANSUO_API_URL', 'https://xs.test')
    vi.stubEnv('XIANSUO_INGEST_TOKEN', integrationToken)
    __resetContactRateLimitForTests()
  })

  it.each([
    undefined,
    '',
    'application/jsonp',
    'text/application/json',
    'text/plain',
    'multipart/form-data',
  ])('rejects non-JSON media type %s before storage', async (contentType) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request(contentType) } as any)

    expect(response.status).toBe(415)
    await expect(response.json()).resolves.toMatchObject({ code: 'unsupported_content_type' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts application/json case-insensitively with whitespace and parameters', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ code: 0, data: { id: 1, duplicate: false } })
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST({ request: request(' Application/JSON ; charset=utf-8 ') } as any)

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('returns the existing 500 response when the request stream fails', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new Error('stream failed'))
      },
    })
    const response = await POST({
      request: new Request('https://56xyy.com/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: stream,
        duplex: 'half',
      } as RequestInit),
    } as any)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({ code: 'internal_error' })
  })
})
