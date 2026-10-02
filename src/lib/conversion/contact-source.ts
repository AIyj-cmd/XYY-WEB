import type { SiteLocale } from '@/i18n/routes'

export const CONVERSION_ENTRIES = ['hero', 'bottom', 'floating', 'body'] as const
export const CONVERSION_SERVICES = [
  'cloud-warehouse',
  'quality-inspection',
  'logistics-cloud',
] as const

export type ConversionEntry = (typeof CONVERSION_ENTRIES)[number]
export type ConversionService = (typeof CONVERSION_SERVICES)[number]

export const SERVICE_FINDER_NEEDS = [
  'ecommerce-fulfilment',
  'store-replenishment',
  'returns-inspection',
  'garment-care',
  'livestream-fulfilment',
] as const
export const SERVICE_FINDER_REGIONS = ['any', 'east-china', 'south-china'] as const

export type ServiceFinderNeed = (typeof SERVICE_FINDER_NEEDS)[number]
export type ServiceFinderRegion = (typeof SERVICE_FINDER_REGIONS)[number]

export type ServiceFinderContext = {
  need: ServiceFinderNeed
  region: ServiceFinderRegion
  service: ConversionService
}

type ConversionSource = {
  service: ConversionService
  locale: SiteLocale
}

const conversionSources = new Map<string, ConversionSource>([
  ['/xiefu-yuncang', { service: 'cloud-warehouse', locale: 'zh-CN' }],
  ['/huadong-xiefu-yuncang', { service: 'cloud-warehouse', locale: 'zh-CN' }],
  ['/kuajing-yuncang', { service: 'cloud-warehouse', locale: 'zh-CN' }],
  ['/huanan-xiefu-yuncang', { service: 'cloud-warehouse', locale: 'zh-CN' }],
  ['/zhibo-cangpei', { service: 'cloud-warehouse', locale: 'zh-CN' }],
  ['/b2b-mendian-cangpei', { service: 'cloud-warehouse', locale: 'zh-CN' }],
  ['/tuihuo-zhijian', { service: 'quality-inspection', locale: 'zh-CN' }],
  ['/houzheng-xiufu', { service: 'quality-inspection', locale: 'zh-CN' }],
  ['/wuliu-shuzihua', { service: 'logistics-cloud', locale: 'zh-CN' }],
  ['/yundao-zhineng-jijian', { service: 'logistics-cloud', locale: 'zh-CN' }],
  ['/en/apparel-fulfillment', { service: 'cloud-warehouse', locale: 'en' }],
  ['/en/returns-inspection', { service: 'quality-inspection', locale: 'en' }],
  ['/en/garment-care', { service: 'quality-inspection', locale: 'en' }],
  ['/en/retail-distribution', { service: 'cloud-warehouse', locale: 'en' }],
  ['/en/digital-operations', { service: 'logistics-cloud', locale: 'en' }],
  ['/en/smart-shipping', { service: 'logistics-cloud', locale: 'en' }],
])

export type ConversionContext = {
  sourcePath: string
  entry: ConversionEntry
  service: ConversionService
  locale: SiteLocale
}

export function getConversionSource(pathname: string) {
  const source = conversionSources.get(pathname)
  return source ? { pathname, ...source } : null
}

export function isConversionEntry(value: unknown): value is ConversionEntry {
  return typeof value === 'string' && (CONVERSION_ENTRIES as readonly string[]).includes(value)
}

export function isConversionService(value: unknown): value is ConversionService {
  return typeof value === 'string' && (CONVERSION_SERVICES as readonly string[]).includes(value)
}

export function isServiceFinderNeed(value: unknown): value is ServiceFinderNeed {
  return typeof value === 'string' && (SERVICE_FINDER_NEEDS as readonly string[]).includes(value)
}

export function isServiceFinderRegion(value: unknown): value is ServiceFinderRegion {
  return typeof value === 'string' && (SERVICE_FINDER_REGIONS as readonly string[]).includes(value)
}

export function getConversionContext(url: URL): ConversionContext | null {
  const from = url.searchParams.getAll('from')
  const entry = url.searchParams.getAll('entry')
  if (from.length !== 1 || entry.length !== 1 || !isConversionEntry(entry[0])) return null

  const source = getConversionSource(from[0])
  if (!source) return null

  return {
    sourcePath: source.pathname,
    entry: entry[0],
    service: source.service,
    locale: source.locale,
  }
}

const finderServices: Record<ServiceFinderNeed, ConversionService> = {
  'ecommerce-fulfilment': 'cloud-warehouse',
  'store-replenishment': 'cloud-warehouse',
  'returns-inspection': 'quality-inspection',
  'garment-care': 'quality-inspection',
  'livestream-fulfilment': 'cloud-warehouse',
}

export function getServiceFinderContext(url: URL): ServiceFinderContext | null {
  const need = url.searchParams.getAll('need')
  const region = url.searchParams.getAll('region')
  if (
    need.length !== 1 ||
    region.length !== 1 ||
    !isServiceFinderNeed(need[0]) ||
    !isServiceFinderRegion(region[0])
  ) {
    return null
  }

  return { need: need[0], region: region[0], service: finderServices[need[0]] }
}

export function getRecommendedContactService(url: URL): ConversionService | null {
  const conversion = getConversionContext(url)
  const finder = getServiceFinderContext(url)
  if (conversion && finder && conversion.service !== finder.service) return null
  return finder?.service ?? conversion?.service ?? null
}

const caseSlugPattern = /^[a-z0-9][a-z0-9-]{0,79}$/

export function getCaseContactKey(url: URL) {
  const values = url.searchParams.getAll('case')
  if (values.length !== 1 || !caseSlugPattern.test(values[0])) return null
  return values[0]
}

export function contactHref(pathname: string, locale: SiteLocale, entry: ConversionEntry) {
  const source = getConversionSource(pathname)
  const contactPath = locale === 'en' ? '/en/contact' : '/contact'
  if (!source) return contactPath

  const params = new URLSearchParams({ from: source.pathname, entry })
  return `${contactPath}?${params}#contact-form`
}

export function caseContactHref(caseSlug: string, locale: SiteLocale) {
  const contactPath = locale === 'en' ? '/en/contact' : '/contact'
  return `${contactPath}?${new URLSearchParams({ case: caseSlug })}#contact-form`
}

export function contactLanguageHref(url: URL, locale: SiteLocale) {
  const contactPath = locale === 'en' ? '/en/contact' : '/contact'
  const context = getConversionContext(url)
  const finder = getServiceFinderContext(url)
  const caseKey = getCaseContactKey(url)
  const params = new URLSearchParams()

  if (context) {
    params.set('from', context.sourcePath)
    params.set('entry', context.entry)
  }
  if (finder) {
    params.set('need', finder.need)
    params.set('region', finder.region)
  }
  if (caseKey) params.set('case', caseKey)
  if (!params.size) return contactPath

  return `${contactPath}?${params}#contact-form`
}

export function isContactPath(pathname: string) {
  return pathname === '/contact' || pathname === '/en/contact'
}
