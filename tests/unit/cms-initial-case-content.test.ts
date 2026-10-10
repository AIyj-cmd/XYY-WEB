import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CASE_DETAILS } from '@/data/brand/case-details'
import { translateCases } from '@/i18n/cases'
import {
  INITIAL_CASE_SOURCE_DIGESTS,
  PUBLISHED_CASE_SOURCE_DIGESTS,
  reviewedCaseSourceDigest,
} from '@/i18n/case-sources'
import { __setDirectusRequesterForTests, getCases, type Case } from '@/lib/directus'
import { APPROVED_CASE_SEEDS } from '../../scripts/data/approved-case-seeds.mjs'
import { APPROVED_UNIFIED_CASE_SEEDS } from '../../scripts/data/approved-cms-page-seeds.mjs'
import publishedCases from '../fixtures/cases.published.json'

const root = resolve(import.meta.dirname, '../..')
const expectedSlugs = ['ur', 'maxrieny', 'xingmian', 'meiyi', 'romi-studio', 'inman']
const initialCases: Case[] = APPROVED_UNIFIED_CASE_SEEDS.map((seed, index) => ({
  ...seed,
  id: index + 1,
  status: 'published',
}))

async function resolveInitialCases() {
  __setDirectusRequesterForTests(async () => structuredClone(initialCases))
  return getCases()
}

afterEach(() => {
  __setDirectusRequesterForTests(null)
  vi.restoreAllMocks()
})

