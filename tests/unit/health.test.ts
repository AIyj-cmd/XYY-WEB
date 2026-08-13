import { afterEach, describe, expect, it, vi } from 'vitest'

import { contactStorageStatus } from '../../server/health.mjs'

const env = {
  DIRECTUS_URL: 'https://directus.test',
  DIRECTUS_TOKEN: 'token',
}

describe('CMS-backed health status', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('accepts Directus only when every required collection is readable', async () => {
    const fetchMock = vi.fn(async (input: string) =>
      input.endsWith('/server/ping') ? new Response('pong') : Response.json({ data: [] })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(contactStorageStatus(env)).resolves.toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(20)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.test/items/faqs?limit=1&fields=id',
      expect.objectContaining({ headers: { Authorization: 'Bearer token' } })
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.test/items/contact_leads?limit=1&fields=id',
      expect.objectContaining({ headers: { Authorization: 'Bearer token' } })
    )
  })

  it('reports an incomplete CMS when a required collection is absent or forbidden', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        if (input.endsWith('/server/ping')) return new Response('pong')
        if (input.includes('/items/news?')) return Response.json({ errors: [] }, { status: 403 })
        return Response.json({ data: [] })
      })
    )

    await expect(contactStorageStatus(env)).resolves.toBe('incomplete')
  })

  it('reports an unreachable CMS when ping fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('offline', { status: 503 }))
    )

    await expect(contactStorageStatus(env)).resolves.toBe('unreachable')
  })
})
