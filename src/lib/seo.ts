import { BRAND } from './brand'

export const ORGANIZATION_ID = `${BRAND.url}/#organization`

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: BRAND.name,
    legalName: BRAND.fullName,
    alternateName: [BRAND.shortName, BRAND.englishShortName, BRAND.englishName],
    url: BRAND.url,
    logo: `${BRAND.url}/logo.png`,
    description: BRAND.description,
    foundingDate: String(BRAND.founded),
    foundingLocation: { '@type': 'Place', name: BRAND.locations.south.city },
    telephone: [BRAND.phone.toll],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '果园一路2号',
      addressLocality: '广州市黄埔区',
      addressRegion: '广东省',
      addressCountry: 'CN',
    },
    areaServed: { '@type': 'Country', name: '中国' },
  }
}

export function absoluteUrl(pathname = '/') {
  return new URL(pathname, `${BRAND.url}/`).href
}

export function createBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}

export function createServiceSchema(input: {
  name: string
  description: string
  path: string
  providerName?: string
  countryName?: string
}) {
  const url = absoluteUrl(input.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: input.name,
    description: input.description,
    provider: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: input.providerName || BRAND.fullName,
    },
    areaServed: { '@type': 'Country', name: input.countryName || '中国' },
    url,
  }
}

export function createFaqSchema(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
