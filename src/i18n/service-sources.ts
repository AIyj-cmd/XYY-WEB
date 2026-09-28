import type { FaqItem, FeatureItem, StatItem } from '@/data/service'
import type { ServicePageContent } from '@/lib/directus-content-queries'

export interface EnglishServiceSource {
  source: ServicePageContent
  english: ServicePageContent
  sourceFaqs: FaqItem[]
  englishFaqs: FaqItem[]
}

const blankContent = (): ServicePageContent => ({
  title: '',
  description: '',
  breadcrumbLabel: '',
  eyebrow: '',
  h1: '',
  h1sub: '',
  heroDesc: '',
  imgSrc: '',
  imgAlt: '',
  contentDesc: '',
  featuresLabel: '',
  stats: [],
  features: [],
})

const same = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => same(value, right[index]))
    )
  }
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const leftRecord = left as Record<string, unknown>
    const rightRecord = right as Record<string, unknown>
    const keys = Object.keys(leftRecord)
    return (
      keys.length === Object.keys(rightRecord).length &&
      keys.every(
        (key) => Object.hasOwn(rightRecord, key) && same(leftRecord[key], rightRecord[key])
      )
    )
  }
  return false
}

export function translateReviewedService(
  catalog: EnglishServiceSource,
  content: ServicePageContent,
  faqs: FaqItem[]
) {
  const contentMatches = same(content, catalog.source)
  if (
    !contentMatches &&
    Object.values(content).some((value) => (Array.isArray(value) ? value.length : value))
  ) {
    console.warn('[english-service] omitted unreviewed service content')
  }
  const translatedFaqs = faqs.filter((faq) =>
    catalog.sourceFaqs.some((source) => same(source, faq))
  )
  if (translatedFaqs.length !== faqs.length)
    console.warn('[english-service] omitted unreviewed FAQ content')
  return {
    content: contentMatches ? catalog.english : blankContent(),
    faqs: translatedFaqs.map(
      (faq) => catalog.englishFaqs[catalog.sourceFaqs.findIndex((source) => same(source, faq))]
    ),
  }
}

export const sourceContent = (
  fields: Omit<ServicePageContent, 'stats' | 'features'>,
  stats: readonly StatItem[],
  features: FeatureItem[]
): ServicePageContent => ({ ...fields, stats, features })
