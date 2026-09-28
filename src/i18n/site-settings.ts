import { DEFAULT_SITE_SETTINGS } from '@/data/site-settings'
import { getSiteSettings } from '@/lib/directus'

const english = {
  footer_description:
    'Founded in 2011, XINYIYUAN has focused on apparel logistics for 15 years, supporting brands with warehousing, fulfilment, quality inspection and returns operations in China.',
  headquarters_label: 'Guangzhou headquarters',
  headquarters_address: 'No. 2, Guoyuan 1st Road, Huangpu District, Guangzhou, Guangdong, China',
}

export async function getEnglishSiteSettings(): Promise<typeof DEFAULT_SITE_SETTINGS> {
  const settings = await getSiteSettings(DEFAULT_SITE_SETTINGS)
  const translate = (field: keyof typeof english) => {
    if (settings[field] === DEFAULT_SITE_SETTINGS[field]) return english[field]
    console.warn(`[i18n:site-settings] omitted ${field}: stale-or-missing-source`)
    return ''
  }

  return {
    ...settings,
    footer_description: translate('footer_description'),
    headquarters_label: translate('headquarters_label'),
    headquarters_address: translate('headquarters_address'),
  }
}
