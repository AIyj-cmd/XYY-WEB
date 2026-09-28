import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SITE_SETTINGS } from '@/data/site-settings'
import { __setDirectusRequesterForTests } from '@/lib/directus'
import { getEnglishSiteSettings } from '@/i18n/site-settings'

const publishedSettings = (overrides = {}) => ({
  id: 1,
  status: 'published' as const,
  key: 'site',
  ...DEFAULT_SITE_SETTINGS,
  ...overrides,
})

afterEach(() => {
  __setDirectusRequesterForTests(null)
  vi.restoreAllMocks()
})

describe('English site settings', () => {
  it('translates only the reviewed fallback text while retaining current CMS phone and ICP values', async () => {
    __setDirectusRequesterForTests(async () =>
      publishedSettings({ phone: '400-0000-0000', icp: 'ICP-test' })
    )

    await expect(getEnglishSiteSettings()).resolves.toMatchObject({
      phone: '400-0000-0000',
      icp: 'ICP-test',
      headquarters_label: 'Guangzhou headquarters',
      headquarters_address:
        'No. 2, Guoyuan 1st Road, Huangpu District, Guangzhou, Guangdong, China',
    })
  })

  it('does not invent English replacements when published source text is changed or empty', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    __setDirectusRequesterForTests(async () =>
      publishedSettings({ footer_description: 'changed', headquarters_address: '' })
    )

    await expect(getEnglishSiteSettings()).resolves.toMatchObject({
      footer_description: '',
      headquarters_address: '',
      headquarters_label: 'Guangzhou headquarters',
    })
    expect(warning).toHaveBeenCalledTimes(2)
  })
})
