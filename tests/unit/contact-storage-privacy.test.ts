import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { storeContactLead } from '@/lib/contact/storage'

const token = 't'.repeat(32)
const lead = {
  name: '敏感姓名',
  phone: '13800138000',
  company: '敏感公司',
  email: 'private@example.test',
  service: 'cloud-warehouse',
  message: '敏感需求',
}

describe('contact storage failure logging', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['missing configuration', undefined, undefined],
    ['HTTP rejection', 'https://xs.test', async () => new Response('{}', { status: 502 })],
    ['invalid response', 'https://xs.test', async () => Response.json({ code: 0, data: {} })],
    [
      'fetch failure',
      'https://xs.test',
      async () => Promise.reject(new Error('downstream detail')),
    ],
  ])('logs only fixed failure metadata for %s', async (_label, url, fetchResult) => {
    vi.stubEnv('XIANSUO_API_URL', url || '')
    vi.stubEnv('XIANSUO_INGEST_TOKEN', token)
    if (fetchResult) vi.stubGlobal('fetch', vi.fn(fetchResult))
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(storeContactLead(lead)).resolves.toEqual({
      error: '提交失败，请稍后重试或直接拨打客服热线',
    })

    expect(error).toHaveBeenCalledOnce()
    const logged = JSON.stringify(error.mock.calls)
    for (const secret of [...Object.values(lead), token, 'downstream detail']) {
      expect(logged).not.toContain(secret)
    }
  })

  it('retains the downstream HTTP status without logging the lead', async () => {
    vi.stubEnv('XIANSUO_API_URL', 'https://xs.test')
    vi.stubEnv('XIANSUO_INGEST_TOKEN', token)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 503 }))
    )
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await storeContactLead(lead)

    expect(error).toHaveBeenCalledWith('[contact] Xiansuo rejected lead', { status: 503 })
  })
})
