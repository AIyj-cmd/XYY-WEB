import { createHash } from 'node:crypto'

import type { Case } from '@/lib/directus'

type ReviewedCaseSource = Pick<
  Case,
  | 'slug'
  | 'category'
  | 'label'
  | 'name'
  | 'full_name'
  | 'case_description'
  | 'stats'
  | 'metrics'
  | 'details'
  | 'tags'
>

/**
 * Reviewed fingerprints for the six cases returned by the staging CMS snapshot.
 * Image URLs and accent colors are presentation fields and intentionally remain
 * outside the source binding so published media can change without discarding
 * reviewed English copy.
 */
export const PUBLISHED_CASE_SOURCE_DIGESTS = {
  ur: '6e140d58c2520ba2ff93cd27a03f77fb231a7d1d185050f2954c2e653bcec93c',
  maxrieny: 'bd354f4aa0ac90dadbfa752ebe897532cb77b713e182ba404154bcd897c3fd6f',
  xingmian: '59193b0bd0c099464f50de2652753a66bfd1860df1f2da5b60825041ef84198b',
  meiyi: '27bdee7e30af025cdf3cfbfc5c09cc493ac7bcbc15d4439a17c53ba13dddb866',
  'romi-studio': 'db474d484cc4f7d62b78bb75a6469a8456ad32d716736848990d412b46e917eb',
  toyouth: 'c3303a968296a1d265e5fa2620f13012b5f884a0924b5b448893d28d39b86f55',
} as const

export function reviewedCaseSource(item: Case): ReviewedCaseSource {
  return {
    slug: item.slug,
    category: item.category,
    label: item.label,
    name: item.name,
    full_name: item.full_name,
    case_description: item.case_description,
    stats: item.stats,
    metrics: item.metrics,
    details: item.details,
    tags: item.tags,
  }
}

export function reviewedCaseSourceDigest(item: Case) {
  return createHash('sha256')
    .update(JSON.stringify(reviewedCaseSource(item)))
    .digest('hex')
}
