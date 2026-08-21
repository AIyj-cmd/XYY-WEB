import { readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('cache-safe image references', () => {
  it('uses the uniquely named warehouse image for every product hero source', () => {
    const page = readProjectFile('src/pages/product.astro')

    expect(page).not.toContain('warehouse-hanging-hero-')
    expect(page).not.toContain('warehouse-hanging-960.webp')
    expect(page.match(/warehouse-product-1800\.webp/g)).toHaveLength(3)
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
    'public/w-crossborder-cloud-hero.webp',
    'public/w-b2b-store-hero.webp',
    'public/w-home-return-inspection.webp',
  ])('ships non-empty cache-safe asset %s', (path) => {
    expect(statSync(new URL(`../../${path}`, import.meta.url)).size).toBeGreaterThan(0)
  })
})
