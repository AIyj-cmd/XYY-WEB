import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const remotePath = resolve('node_modules/astro/dist/assets/build/remote.js')
const remote = await import(pathToFileURL(remotePath).href)
const imageUrl = 'https://images.test/synthetic.png'

function cachedImageHeaders(extra: Record<string, string> = {}) {
  return {
    date: new Date().toUTCString(),
    'cache-control': 'max-age=1, stale-while-revalidate=120, stale-if-error=120',
    ...extra,
  }
}

describe('Astro remote image cache consumer', () => {
  it('loads the local patched package and gives restricted image responses no TTL', async () => {
    expect(require('http-cache-semantics/package.json').version).toBe('4.2.0-xyy.1')

    const before = Date.now()
    const image = await remote.loadRemoteImage(
      imageUrl,
      async () =>
        new Response('image', {
          headers: cachedImageHeaders({ 'set-cookie': 'synthetic-private-cookie' }),
        })
    )

    expect(image.expires).toBeLessThanOrEqual(before + 100)
  })

  it('retains ordinary image caching and successful 304 revalidation', async () => {
    const ordinary = await remote.loadRemoteImage(
      imageUrl,
      async () =>
        new Response('image', {
          headers: { date: new Date().toUTCString(), 'cache-control': 'max-age=600' },
        })
    )
    const revalidated = await remote.revalidateRemoteImage(
      imageUrl,
      { etag: 'synthetic-etag' },
      async () => new Response(null, { status: 304, headers: { 'cache-control': 'max-age=600' } })
    )

    expect(ordinary.expires - Date.now()).toBeGreaterThan(500_000)
    expect(revalidated.data).toBeNull()
    expect(revalidated.etag).toBe('synthetic-etag')
    expect(revalidated.expires - Date.now()).toBeGreaterThan(500_000)
  })
})
