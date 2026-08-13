import { afterEach, describe, expect, it, vi } from 'vitest'

import { contactStorageStatus } from '../../server/health.mjs'

const env = {
  DIRECTUS_URL: 'https://directus.test',
  DIRECTUS_CONTENT_TOKEN: 'content-token',
  DIRECTUS_CONTACT_TOKEN: 'contact-token',
}

describe('CMS-backed health status', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('accepts Directus only when every required collection is readable', async () => {
    const fetchMock = vi.fn(async (input: string) => {
      if (input.endsWith('/server/ping')) return new Response('pong')
      if (input.endsWith('/permissions/me')) {
        return Response.json({
          data: { contact_leads: { create: { access: 'full', fields: ['*'] } } },
        })
      }
      return Response.json({ data: [] })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(contactStorageStatus(env)).resolves.toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(20)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.test/items/faqs?limit=1&fields=id',
      expect.objectContaining({ headers: { Authorization: 'Bearer content-token' } })
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.test/permissions/me',
      expect.objectContaining({ headers: { Authorization: 'Bearer contact-token' } })
    )
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/items/contact_leads?'),
      expect.anything()
    )
  })

  it('reports an incomplete CMS when a required collection is absent or forbidden', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        if (input.endsWith('/server/ping')) return new Response('pong')
        if (input.includes('/items/news?')) return Response.json({ errors: [] }, { status: 403 })
        if (input.endsWith('/permissions/me')) {
          return Response.json({
            data: { contact_leads: { create: { access: 'full', fields: ['*'] } } },
          })
        }
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

  it('reports an incomplete CMS when the contact token cannot create leads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        if (input.endsWith('/server/ping')) return new Response('pong')
        if (input.endsWith('/permissions/me')) {
          return Response.json({
            data: { contact_leads: { create: { access: 'none', fields: [] } } },
          })
        }
        return Response.json({ data: [] })
      })
    )

    await expect(contactStorageStatus(env)).resolves.toBe('incomplete')
  })
})
