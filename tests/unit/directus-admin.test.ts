import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDirectusAdminClient } from '../../scripts/lib/directus-admin.mjs'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Directus admin client', () => {
  it('normalizes the endpoint and unwraps Directus data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 1 }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
    vi.stubGlobal('fetch', fetchMock)
    const client = createDirectusAdminClient({
      baseUrl: 'https://cms.example.com///',
      token: 'test-token',
    })

    await expect(client.readCollection('services')).resolves.toEqual([{ id: 1 }])
    expect(client.baseUrl).toBe('https://cms.example.com')
    expect(client.endpointLabel).toBe('cms.example.com')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cms.example.com/items/services?limit=-1&sort=sort',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    )
  })

  it('serializes request bodies and can retain the Directus envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 2 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
    vi.stubGlobal('fetch', fetchMock)
    const client = createDirectusAdminClient({ baseUrl: 'https://cms.example.com', token: 'token' })

    await expect(
      client.request('POST', '/items/services', { name: '仓配' }, { unwrapData: false })
    ).resolves.toEqual({ data: { id: 2 } })
    expect(fetchMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({ body: JSON.stringify({ name: '仓配' }) })
    )
  })

  it('allows explicitly tolerated statuses for idempotent setup', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ errors: [{ message: 'already exists' }] }), {
          status: 409,
          headers: { 'content-type': 'application/json' },
        })
      )
    )
    const client = createDirectusAdminClient({ baseUrl: 'https://cms.example.com', token: 'token' })

    await expect(
      client.request('POST', '/collections', {}, { allowStatuses: [409], unwrapData: false })
    ).resolves.toEqual({ errors: [{ message: 'already exists' }] })
  })

  it('fails closed on an unexpected Directus response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ errors: [{ message: 'forbidden' }] }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        })
      )
    )
    const client = createDirectusAdminClient({ baseUrl: 'https://cms.example.com', token: 'token' })

    await expect(client.request('GET', '/items/services')).rejects.toThrow(
      'GET /items/services: forbidden'
    )
  })
})
