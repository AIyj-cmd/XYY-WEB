import type { ServicePageContent } from '@/lib/directus-content-queries'

export function hasRedesignContent(content: ServicePageContent, faqCount: number) {
  return Boolean(
    content.h1 ||
    content.h1sub ||
    content.heroDesc ||
    content.contentDesc ||
    content.features.length ||
    content.stats.length ||
    faqCount
  )
}
