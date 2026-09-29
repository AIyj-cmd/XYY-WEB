export type SiteLocale = 'zh-CN' | 'en'

export const normalizePath = (path: string) => path.replace(/\/$/, '') || '/'

export const ENGLISH_ROUTES = [
  ['/', '/en'],
  ['/about', '/en/about'],
  ['/product', '/en/services'],
  ['/xiefu-yuncang', '/en/apparel-fulfillment'],
  ['/tuihuo-zhijian', '/en/returns-inspection'],
  ['/houzheng-xiufu', '/en/garment-care'],
  ['/b2b-mendian-cangpei', '/en/retail-distribution'],
  ['/wuliu-shuzihua', '/en/digital-operations'],
  ['/yundao-zhineng-jijian', '/en/smart-shipping'],
  ['/cases', '/en/cases'],
  ['/news', '/en/news'],
  ['/supply-chain-whitepapers/', '/en/supply-chain-whitepapers'],
  ['/contact', '/en/contact'],
  ['/privacy', '/en/privacy'],
] as const

export const matchesLocalePath = (
  pair: readonly [string, string],
  locale: SiteLocale,
  pathname: string
) => normalizePath(pair[locale === 'en' ? 1 : 0]) === normalizePath(pathname)

export const findLocalePair = (pathname: string, locale: SiteLocale) =>
  ENGLISH_ROUTES.find((pair) => matchesLocalePath(pair, locale, pathname))

export const englishPathFor = (path: string) => findLocalePair(path, 'zh-CN')?.[1] ?? '/en'

export const chinesePathFor = (path: string) => findLocalePair(path, 'en')?.[0] ?? '/'

export const ENGLISH_NAVIGATION = [
  { href: '/en', label: 'Home' },
  { href: '/en/services', label: 'Services' },
  { href: '/en/cases', label: 'Cases' },
  { href: '/en/news', label: 'Insights' },
  { href: '/en/about', label: 'About' },
  { href: '/en/contact', label: 'Contact' },
] as const

export const ENGLISH_SERVICE_LINKS = [
  { href: '/en/apparel-fulfillment', label: 'Apparel fulfilment' },
  { href: '/en/returns-inspection', label: 'Returns inspection' },
  { href: '/en/garment-care', label: 'Garment care' },
  { href: '/en/retail-distribution', label: 'Retail distribution' },
] as const

const ENGLISH_SERVICE_PATHS = new Set([
  '/en/services',
  '/en/apparel-fulfillment',
  '/en/returns-inspection',
  '/en/garment-care',
  '/en/retail-distribution',
  '/en/digital-operations',
  '/en/smart-shipping',
])

export function isNavigationActive(href: string, pathname: string, locale: SiteLocale) {
  if (href === '/') return pathname === '/'
  if (href === '/en') return pathname === '/en'
  if (locale === 'en' && href === '/en/services') return ENGLISH_SERVICE_PATHS.has(pathname)
  if (locale === 'en' && href === '/en/cases')
    return pathname === href || pathname.startsWith('/en/cases/')
  if (locale === 'en' && href === '/en/news')
    return (
      pathname === href ||
      pathname.startsWith('/en/news/') ||
      pathname === '/en/supply-chain-whitepapers'
    )
  return pathname === href
}
