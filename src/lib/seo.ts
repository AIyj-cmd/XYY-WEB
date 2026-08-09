import { BRAND } from './brand'

export const ORGANIZATION_ID = `${BRAND.url}/#organization`

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

export function createServiceSchema(input: { name: string; description: string; path: string }) {
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
      name: BRAND.fullName,
    },
    areaServed: { '@type': 'Country', name: '中国' },
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
