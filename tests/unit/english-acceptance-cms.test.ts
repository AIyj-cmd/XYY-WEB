import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CASE_FALLBACKS } from '@/data/cases'
import { HOME_FAQS, HOME_SERVICE_FALLBACKS, HOME_STATS_FALLBACKS } from '@/data/home'
import { translateHomeServices, translateHomeStats } from '@/i18n/home-content'
import { translateCases } from '@/i18n/cases'
import { RETURNS_ENGLISH_SOURCE } from '@/i18n/service-sources-returns'
import { translateReviewedService } from '@/i18n/service-sources'
import {
  __setDirectusRequesterForTests,
  getAboutContent,
  getCases,
  getFaqs,
  getHomepageStats,
  getServices,
} from '@/lib/directus'

describe('English acceptance CMS semantics', () => {
  beforeEach(() => {
    __setDirectusRequesterForTests(null)
    vi.restoreAllMocks()
  })

  it('keeps successful empty CMS content empty instead of restoring translations', async () => {
    __setDirectusRequesterForTests(async () => [])

    await expect(getHomepageStats(HOME_STATS_FALLBACKS)).resolves.toEqual([])
    await expect(getServices(HOME_SERVICE_FALLBACKS)).resolves.toEqual([])
    await expect(getCases(CASE_FALLBACKS)).resolves.toEqual([])
    await expect(getFaqs('home', HOME_FAQS)).resolves.toEqual([])
    await expect(
      getAboutContent({ overview: 'reviewed fallback', heroDescription: 'reviewed fallback' })
    ).resolves.toEqual({ overview: '', heroDescription: '' })
  })

  it('allows only unavailable CMS reads to use the reviewed fallback', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    __setDirectusRequesterForTests(async () => {
      throw new Error('offline')
    })

    await expect(getServices(HOME_SERVICE_FALLBACKS)).resolves.toEqual(HOME_SERVICE_FALLBACKS)
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('reason=network'))
  })

  it.each([401, 403])('surfaces CMS authorization failure %s', async (status) => {
    __setDirectusRequesterForTests(async () => {
      throw Object.assign(new Error('forbidden'), { status })
    })

    await expect(getCases(CASE_FALLBACKS)).rejects.toThrow(`status=${status}`)
  })

  it('surfaces malformed CMS data rather than hiding a contract failure', async () => {
    __setDirectusRequesterForTests(async () => ({ data: 'not a collection' }))

    await expect(getCases(CASE_FALLBACKS)).rejects.toThrow('reason=invalid_data')
  })

  it('omits changed source snapshots from English output', () => {
    const staleService = { ...HOME_SERVICE_FALLBACKS[0], description: 'changed source' }
    const staleStat = { ...HOME_STATS_FALLBACKS[0], value: 'changed source' }
    const staleCase = { ...CASE_FALLBACKS[0], details: 'changed source' }
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(translateHomeServices([staleService])).toEqual([])
    expect(translateHomeStats([staleStat])).toEqual([])
    expect(translateCases([staleCase])).toEqual([])
    expect(
      translateReviewedService(
        RETURNS_ENGLISH_SOURCE,
        { ...RETURNS_ENGLISH_SOURCE.source, heroDesc: 'changed source' },
        RETURNS_ENGLISH_SOURCE.sourceFaqs
      ).content.h1
    ).toBe('')
    expect(warning).toHaveBeenCalled()
  })
})
