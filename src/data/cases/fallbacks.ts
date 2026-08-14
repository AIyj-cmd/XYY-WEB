import { CASE_DETAILS } from '@/lib/brand'
import type { Case } from '@/lib/directus'

export const CASE_FALLBACKS: Case[] = Object.entries(CASE_DETAILS).map(
  ([label, detail], index) => ({
    id: index + 1,
    sort: index + 1,
    slug: detail.slug,
    category: detail.category,
    label,
    name: detail.name,
    full_name: detail.fullName,
    accent: detail.accent,
    case_description: detail.description,
    stats: detail.stats.map((stat) => ({ ...stat })),
    metrics: detail.stats
      .slice(0, 3)
      .map((stat) => `${stat.label} ${stat.value}${stat.unit}`)
      .join(' · '),
    details: detail.description,
    tags: [detail.category],
    img: detail.image,
  })
)
