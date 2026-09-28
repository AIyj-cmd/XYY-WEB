export type SiteLocale = 'zh-CN' | 'en'

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
  ['/contact', '/en/contact'],
  ['/privacy', '/en/privacy'],
] as const

export const englishPathFor = (path: string) =>
  ENGLISH_ROUTES.find(([zh]) => zh === path)?.[1] ?? '/en'

export const chinesePathFor = (path: string) =>
  ENGLISH_ROUTES.find(([, en]) => en === path)?.[0] ?? '/'

export const ENGLISH_NAVIGATION = [
  { href: '/en', label: 'Home' },
  { href: '/en/services', label: 'Services' },
  { href: '/en/cases', label: 'Cases' },
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
  return pathname === href
}
