import { afterEach, describe, expect, it, vi } from 'vitest'

import { translateCases } from '@/i18n/cases'
import { __setDirectusRequesterForTests, getCases } from '@/lib/directus'
import publishedCases from '../fixtures/cases.published.json'

const containsChinese = (value: string) => /[\u3400-\u9fff]/.test(value)

const expectedStats = {
  ur: [
    ['Total inventory', '2,600,000+', 'units'],
    ['SKU count', '130,000+', 'SKUs'],
    ['Warehouse area', '100,000+', 'sq m'],
    ['Average daily inbound', '60,000+', 'units/day'],
    ['Peak B2C', '100,000+', 'units/day'],
    ['Average daily B2C', '50,000+', 'units/day'],
    ['Average daily B2B', '20,000+', 'units/day'],
    ['Average daily returns', '30,000+', 'units/day'],
  ],
  maxrieny: [
    ['Total inventory', '900,000+', 'units'],
    ['SKU count', '17,000+', 'SKUs'],
    ['Warehouse area', '12,000+', 'sq m'],
    ['Average daily inbound', '20,000+', 'units/day'],
    ['Average daily B2C', '12,000+', 'units/day'],
    ['Peak B2C', '75,000+', 'units/day'],
    ['Average daily B2B', '11,000+', 'units/day'],
    ['Peak B2B', '60,000+', 'units/day'],
  ],
  xingmian: [
    ['Total inventory', '3,700,000+', 'units'],
    ['SKU count', '5,000+', 'SKUs'],
    ['Warehouse area', '25,000+', 'sq m'],
    ['Average daily inbound', '50,000+', 'units/day'],
    ['Average daily B2C', '60,000+', 'units/day'],
    ['Peak B2C', '100,000+', 'units/day'],
    ['Average daily returns', '15,000+', 'units/day'],
  ],
  meiyi: [
    ['Annual dispatch', '1,000,000–1,500,000', 'units/year'],
    ['Annual inspection', '1,200,000–2,000,000', 'units/year'],
    ['Annual putaway', '1,300,000–1,800,000', 'units/year'],
    ['Annual packing', '800,000–1,600,000', 'units/year'],
  ],
  'romi-studio': [
    ['Average daily outbound', '30,000+', 'units/day'],
    ['Fulfilment capability', 'Fast replenishment', ''],
    ['Livestream service', 'Creator sample dispatch', ''],
  ],
  toyouth: [
    ['Inventory management', 'All-channel', 'unified inventory pool'],
    ['Brand operations', 'Online and offline', 'integrated operations'],
  ],
} as const

afterEach(() => {
  __setDirectusRequesterForTests(null)
  vi.restoreAllMocks()
})

describe('English published case adaptation', () => {
  it('normalizes and translates the six published CMS cases in order', async () => {
    __setDirectusRequesterForTests(async () => publishedCases.data)

    const normalized = await getCases()
    const translated = translateCases(normalized)

    expect(translated.map(({ slug }) => slug)).toEqual([
      'ur',
      'maxrieny',
      'xingmian',
      'meiyi',
      'romi-studio',
      'toyouth',
    ])
    expect(translated.map(({ img }) => img)).toEqual(publishedCases.data.map(({ img }) => img))
    expect(normalized.map(({ details }) => details)).toEqual(
      normalized.map(({ case_description }) => case_description)
    )
    expect(translated.find(({ slug }) => slug === 'toyouth')).toMatchObject({
      label: 'TOYOUTH',
      category: 'Original designer womenswear',
      stats: expectedStats.toyouth.map(([label, value, unit]) => ({ label, value, unit })),
      metrics: 'Unified all-channel inventory management · Synchronized multi-platform dispatch',
    })
    expect(translated.find(({ slug }) => slug === 'ur')?.case_description).toBe(
      'UR is a leading Chinese fast-fashion womenswear brand. During a Tmall Super Brand Day, its official flagship store grew 116% year on year; in the mid-year promotion, it ranked first in womenswear across Tmall, Douyin and JD. It has 400+ stores globally, including in Singapore, Thailand and the Philippines.'
    )
    expect(
      translated.map(({ slug, stats }) => [
        slug,
        stats?.map(({ label, value, unit }) => [label, value, unit]),
      ])
    ).toEqual(
      Object.entries(expectedStats).map(([slug, stats]) => [
        slug,
        stats.map(([label, value, unit]) => [label, value, unit]),
      ])
    )
    expect(
      translated.every(
        ({ label, category, case_description, details, tags, metrics, stats }) =>
          !containsChinese(
            `${label} ${category} ${case_description} ${details} ${metrics} ${tags.join(' ')} ${stats?.map((stat) => `${stat.label} ${stat.value} ${stat.unit}`).join(' ')}`
          )
      )
    ).toBe(true)
  })

  it('resolves the same reviewed claims for home, cases and llms output', async () => {
    __setDirectusRequesterForTests(async () => publishedCases.data)
    const normalized = await getCases()

    for (const pageScope of ['home', 'cases', 'llms'] as const) {
      expect(translateCases(normalized, pageScope).map(({ stats }) => stats?.length)).toEqual([
        8, 8, 7, 4, 3, 2,
      ])
    }
  })

  it('keeps substantive source changes and unknown identities out of English output', async () => {
    __setDirectusRequesterForTests(async () => publishedCases.data)
    const normalized = await getCases()
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const changedTags = { ...normalized[0], tags: [...normalized[0].tags, 'changed'] }
    const changedStats = {
      ...normalized[0],
      stats: normalized[0].stats?.map((stat, index) =>
        index === 0 ? { ...stat, value: 'changed' } : stat
      ),
    }
    const unknown = { ...normalized[0], slug: 'unreviewed-case' }

    expect(translateCases([changedTags, changedStats, unknown])).toEqual([])
    expect(warning).toHaveBeenCalledTimes(3)
  })

  it('keeps successful empty CMS results empty', () => {
    expect(translateCases([])).toEqual([])
  })
})
