import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import manifest from '@/data/site-images.json'
import { caseImage, siteImage } from '@/lib/site-images'

const readAsset = (path: string) => readFile(resolve('public', `.${path}`))
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')

describe('reviewed display images', () => {
  it('preserves arbitrary CMS URLs without substituting unrelated local pictures', () => {
    for (const source of ['/api/cms-assets/new-id', 'https://cdn.example/image.jpg', 'toString']) {
      expect(siteImage(source, '100vw')).toEqual({ src: source })
      expect(caseImage(source)).toEqual({ src: source })
    }
  })

  it('supplies a responsive source set without changing the original aspect ratio', () => {
    const image = siteImage('/index.webp', '100vw')
    expect(image.srcset).toContain('768w')
    expect(image.srcset).toContain('1920w')
    expect(image.sizes).toBe('100vw')
    expect(image.width! / image.height!).toBe(16 / 9)
    expect(caseImage('/images/cases/ur.webp').sizes).toContain('816px')
  })

  it('keeps all originals intact and every generated image decodable, smaller and correctly sized', async () => {
    expect(Object.keys(manifest.images)).toHaveLength(16)
    for (const [source, image] of Object.entries(manifest.images)) {
      expect(hash(await readAsset(source)), source).toBe(image.originalSha256)
      for (const variant of image.variants) {
        const bytes = await readAsset(variant.src)
        const metadata = await sharp(bytes).metadata()
        expect(hash(bytes), variant.src).toBe(variant.sha256)
        expect(metadata.width).toBe(variant.width)
        expect(metadata.height).toBe(variant.height)
        expect(variant.width).toBeLessThanOrEqual(image.width)
        expect(
          Math.abs(variant.height - (variant.width * image.height) / image.width)
        ).toBeLessThan(1)
        expect(bytes.length, variant.src).toBeLessThan(image.originalBytes)
      }
    }
  })

  it('preserves QR pixels with lossless encoding', async () => {
    const source = '/images/social/wechat-official-account.jpg'
    const variant = manifest.images[source].variants[0]
    const original = await sharp(await readAsset(source))
      .raw()
      .toBuffer()
    const optimized = await sharp(await readAsset(variant.src))
      .raw()
      .toBuffer()
    expect(optimized.equals(original)).toBe(true)
  })
})
