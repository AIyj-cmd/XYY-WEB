import { CASE_FALLBACKS } from '@/data/cases'
import type { CaseDetail } from '@/data/brand/case-details'
import { CASE_FAQS } from '@/data/cases/faqs'
import type { Case, FaqItem } from '@/lib/directus'

import { ENGLISH_CASE_COPY, ENGLISH_CASE_FAQS } from './cases-copy'

export type EnglishCaseDiagnostic = {
  readonly slug: string | undefined
  readonly reason: 'unknown-source' | 'stale-source'
}

export type EnglishCaseFaq = (typeof ENGLISH_CASE_FAQS)[number]

const meaningfulSource = (item: Case) => ({
  slug: item.slug,
  label: item.label,
  name: item.name,
  full_name: item.full_name,
  accent: item.accent,
  category: item.category,
  case_description: item.case_description,
  stats: item.stats,
  metrics: item.metrics,
  details: item.details,
  tags: item.tags,
  img: item.img,
})

const approvedSources = new Map(
  CASE_FALLBACKS.filter((item): item is Case & { slug: string } => Boolean(item.slug)).map(
    (item) => [item.slug, JSON.stringify(meaningfulSource(item))]
  )
)

function caseDiagnostic(item: Case): EnglishCaseDiagnostic | undefined {
  const expected = item.slug ? approvedSources.get(item.slug) : undefined
  if (!expected || !item.slug || !ENGLISH_CASE_COPY[item.slug]) {
    return { slug: item.slug, reason: 'unknown-source' }
  }
  if (JSON.stringify(meaningfulSource(item)) !== expected) {
    return { slug: item.slug, reason: 'stale-source' }
  }
}

function reportCaseOmission({ slug, reason }: EnglishCaseDiagnostic) {
  console.warn(`[i18n:cases] omitted ${slug || 'unidentified'} case: ${reason}`)
}

/** Returns only records whose reviewed Chinese source snapshot still matches the CMS value. */
export function translateCases(items: Case[]): Case[] {
  return items.flatMap((item) => {
    const diagnostic = caseDiagnostic(item)
    if (diagnostic) {
      reportCaseOmission(diagnostic)
      return []
    }
    const copy = ENGLISH_CASE_COPY[item.slug as keyof typeof ENGLISH_CASE_COPY]
    return [
      {
        ...item,
        label: copy.label,
        name: copy.name,
        full_name: copy.fullName,
        category: copy.category,
        case_description: copy.description,
        stats: [],
        metrics: '',
        details: copy.description,
        tags: [...copy.tags],
      },
    ]
  })
}

/** Builds homepage modal details solely from English case records, indexed by stable slug. */
export function createEnglishHomeCaseDetails(cases: Case[]): Record<string, CaseDetail> {
  return Object.fromEntries(
    cases.flatMap((item) => {
      if (!item.slug) return []
      return [
        [
          item.slug,
          {
            slug: item.slug,
            name: item.name || item.label,
            fullName: item.full_name || item.label,
            category: item.category,
            image: item.img,
            accent: item.accent || '#2563EB',
            description: item.case_description || item.details,
            stats: item.stats?.map((stat) => ({ ...stat })) || [],
          },
        ],
      ]
    })
  )
}

function sourceFaqIndex(q: string, a: string) {
  return CASE_FAQS.findIndex((source) => source.q === q && source.a === a)
}

/** Leaves changed CMS FAQ entries out until their Chinese source and reviewed English copy are paired. */
export function translateCaseFaqs(
  items: ReadonlyArray<Pick<FaqItem, 'q' | 'a'>> = CASE_FAQS
): EnglishCaseFaq[] {
  return items.flatMap((item, index) => {
    const sourceIndex = sourceFaqIndex(item.q, item.a)
    if (sourceIndex < 0) {
      console.warn(`[i18n:cases] omitted case FAQ ${index + 1}: stale-source`)
      return []
    }
    const translation = ENGLISH_CASE_FAQS[sourceIndex]
    return translation ? [translation] : []
  })
}
