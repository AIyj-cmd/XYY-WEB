import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __resetDirectusAssetCacheForTests,
  fetchPublishedDirectusAsset,
} from '@/lib/directus-assets'
import { __setDirectusRequesterForTests } from '@/lib/directus'

const firstId = '11111111-1111-4111-8111-111111111111'
const secondId = '22222222-2222-4222-8222-222222222222'

describe('published Directus asset cancellation', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    __setDirectusRequesterForTests(null)
    __resetDirectusAssetCacheForTests()
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'content-secret')
    vi.stubEnv('DIRECTUS_URL', 'https://directus.test')
  })

  it('does not start reference or asset work for a pre-aborted client request', async () => {
    const controller = new AbortController()
    const requestItems = vi.fn()
    const fetchMock = vi.fn()
    controller.abort(new Error('client disconnected'))
    __setDirectusRequesterForTests(requestItems)

    await expect(
      fetchPublishedDirectusAsset(firstId, new Headers(), fetchMock, controller.signal)
    ).rejects.toThrow('client disconnected')

    expect(requestItems).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('forwards client cancellation to the upstream asset fetch', async () => {
    const controller = new AbortController()
    __setDirectusRequesterForTests(async (collection) =>
      collection === 'news' ? [{ cover_image: firstId }] : []
    )
    const fetchMock = vi.fn(
      async (_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
        })
    )
    const pending = fetchPublishedDirectusAsset(
      firstId,
      new Headers(),
      fetchMock,
      controller.signal
    )

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    controller.abort(new Error('client disconnected'))

    await expect(pending).rejects.toThrow('client disconnected')
    expect(fetchMock).toHaveBeenCalledWith(
      `https://directus.test/assets/${firstId}`,
      expect.objectContaining({ signal: controller.signal })
    )
  })

  it('leaves an upstream response body bound to the client cancellation signal', async () => {
    const controller = new AbortController()
    __setDirectusRequesterForTests(async (collection) =>
      collection === 'news' ? [{ cover_image: firstId }] : []
    )
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const body = new ReadableStream<Uint8Array>({
        start(streamController) {
          init?.signal?.addEventListener(
            'abort',
            () => streamController.error(init.signal?.reason),
            { once: true }
          )
        },
      })
      return new Response(body, { headers: { 'content-type': 'image/png' } })
    })

    const response = await fetchPublishedDirectusAsset(
      firstId,
      new Headers(),
      fetchMock,
      controller.signal
    )
    const reading = response.text()
    controller.abort(new Error('client disconnected during body'))

    await expect(reading).rejects.toThrow('client disconnected during body')
  })

  it('does not cancel a concurrent request or the shared reference read', async () => {
    const cancelled = new AbortController()
    __setDirectusRequesterForTests(async (collection) =>
      collection === 'news' ? [{ cover_image: firstId }, { cover_image: secondId }] : []
    )
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).endsWith(firstId)) {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
        })
      }
      return new Response('second asset', { headers: { 'content-type': 'image/png' } })
    })

    const first = fetchPublishedDirectusAsset(firstId, new Headers(), fetchMock, cancelled.signal)
    const second = fetchPublishedDirectusAsset(secondId, new Headers(), fetchMock)

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    cancelled.abort(new Error('first client disconnected'))

    await expect(first).rejects.toThrow('first client disconnected')
    await expect(second).resolves.toMatchObject({ status: 200 })
  })
})
