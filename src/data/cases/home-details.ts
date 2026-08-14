import { CASE_DETAILS } from '@/data/brand/case-details'
import type { CaseDetail } from '@/data/brand/case-details'
import type { Case } from '@/lib/directus'

const catalog = CASE_DETAILS as Record<string, CaseDetail>

export function createHomeCaseDetails(cases: readonly Case[]): Record<string, CaseDetail> {
  return Object.fromEntries(
    cases.map((item) => {
      const fallback = catalog[item.label]
      return [
        item.label,
        {
          slug: item.slug || fallback?.slug || '',
          name: item.name || fallback?.name || item.label,
          fullName: item.full_name || fallback?.fullName || item.label,
          category: item.category || fallback?.category || '',
          image: item.img || fallback?.image || '',
          accent: item.accent || fallback?.accent || '#2563EB',
          description: item.case_description || item.details || fallback?.description || '',
          stats: item.stats?.length
            ? item.stats.map((stat) => ({ ...stat }))
            : fallback?.stats || [],
        },
      ]
    })
  )
}
