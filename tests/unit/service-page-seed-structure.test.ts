import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'
import { APPROVED_SERVICE_PAGE_SEEDS } from '../../scripts/data/approved-cms-page-seeds.mjs'
import { createCmsSyncRuntime } from '../../scripts/lib/cms-sync-runtime.mjs'
import {
  planServicePageStructureRepair,
  repairServicePageStructure,
  SERVICE_PAGE_COLLECTION_PATH,
  SPECIALTY_SERVICE_PAGE_SLUGS,
  STRUCTURE_FIELDS,
} from '../../scripts/lib/service-page-structure-sync.mjs'
import { parseServiceProps, parseVariable } from '../../scripts/lib/source-seed-extractor.mjs'

const root = resolve(import.meta.dirname, '../..')
const read = (file: string) => readFileSync(resolve(root, file), 'utf8')

const specialtySlugs = parseVariable(
  read('src/data/navigation.ts'),
  'navigation.ts',
  'SPECIALTY_LINKS'
).map(({ href }: { href: string }) => href.slice(1))

const approvedTargetSeeds = APPROVED_SERVICE_PAGE_SEEDS.filter(({ slug }) =>
  SPECIALTY_SERVICE_PAGE_SLUGS.includes(slug)
)

describe('specialty service-page structure seeds', () => {
  it('reads service pages with their supported slug sort rather than the generic sort field', () => {
    expect(SERVICE_PAGE_COLLECTION_PATH).toBe('/items/service_pages?limit=-1&sort=slug')
  })

  it('preserves the exact dropdown-page stats and features from source pages', () => {
    expect(SPECIALTY_SERVICE_PAGE_SLUGS).toEqual(specialtySlugs)
    expect(approvedTargetSeeds).toHaveLength(9)

    for (const seed of approvedTargetSeeds) {
      const source = parseServiceProps(read(`src/pages/${seed.slug}.astro`), `${seed.slug}.astro`)
      expect(seed.stats).toEqual(source.stats)
      expect(seed.features).toEqual(source.features)
      expect(seed.stats).toHaveLength(4)
      expect(seed.features).toHaveLength(6)
    }
  })

  it('keeps the approved cache-busting image paths for every dropdown page', () => {
    expect(
      Object.fromEntries(approvedTargetSeeds.map(({ slug, img_src }) => [slug, img_src]))
    ).toEqual({
      'xiefu-yuncang': '/w-footwear-cloud.webp',
      'tuihuo-zhijian': '/w-return-inspection.webp',
      'houzheng-xiufu': '/w-post-processing.webp',
      'kuajing-yuncang': '/w-crossborder-cloud-hero.webp',
      'zhibo-cangpei': '/w-live-commerce.webp',
      'b2b-mendian-cangpei': '/w-b2b-store-hero.webp',
      'huadong-xiefu-yuncang': '/w-hq.webp',
      'huanan-xiefu-yuncang': '/w-hanging1.webp',
      'guangzhou-xiefu-yuncang': '/index.webp',
    })
  })

  it('plans and patches only the three approved structure fields', async () => {
    const records = approvedTargetSeeds.map((target, index) => ({
      id: index + 1,
      ...target,
      stats: [],
      features: [],
      img_src: '/stale-image.webp',
      title: `preserve-${index}`,
    }))
    const runtime = {
      patchRecord: vi.fn(async (_collection, current, target, fields) => ({
        ...current,
        ...Object.fromEntries(fields.map((field: string) => [field, target[field]])),
      })),
    }

    await repairServicePageStructure({
      records,
      seeds: APPROVED_SERVICE_PAGE_SEEDS,
      runtime,
    })

    expect(runtime.patchRecord).toHaveBeenCalledTimes(9)
    expect(runtime.patchRecord).toHaveBeenCalledWith(
      'service_pages',
      expect.objectContaining({ id: 9 }),
      expect.objectContaining({ slug: 'xiefu-yuncang' }),
      STRUCTURE_FIELDS
    )
    expect(records.every((record) => record.title.startsWith('preserve-'))).toBe(true)
  })

  it('keeps dry-run repair plans free of CMS writes', async () => {
    const directus = {
      endpointLabel: 'cms.example.test',
      request: vi.fn(),
    }
    const runtime = createCmsSyncRuntime({ directus, apply: false })

    await repairServicePageStructure({
      records: approvedTargetSeeds.map((target, index) => ({
        id: index + 1,
        ...target,
        stats: [],
      })),
      seeds: APPROVED_SERVICE_PAGE_SEEDS,
      runtime,
    })

    expect(directus.request).not.toHaveBeenCalled()
    expect(runtime.getChangeCount()).toBe(9)
  })

  it.each([
    [
      'missing record',
      (records: Record<string, unknown>[]) => records.slice(1),
      /did not match exactly once/,
    ],
    [
      'duplicate record',
      (records: Record<string, unknown>[]) => [...records, { ...records[0], id: 99 }],
      /did not match exactly once/,
    ],
  ])('fails closed on %s', (_name, mutate, error) => {
    const records = approvedTargetSeeds.map((target, index) => ({ id: index + 1, ...target }))
    expect(() =>
      planServicePageStructureRepair({
        records: mutate(records),
        seeds: APPROVED_SERVICE_PAGE_SEEDS,
      })
    ).toThrow(error)
  })

  it('fails closed when a target seed does not contain the complete structure', () => {
    const invalidSeeds = APPROVED_SERVICE_PAGE_SEEDS.map((seed) =>
      seed.slug === 'xiefu-yuncang' ? { ...seed, features: [] } : seed
    )
    expect(() =>
      planServicePageStructureRepair({
        records: approvedTargetSeeds.map((target, index) => ({ id: index + 1, ...target })),
        seeds: invalidSeeds,
      })
    ).toThrow(/xiefu-yuncang: expected exactly 6 features/)
  })

  it('fails closed rather than silently overriding an uploaded hero image', () => {
    const records = approvedTargetSeeds.map((target, index) => ({
      id: index + 1,
      ...target,
      hero_image: null as string | null,
    }))
    const xiefu = records.find(({ slug }) => slug === 'xiefu-yuncang')
    if (!xiefu) throw new Error('xiefu-yuncang test fixture missing')
    xiefu.hero_image = 'uploaded-hero-file-id'

    expect(() =>
      planServicePageStructureRepair({
        records,
        seeds: APPROVED_SERVICE_PAGE_SEEDS,
      })
    ).toThrow(/xiefu-yuncang: hero_image is set; review it before repairing img_src/)
  })

  it('fails closed when a target record is not published', () => {
    const records = approvedTargetSeeds.map((target, index) => ({ id: index + 1, ...target }))
    const xiefu = records.find(({ slug }) => slug === 'xiefu-yuncang')
    if (!xiefu) throw new Error('xiefu-yuncang test fixture missing')
    xiefu.status = 'draft'

    expect(() =>
      planServicePageStructureRepair({
        records,
        seeds: APPROVED_SERVICE_PAGE_SEEDS,
      })
    ).toThrow(/xiefu-yuncang: current record is not published/)
  })
})
