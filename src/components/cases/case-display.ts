import { CASE_DETAILS } from '@/lib/brand'
import type { Case } from '@/lib/directus'
import { localizedCasePath } from '@/i18n/case-routes'
import type { SiteLocale } from '@/i18n/routes'

type CaseStat = NonNullable<Case['stats']>[number]

export const getCasePath = (item: Case) => {
  const mappedSlug = (CASE_DETAILS as Record<string, { slug: string }>)[item.label]?.slug
  const slug = item.slug?.trim() || mappedSlug
  return slug ? `/cases/${slug}` : null
}

export const getLocalizedCasePath = (item: Case, locale: SiteLocale) =>
  locale === 'en' ? localizedCasePath(item, locale) : getCasePath(item)

export const getCaseDescription = (item: Case) =>
  item.case_description?.trim() || item.details.trim()

export const getCaseStats = (item: Case, limit: number): CaseStat[] =>
  (item.stats ?? [])
    .filter((stat) => stat.label.trim().length > 0 && stat.value.trim().length > 0)
    .slice(0, limit)
