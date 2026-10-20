import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it, vi } from 'vitest'
import manifest from '@/data/site-images.json'
import { shareImage } from '@/lib/site-images'

vi.mock('@/lib/directus', () => ({
  getCases: vi.fn(async () => []),
  getPublishedNews: vi.fn(async () => [
    { slug: 'reviewed-article', published_at: '2026-10-18T08:00:00.000Z' },
  ]),
  getPublishedEnglishNews: vi.fn(async () => [
    { slug: 'reviewed-english', published_at: '2026-10-19T08:00:00.000Z' },
  ]),
}))

describe('sharing metadata and sitemap dates', () => {
  it('declares real default card dimensions and chooses the page language', async () => {
    for (const locale of ['zh-CN', 'en'] as const) {
      const image = shareImage(undefined, locale)
      const bytes = await readFile(resolve('public', `.${manifest.shareCards[locale].src}`))
      const metadata = await sharp(bytes).metadata()
      expect(image.src).toContain(manifest.shareCards[locale].src)
      expect(metadata.format).toBe('png')
      expect([metadata.width, metadata.height]).toEqual([1200, 630])
      expect([image.width, image.height]).toEqual([metadata.width, metadata.height])
    }
    expect(shareImage(undefined, 'zh-CN').src).not.toBe(shareImage(undefined, 'en').src)
  })

  it('does not invent dimensions for custom CMS and case covers', () => {
    for (const source of ['/images/cases/ur.webp', 'https://cdn.example/portrait.jpg']) {
      expect(shareImage(source, 'en')).toEqual({ src: source, width: undefined, height: undefined })
    }
  })

  it('omits unverified static dates while retaining article publication dates and whitepaper URLs', async () => {
    const { GET } = await import('@/pages/sitemap.xml')
    const response = await GET({} as Parameters<typeof GET>[0])
    const xml = await response.text()
    expect(xml).not.toContain('2026-08-08')
    expect(xml.match(/<lastmod>/g)).toHaveLength(2)
    expect(xml).toContain('<lastmod>2026-10-18</lastmod>')
    expect(xml).toContain('<lastmod>2026-10-19</lastmod>')
    expect(xml).toContain('/supply-chain-whitepapers/14/</loc>')
    expect(xml).toContain('/en/supply-chain-whitepapers</loc>')
  })
})
