import { CASE_DETAILS } from '@/lib/brand'
import type { Case } from '@/lib/directus'

type CaseStat = NonNullable<Case['stats']>[number]

export const getCasePath = (item: Case) => {
  const mappedSlug = (CASE_DETAILS as Record<string, { slug: string }>)[item.label]?.slug
  const slug = item.slug?.trim() || mappedSlug
  return slug ? `/cases/${slug}` : null
}

export const getCaseDescription = (item: Case) =>
  item.case_description?.trim() || item.details.trim()

export const getCaseStats = (item: Case, limit: number): CaseStat[] =>
  (item.stats ?? [])
    .filter((stat) => stat.label.trim().length > 0 && stat.value.trim().length > 0)
    .slice(0, limit)
