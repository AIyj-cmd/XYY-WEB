import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __resetDirectusAssetCacheForTests,
  fetchPublishedDirectusAsset,
} from '@/lib/directus-assets'
import { __setDirectusRequesterForTests } from '@/lib/directus'

const fileId = '11111111-1111-4111-8111-111111111111'

describe('published Directus asset delivery', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    __setDirectusRequesterForTests(null)
    __resetDirectusAssetCacheForTests()
  })

  it('authenticates an upstream file only after finding a published reference', async () => {
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'content-secret')
    vi.stubEnv('DIRECTUS_URL', 'https://directus.test')
    __setDirectusRequesterForTests(async (collection) =>
      collection === 'news' ? [{ cover_image: fileId }] : []
    )
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect((init?.headers as Headers).get('Authorization')).toBe('Bearer content-secret')
      return new Response('image', { headers: { 'content-type': 'image/png' } })
    })

    const response = await fetchPublishedDirectusAsset(fileId, new Headers(), fetchMock)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    await expect(response.text()).resolves.toBe('image')
    expect(fetchMock).toHaveBeenCalledWith(
      `https://directus.test/assets/${fileId}`,
      expect.any(Object)
    )
  })

  it('does not expose unreferenced files or call the asset endpoint', async () => {
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'content-secret')
    __setDirectusRequesterForTests(async () => [])
    const fetchMock = vi.fn()

    const response = await fetchPublishedDirectusAsset(fileId, new Headers(), fetchMock)

    expect(response.status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
