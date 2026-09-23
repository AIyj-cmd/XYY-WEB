import { readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('cache-safe image references', () => {
  it('uses the eight warehouse video segments as the product’s only media resources', () => {
    const page = readProjectFile('src/pages/product.astro')
    const sequence = readProjectFile('src/components/product/ProductVideoSequence.astro')
    const sections = readProjectFile('src/data/product/video-sections.ts')

    expect(page).not.toContain('warehouse-hanging-hero-')
    expect(page).not.toContain('warehouse-hanging-960.webp')
    expect(page).not.toContain('warehouse-product-1800.webp')
    expect(page).not.toContain('product-loader')
    expect(sequence.match(/\bdata-product-video(?=[\s=>])/g)).toHaveLength(1)
    expect(sequence).toContain('autoplay')
    expect(sequence).toContain('loop')
    expect(sequence).toContain('muted')
    expect(sequence).not.toMatch(/<video\b[^>]*\scontrols(?=[\s=>])/)
    expect(sections.match(/warehouse-sections-20260911\/.*\.mp4/g)).toHaveLength(6)
    expect(sections.match(/warehouse-sections-20260911\/.*\.jpg/g)).toHaveLength(6)
    expect(sections.match(/warehouse-services-20260913\/.*\.mp4/g)).toHaveLength(2)
    expect(sections.match(/warehouse-services-20260913\/.*\.jpg/g)).toHaveLength(2)
    expect(sections).not.toContain('07-dispatch')
  })

  it.each([
    ['kuajing-yuncang', '/w-crossborder-cloud-hero.webp'],
    ['b2b-mendian-cangpei', '/w-b2b-store-hero.webp'],
  ])('keeps the %s page and CMS seed on the same unique image URL', (slug, image) => {
    const page = readProjectFile(`src/pages/${slug}.astro`)
    const seeds = readProjectFile('scripts/data/approved-cms-page-seeds.mjs')

    expect(page).toContain(`imgSrc="${image}"`)
    expect(seeds).toContain(`img_src: '${image}'`)
  })

  it('uses a unique URL for the homepage return-inspection image', () => {
    expect(readProjectFile('src/data/home/assets.ts')).toContain(
      "svc1: '/w-home-return-inspection.webp'"
    )
  })

  it.each([
    'public/images/services/warehouse-product-1800.webp',
    'public/videos/warehouse-sections-20260911/01-overview-clean-20260921.mp4',
    'public/videos/warehouse-sections-20260911/01-overview-clean-20260921.jpg',
    'public/videos/warehouse-sections-20260911/02-storage.mp4',
    'public/videos/warehouse-sections-20260911/02-storage.jpg',
    'public/videos/warehouse-sections-20260911/03-picking.mp4',
    'public/videos/warehouse-sections-20260911/03-picking.jpg',
    'public/videos/warehouse-sections-20260911/04-inspection.mp4',
    'public/videos/warehouse-sections-20260911/04-inspection.jpg',
    'public/videos/warehouse-sections-20260911/05-refurbishment.mp4',
    'public/videos/warehouse-sections-20260911/05-refurbishment.jpg',
    'public/videos/warehouse-sections-20260911/06-packing.mp4',
    'public/videos/warehouse-sections-20260911/06-packing.jpg',
    'public/videos/warehouse-services-20260913/outbound-loading.mp4',
    'public/videos/warehouse-services-20260913/outbound-loading.jpg',
    'public/videos/warehouse-services-20260913/order-distribution.mp4',
    'public/videos/warehouse-services-20260913/order-distribution.jpg',
    'public/w-crossborder-cloud-hero.webp',
    'public/w-b2b-store-hero.webp',
    'public/w-home-return-inspection.webp',
  ])('ships non-empty cache-safe asset %s', (path) => {
    expect(statSync(new URL(`../../${path}`, import.meta.url)).size).toBeGreaterThan(0)
  })
})
