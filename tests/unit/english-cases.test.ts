import { describe, expect, it, vi } from 'vitest'

import { CASE_FALLBACKS } from '@/data/cases'
import { CASE_FAQS } from '@/data/cases/faqs'
import { createEnglishHomeCaseDetails, translateCaseFaqs, translateCases } from '@/i18n/cases'

const containsChinese = (value: string) => /[\u3400-\u9fff]/.test(value)

describe('reviewed English case catalog', () => {
  it('localizes all six approved cases without exposing unreviewed operational metrics', () => {
    const cases = translateCases(CASE_FALLBACKS)

    expect(cases.map((item) => item.slug)).toEqual([
      'ur',
      'maxrieny',
      'xingmian',
      'meiyi',
      'romi-studio',
      'inman',
    ])
    for (const item of cases) {
      expect(item.stats).toEqual([])
      expect(item.metrics).toBe('')
      expect(
        containsChinese(`${item.label} ${item.category} ${item.details} ${item.tags.join(' ')}`)
      ).toBe(false)
    }
  })

  it('omits unknown or changed source records instead of translating stale content', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const changed = { ...CASE_FALLBACKS[0], details: 'changed' }
    const retired = { ...CASE_FALLBACKS[0], slug: 'toyouth' }

    expect(translateCases([changed, retired])).toEqual([])
    expect(warning).toHaveBeenCalledTimes(2)
    warning.mockRestore()
  })

  it('creates homepage details by stable slug from the already localized records', () => {
    const translated = translateCases(CASE_FALLBACKS)
    const details = createEnglishHomeCaseDetails(translated)

    expect(Object.keys(details)).toEqual(translated.map((item) => item.slug))
    expect(details.ur).toMatchObject({
      slug: 'ur',
      name: 'UR',
      category: 'Fast-fashion womenswear',
      stats: [],
    })
    expect(containsChinese(details.ur.description)).toBe(false)
  })

  it('requires both reviewed Chinese FAQ question and answer to match', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const translated = translateCaseFaqs()
    const changedAnswer = CASE_FAQS.map((item, index) =>
      index === 0 ? { ...item, a: 'changed' } : item
    )

    expect(translated).toHaveLength(CASE_FAQS.length)
    expect(translated.every((item) => !containsChinese(`${item.q} ${item.a}`))).toBe(true)
    expect(translateCaseFaqs(changedAnswer)).toHaveLength(CASE_FAQS.length - 1)
    expect(warning).toHaveBeenCalledOnce()
    warning.mockRestore()
  })

  it('keeps the same visible seven-question subset as the Chinese cases page', () => {
    const excludedQuestion = '合作一般需要多长时间才能"跑顺"？上线后要多久看到效果？'
    const visibleSourceFaqs = CASE_FAQS.filter(({ q }) => q !== excludedQuestion)

    expect(translateCaseFaqs(visibleSourceFaqs)).toHaveLength(7)
  })
})
