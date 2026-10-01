import type { SiteLocale } from '@/i18n/routes'

export const CONVERSION_ENTRIES = ['hero', 'bottom', 'floating', 'body'] as const
export const CONVERSION_SERVICES = [
  'cloud-warehouse',
  'quality-inspection',
  'logistics-cloud',
] as const

export type ConversionEntry = (typeof CONVERSION_ENTRIES)[number]
export type ConversionService = (typeof CONVERSION_SERVICES)[number]

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

export function contactHref(pathname: string, locale: SiteLocale, entry: ConversionEntry) {
  const source = getConversionSource(pathname)
  const contactPath = locale === 'en' ? '/en/contact' : '/contact'
  if (!source) return contactPath

  const params = new URLSearchParams({ from: source.pathname, entry })
  return `${contactPath}?${params}#contact-form`
}

export function contactLanguageHref(url: URL, locale: SiteLocale) {
  const contactPath = locale === 'en' ? '/en/contact' : '/contact'
  const context = getConversionContext(url)
  if (!context) return contactPath

  const params = new URLSearchParams({ from: context.sourcePath, entry: context.entry })
  return `${contactPath}?${params}#contact-form`
}

export function isContactPath(pathname: string) {
  return pathname === '/contact' || pathname === '/en/contact'
}
