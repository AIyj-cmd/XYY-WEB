import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __resetDirectusAssetCacheForTests,
  fetchPublishedDirectusAsset,
  isPublishedDirectusAsset,
} from '@/lib/directus-assets'
import { __setDirectusRequesterForTests } from '@/lib/directus'

const publishedId = '11111111-1111-4111-8111-111111111111'
const missingId = '22222222-2222-4222-8222-222222222222'
const otherMissingId = '33333333-3333-4333-8333-333333333333'

describe('published Directus asset security', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    __setDirectusRequesterForTests(null)
    __resetDirectusAssetCacheForTests()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shares the five-second reference cache for missing IDs, then refreshes it', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-02T00:00:00Z'))
    const requestItems = vi.fn(async () => [])
    __setDirectusRequesterForTests(requestItems)

    await expect(isPublishedDirectusAsset(missingId)).resolves.toBe(false)
    await expect(isPublishedDirectusAsset(otherMissingId)).resolves.toBe(false)
    expect(requestItems).toHaveBeenCalledTimes(7)

    vi.advanceTimersByTime(5_001)
    await expect(isPublishedDirectusAsset(missingId)).resolves.toBe(false)
    expect(requestItems).toHaveBeenCalledTimes(14)
  })

  it('shares one in-flight reference read between simultaneous missing IDs', async () => {
    let release: (() => void) | undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const requestItems = vi.fn(async () => {
      await gate
      return []
    })
    __setDirectusRequesterForTests(requestItems)

    const first = isPublishedDirectusAsset(missingId)
    const second = isPublishedDirectusAsset(otherMissingId)

    expect(requestItems).toHaveBeenCalledTimes(7)
    release?.()
    await expect(first).resolves.toBe(false)
    await expect(second).resolves.toBe(false)
  })

  it('does not cache a failed reference read and retries it later', async () => {
    let calls = 0
    const requestItems = vi.fn(async () => {
      calls += 1
      if (calls <= 7) throw new Error('CMS unavailable')
      return []
    })
    __setDirectusRequesterForTests(requestItems)

    await expect(isPublishedDirectusAsset(missingId)).rejects.toThrow(
      '[directus:request] collection=cases operation=read_items reason=network'
    )
    await expect(isPublishedDirectusAsset(missingId)).resolves.toBe(false)

    expect(requestItems).toHaveBeenCalledTimes(14)
  })

  it.each(['text/html; charset=utf-8', 'image/svg+xml', 'application/xhtml+xml', 'text/xml'])(
    'isolates active %s assets with a script-blocking opaque-origin policy',
    async (contentType) => {
      vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'content-secret')
      vi.stubEnv('DIRECTUS_URL', 'https://directus.test')
      __setDirectusRequesterForTests(async (collection) =>
        collection === 'news' ? [{ cover_image: publishedId }] : []
      )
      const fetchMock = vi.fn(
        async () =>
          new Response('<script>globalThis.compromised = true</script>', {
            headers: { 'content-type': contentType },
          })
      )

      const response = await fetchPublishedDirectusAsset(publishedId, new Headers(), fetchMock)

      expect(response.status).toBe(200)
      expect(response.headers.get('x-content-type-options')).toBe('nosniff')
      expect(response.headers.get('content-security-policy')).toContain('sandbox')
      expect(response.headers.get('content-security-policy')).toContain("default-src 'none'")
      expect(response.headers.get('content-security-policy')).not.toContain('allow-same-origin')
      expect(response.headers.get('content-security-policy')).not.toContain('allow-scripts')
    }
  )

  it.each(['image/png', 'application/pdf'])(
    'keeps safe %s bytes and delivery headers while applying the isolated asset policy',
    async (contentType) => {
      vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'content-secret')
      vi.stubEnv('DIRECTUS_URL', 'https://directus.test')
      __setDirectusRequesterForTests(async (collection) =>
        collection === 'news' ? [{ cover_image: publishedId }] : []
      )
      const fetchMock = vi.fn(
        async () =>
          new Response('safe asset', {
            headers: {
              'content-disposition': 'inline; filename="asset"',
              'content-type': contentType,
            },
          })
      )

      const response = await fetchPublishedDirectusAsset(publishedId, new Headers(), fetchMock)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-disposition')).toBe('inline; filename="asset"')
      expect(response.headers.get('content-security-policy')).toContain('sandbox')
      expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    }
  )

  it('applies the isolated policy to a 304 response without a content type', async () => {
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'content-secret')
    vi.stubEnv('DIRECTUS_URL', 'https://directus.test')
    __setDirectusRequesterForTests(async (collection) =>
      collection === 'news' ? [{ cover_image: publishedId }] : []
    )
    const response = await fetchPublishedDirectusAsset(
      publishedId,
      new Headers({ 'if-none-match': 'etag' }),
      async () => new Response(null, { status: 304, headers: { etag: 'etag' } })
    )

    expect(response.status).toBe(304)
    expect(response.headers.get('etag')).toBe('etag')
    expect(response.headers.get('content-security-policy')).toContain('sandbox')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  })
})