describe('reviewed initial CMS case content', () => {
  it('uses all six existing local covers without changing other approved seed fields', () => {
    expect(initialCases.map(({ slug }) => slug)).toEqual(expectedSlugs)
    for (const [index, seed] of APPROVED_UNIFIED_CASE_SEEDS.entries()) {
      const approved = APPROVED_CASE_SEEDS[index]
      const detail = CASE_DETAILS[approved.label as keyof typeof CASE_DETAILS]
      expect(seed).toEqual({
        ...approved,
        slug: detail.slug,
        name: detail.name,
        full_name: detail.fullName,
        accent: detail.accent,
        case_description: detail.description,
        stats: detail.stats,
        img: detail.image,
      })
      expect(seed.img).toBe(`/images/cases/${seed.slug}.webp`)
      expect(statSync(resolve(root, 'public', seed.img.slice(1))).isFile()).toBe(true)
    }
  })

  it('keeps all six initial cases visible in English after the real CMS resolver', async () => {
    const normalized = await resolveInitialCases()
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(normalized.map(({ details }) => details)).toEqual(
      normalized.map(({ case_description }) => case_description)
    )
    expect(normalized[0].metrics).toBe('总库存量 260万+件 · SKU 数量 13万+ · 仓库面积 10万+㎡')
    expect(
      Object.fromEntries(normalized.map((item) => [item.slug, reviewedCaseSourceDigest(item)]))
    ).toEqual(INITIAL_CASE_SOURCE_DIGESTS)

    for (const pageScope of ['home', 'cases', 'llms'] as const) {
      const translated = translateCases(normalized, pageScope)
      expect(translated.map(({ slug }) => slug)).toEqual(expectedSlugs)
      expect(translated.map(({ img }) => img)).toEqual(initialCases.map(({ img }) => img))
      expect(translated.map(({ stats }) => stats?.length)).toEqual([8, 8, 7, 4, 3, 2])
      expect(
        translated.every(
          ({ label, category, details, metrics, stats, tags }) =>
            !/[\u3400-\u9fff]/.test(
              JSON.stringify({ label, category, details, metrics, stats, tags })
            )
        )
      ).toBe(true)
      expect(translated[5]).toMatchObject({
        label: 'Inman',
        category: 'Natural-fibre lifestyle apparel',
        case_description:
          'Inman is a natural-fibre lifestyle apparel brand with established online and offline operations. A shared inventory view supports coordinated fulfilment across sales channels.',
        stats: [
          { label: 'Inventory management', value: 'All-channel unified management', unit: '' },
          {
            label: 'Fulfilment capability',
            value: 'Synchronized multi-platform dispatch',
            unit: '',
          },
        ],
      })
    }
    expect(warning).not.toHaveBeenCalled()
  })

  it.each([
    ['slug', 'unreviewed-case'],
    ['category', '未审核分类'],
    ['label', '未审核品牌'],
    ['name', '未审核简称'],
    ['full_name', '未审核名称'],
    ['case_description', '未审核简介'],
    ['stats', [{ label: '未审核统计', value: '999', unit: '件' }]],
    ['metrics', '未审核指标'],
    ['details', '未审核详情'],
    ['tags', ['未审核标签']],
  ])('rejects changes to the protected %s field of every initial case', async (field, value) => {
    const normalized = await resolveInitialCases()
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const changed = normalized.map((item) => ({ ...item, [field]: value }))

    expect(translateCases(changed)).toEqual([])
    expect(warning).toHaveBeenCalledTimes(6)
  })

  it('preserves CMS asset and accent edits while retaining the reviewed English content', async () => {
    const assetId = '11111111-1111-4111-8111-111111111111'
    __setDirectusRequesterForTests(async () =>
      initialCases.map((item) => ({ ...item, image_file: assetId, accent: '#123456' }))
    )
    const translated = translateCases(await getCases())

    expect(translated).toHaveLength(6)
    expect(translated.every(({ img }) => img.endsWith(`/api/cms-assets/${assetId}`))).toBe(true)
    expect(translated.every(({ accent }) => accent === '#123456')).toBe(true)
  })

  it('preserves the exact published source bindings and their six translated records', async () => {
    expect(PUBLISHED_CASE_SOURCE_DIGESTS).toEqual({
      ur: '6e140d58c2520ba2ff93cd27a03f77fb231a7d1d185050f2954c2e653bcec93c',
      maxrieny: 'bd354f4aa0ac90dadbfa752ebe897532cb77b713e182ba404154bcd897c3fd6f',
      xingmian: '59193b0bd0c099464f50de2652753a66bfd1860df1f2da5b60825041ef84198b',
      meiyi: '27bdee7e30af025cdf3cfbfc5c09cc493ac7bcbc15d4439a17c53ba13dddb866',
      'romi-studio': 'db474d484cc4f7d62b78bb75a6469a8456ad32d716736848990d412b46e917eb',
      toyouth: 'c3303a968296a1d265e5fa2620f13012b5f884a0924b5b448893d28d39b86f55',
    })
    __setDirectusRequesterForTests(async () => structuredClone(publishedCases.data))
    const normalized = await getCases()

    expect(
      Object.fromEntries(normalized.map((item) => [item.slug, reviewedCaseSourceDigest(item)]))
    ).toEqual(PUBLISHED_CASE_SOURCE_DIGESTS)
    expect(translateCases(normalized).map(({ slug }) => slug)).toEqual([
      ...expectedSlugs.slice(0, 5),
      'toyouth',
    ])
  })

  it('checks repeated generation byte for byte without writing the current output', () => {
    const output = resolve(root, 'scripts/data/approved-cms-page-seeds.mjs')
    const baseline = readFileSync(output, 'utf8')
    const modifiedAt = statSync(output).mtimeMs
    for (let run = 0; run < 2; run += 1) {
      execFileSync(process.execPath, ['scripts/generate-cms-content-seeds.mjs', '--check'], {
        cwd: root,
      })
      expect(readFileSync(output, 'utf8')).toBe(baseline)
      expect(statSync(output).mtimeMs).toBe(modifiedAt)
    }
  })

  it.each([
    { args: ['--check'], mismatch: true, error: 'Generated CMS content is stale' },
    { args: ['--unknown'], mismatch: false, error: 'Usage:' },
    { args: ['--check', '--check'], mismatch: false, error: 'Usage:' },
  ])('rejects $args with mismatch=$mismatch without attempting output writes', (scenario) => {
    const output = resolve(root, 'scripts/data/approved-cms-page-seeds.mjs')
    const baseline = readFileSync(output, 'utf8')
    const modifiedAt = statSync(output).mtimeMs
    // An isolated process simulates a stale file and forbids every write before import.
    const runner = `
      import fs from 'node:fs';
      import { syncBuiltinESMExports } from 'node:module';
      const originalRead = fs.readFileSync;
      fs.readFileSync = (file, ...args) => {
        const value = originalRead(file, ...args);
        return ${scenario.mismatch} && file === ${JSON.stringify(output)} ? value + '\\n' : value;
      };
      fs.writeFileSync = () => { throw new Error('check_attempted_write'); };
      syncBuiltinESMExports();
      process.argv = [process.execPath, 'generator', ...${JSON.stringify(scenario.args)}];
      await import('./scripts/generate-cms-content-seeds.mjs');
    `
    const result = spawnSync(process.execPath, ['--input-type=module', '--eval', runner], {
      cwd: root,
      encoding: 'utf8',
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(scenario.error)
    expect(result.stderr).not.toContain('check_attempted_write')
    expect(readFileSync(output, 'utf8')).toBe(baseline)
    expect(statSync(output).mtimeMs).toBe(modifiedAt)
  })
})
