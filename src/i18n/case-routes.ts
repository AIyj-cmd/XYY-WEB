import type { Case } from '@/lib/directus'
import type { SiteLocale } from './routes'

export type LocalePair = readonly [zh: string, en: string]

/**
 * Call this only with a case already accepted by the locale-specific source adapter.
 * Keeping the pair construction here lets layouts avoid inventing a route for an
 * unreviewed CMS record.
 */
export const caseLocalePair = (slug: string | undefined): LocalePair | undefined => {
  const normalizedSlug = slug?.trim()
  return normalizedSlug ? [`/cases/${normalizedSlug}`, `/en/cases/${normalizedSlug}`] : undefined
}

export const localizedCasePath = (item: Pick<Case, 'slug'>, locale: SiteLocale) => {
  const pair = caseLocalePair(item.slug)
  if (!pair) return null
  return locale === 'en' ? pair[1] : pair[0]
}
