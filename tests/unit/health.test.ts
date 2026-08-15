import { afterEach, describe, expect, it, vi } from 'vitest'

import { contactStorageStatus } from '../../server/health.mjs'
import { CONTENT_COLLECTIONS } from '../../server/runtime-permissions.mjs'

const env = {
  DIRECTUS_URL: 'https://directus.test',
  DIRECTUS_CONTENT_TOKEN: 'content-token',
  DIRECTUS_CONTACT_TOKEN: 'contact-token',
}
const runtimeCollections: string[] = CONTENT_COLLECTIONS

describe('CMS-backed health status', () => {
  afterEach(() => vi.unstubAllGlobals())

  function contentPermissions(excludedCollection?: string) {
    return {
      data: Object.fromEntries(
        runtimeCollections.map((collection) => [
          collection,
          { read: { access: collection === excludedCollection ? 'none' : 'partial' } },
        ])
      ),
    }
  }

  it('accepts Directus only when every required collection permission is readable', async () => {
    const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
      if (input.endsWith('/server/ping')) return new Response('pong')
      if (input.endsWith('/permissions/me')) {
        if (
          init?.headers &&
          (init.headers as Record<string, string>).Authorization === 'Bearer content-token'
        ) {
          return Response.json(contentPermissions())
        }
        return Response.json({
          data: { contact_leads: { create: { access: 'full', fields: ['*'] } } },
        })
      }
      return Response.json({ data: [] })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(contactStorageStatus(env)).resolves.toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://directus.test/permissions/me',
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

  it('does not accept the legacy shared token when dedicated tokens are missing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      contactStorageStatus({
        DIRECTUS_URL: 'https://directus.test',
        DIRECTUS_TOKEN: 'legacy-token',
      })
    ).resolves.toBe('missing')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports identical dedicated tokens as incomplete without downstream requests', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      contactStorageStatus({
        DIRECTUS_URL: 'https://directus.test',
        DIRECTUS_CONTENT_TOKEN: 'same-token',
        DIRECTUS_CONTACT_TOKEN: 'same-token',
      })
    ).resolves.toBe('incomplete')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports an incomplete CMS when a required collection is absent or forbidden', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string, init?: RequestInit) => {
        if (input.endsWith('/server/ping')) return new Response('pong')
        if (input.endsWith('/permissions/me')) {
          if (
            init?.headers &&
            (init.headers as Record<string, string>).Authorization === 'Bearer content-token'
          ) {
            return Response.json(contentPermissions('news'))
          }
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
      vi.fn(async (input: string, init?: RequestInit) => {
        if (input.endsWith('/server/ping')) return new Response('pong')
        if (input.endsWith('/permissions/me')) {
          if (
            init?.headers &&
            (init.headers as Record<string, string>).Authorization === 'Bearer content-token'
          ) {
            return Response.json(contentPermissions())
          }
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
