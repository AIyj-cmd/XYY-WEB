import { describe, expect, it, vi } from 'vitest'

import { ABOUT_FAQS, ABOUT_HISTORY } from '@/data/about'
import { HONORS, WAREHOUSES } from '@/lib/brand'
import { translateAboutWarehouses } from '@/i18n/about-catalog'
import {
  ABOUT_CONTENT_FALLBACK,
  translateAboutFaqs,
  translateAboutHistory,
  translateAboutHonors,
  translateAboutOverview,
} from '@/i18n/about-content'

describe('English About source adaptation', () => {
  it('translates each reviewed record while retaining the original media and stable grouping fields', () => {
    const honors = HONORS.map((title, index) => ({ title, image: `/about/honor/${index + 1}.jpg` }))
    const history = translateAboutHistory(ABOUT_HISTORY.map((item) => ({ ...item })))
    const warehouses = translateAboutWarehouses(WAREHOUSES.map((item) => ({ ...item })))
    const faqs = translateAboutFaqs(ABOUT_FAQS.map((item) => ({ ...item })))

    expect(translateAboutOverview(ABOUT_CONTENT_FALLBACK.overview)).toContain('Based in Guangzhou')
    expect(history).toHaveLength(ABOUT_HISTORY.length)
    expect(translateAboutHonors(honors)).toHaveLength(HONORS.length)
    expect(warehouses).toHaveLength(WAREHOUSES.length)
    expect(warehouses.find(({ id }) => id === 3)?.address).toBe('Address not published')
    expect(faqs).toHaveLength(ABOUT_FAQS.length)
  })

  it('omits stale source content and does not substitute generic English placeholders', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(translateAboutHistory([{ ...ABOUT_HISTORY[0], text: 'Changed by CMS' }])).toEqual([])
    expect(translateAboutWarehouses([{ ...WAREHOUSES[0], address: 'Changed by CMS' }])).toEqual([])
    expect(translateAboutFaqs([{ ...ABOUT_FAQS[0], a: 'Changed by CMS' }])).toEqual([])
    expect(warn).toHaveBeenCalledWith('[i18n:about] omitted history: history-team-founded')
    expect(warn).toHaveBeenCalledWith('[i18n:about] omitted warehouse: 1')
    expect(warn).toHaveBeenCalledWith('[i18n:about] omitted faq: unknown')
    warn.mockRestore()
  })
})
