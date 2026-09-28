import { afterEach, describe, expect, it, vi } from 'vitest'

import { translateCases } from '@/i18n/cases'
import { __setDirectusRequesterForTests, getCases } from '@/lib/directus'
import publishedCases from '../fixtures/cases.published.json'

const containsChinese = (value: string) => /[\u3400-\u9fff]/.test(value)

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
      stats: [],
      metrics: '',
    })
    expect(
      translated.every(
        ({ label, category, case_description, details, tags }) =>
          !containsChinese(`${label} ${category} ${case_description} ${details} ${tags.join(' ')}`)
      )
    ).toBe(true)
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
