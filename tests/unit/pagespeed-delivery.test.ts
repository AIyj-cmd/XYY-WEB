import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createServer, type ServerResponse } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createStaticAssetCacheHeaders } from '../../server/static-asset-cache.mjs'
import astroConfig, { shouldInlineStylesheet } from '../../astro.config.mjs'

const express = createRequire(import.meta.url)('express')
const bytes = Buffer.from('a fixed generated image fixture')
const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 12)
const currentImage = `/media/seo-v1/index-w1920-${digest}.webp`
const oldImage = `/media/seo-v1/index-w768-${digest}.webp`
const shareImage = `/media/seo-v1/share-zh-CN-${digest}.png`
const wrongHashImage = '/media/seo-v1/index-w1280-000000000000.webp'
const paths = [
  currentImage,
  oldImage,
  wrongHashImage,
  `/media/seo-v1/nested/index-w1920-${digest}.webp`,
  `/uploads/index-w1920-${digest}.webp`,
  `/media/seo-v1/index-w1920-${digest}extra.webp`,
  `/media/seo-v1/index-w1920-${digest}.svg`,
  '/index.webp',
  '/fonts/test.woff2',
  '/paper.pdf',
  '/_astro/page.12345.js',
  shareImage,
]
const server = createServer()
let directory: string
let origin: string

beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'xyy-delivery-'))
  for (const path of paths) {
    const target = join(directory, path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, bytes)
  }
  const app = express()
  app.use(express.static(directory, { setHeaders: createStaticAssetCacheHeaders(directory) }))
  app.use((_req: unknown, res: ServerResponse) => {
    res.setHeader('Cache-Control', 'no-store')
    res.end('dynamic response')
  })
  server.on('request', app)
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing HTTP test address')
  origin = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  await new Promise<void>((done, reject) =>
    server.close((error) => (error ? reject(error) : done()))
  )
  await rm(directory, { recursive: true, force: true })
})

describe('generated image delivery', () => {
  it.each([currentImage, oldImage, shareImage, `${currentImage}?v=2`, `${oldImage}?legacy=1`])(
    'gives confirmed current and retained old image URLs immutable caching: %s',
    async (path) => {
      const response = await fetch(`${origin}${path}`)
      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
      expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes)
    }
  )

  it.each(paths.slice(2, 8))(
    'keeps unverified or ordinary images on seven days: %s',
    async (path) => {
      const response = await fetch(`${origin}${path}?looksHashed=${digest}`)
      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('public, max-age=604800')
      await response.arrayBuffer()
    }
  )

  it.each([
    ['/fonts/test.woff2', 'public, max-age=31536000'],
    ['/paper.pdf', 'public, max-age=0'],
    ['/_astro/page.12345.js', 'public, max-age=31536000, immutable'],
    ['/', 'no-store'],
    ['/api/example?image=123', 'no-store'],
  ])('preserves existing cache behavior for %s', async (path, cacheControl) => {
    const response = await fetch(`${origin}${path}`)
    expect(response.headers.get('cache-control')).toBe(cacheControl)
    await response.arrayBuffer()
  })

  it('revalidates a changed file instead of trusting a cached filename', async () => {
    const headers: Record<string, string> = {}
    const setHeaders = createStaticAssetCacheHeaders(directory)
    const response = { setHeader: (name: string, value: string) => (headers[name] = value) }
    const filePath = join(directory, currentImage)
    setHeaders(response, filePath, await stat(filePath))
    expect(headers['Cache-Control']).toContain('immutable')
    await writeFile(filePath, Buffer.from('changed bytes'))
    setHeaders(response, filePath, await stat(filePath))
    expect(headers['Cache-Control']).toBe('public, max-age=604800')
    await writeFile(filePath, bytes)
  })
})

describe('stylesheet-only inlining', () => {
  it('connects the bounded stylesheet policy to the actual build configuration', () => {
    expect(astroConfig.vite?.build?.assetsInlineLimit).toBe(shouldInlineStylesheet)
    expect(shouldInlineStylesheet('page.css', Buffer.alloc(8192))).toBe(true)
    expect(shouldInlineStylesheet('page.css', Buffer.alloc(8193))).toBe(false)
  })

  it.each(['page.js', 'page.mjs', 'page.js?type=style.css.js', 'page.svg', 'font.woff2'])(
    'keeps scripts and other assets external regardless of size: %s',
    (path) => expect(shouldInlineStylesheet(path, Buffer.alloc(1))).toBe(false)
  )
})

describe('native nginx candidate', () => {
  it('uses HTTP/2 consistently and stages HSTS only on the two named HTTPS hosts', async () => {
    const config = await readFile('deploy/production/web/nginx-56xyy-native.conf', 'utf8')
    expect(config.match(/listen 443 ssl http2(?: default_server)?;/g)).toHaveLength(3)
    expect(
      config.match(/add_header Strict-Transport-Security "max-age=604800" always;/g)
    ).toHaveLength(2)
    expect(config).not.toMatch(
      /add_header Strict-Transport-Security [^;]*(?:includeSubDomains|preload)/
    )
    expect(config).toContain('server 127.0.0.1:50031;')
    expect(config).toContain('proxy_pass http://127.0.0.1:8055;')
  })
})
