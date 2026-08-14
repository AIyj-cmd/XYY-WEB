#!/usr/bin/env node

import { createDirectusAdminClient } from './lib/directus-admin.mjs'

const baseUrl = (process.env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
if (!token) throw new Error('DIRECTUS_TOKEN is required')

const directus = createDirectusAdminClient({ baseUrl, token })
const retiredCaseSlugs = new Set(['toyouth'])
const localFallbacks = {
  '茵曼（Inman）': {
    slug: 'inman',
    name: '茵曼',
    full_name: '茵曼（Inman）',
    accent: '#B7791F',
    stats: [
      { label: '库存管理', value: '全渠道统一管理', unit: '' },
      { label: '履约能力', value: '多平台同步发货', unit: '' },
    ],
  },
}
const [cases, details, stats] = await Promise.all([
  directus.request('GET', '/items/cases?limit=-1&sort=sort'),
  directus.request('GET', '/items/case_details?limit=-1'),
  directus.request('GET', '/items/case_stats?limit=-1&sort=sort'),
])

for (const item of cases.filter(
  (candidate) => retiredCaseSlugs.has(candidate.slug) && candidate.status !== 'archived'
)) {
  await directus.request('PATCH', `/items/cases/${item.id}`, { status: 'archived' })
  console.log(`archived retired case: ${item.slug}`)
}
for (const detail of details.filter(
  (candidate) => retiredCaseSlugs.has(candidate.slug) && candidate.status !== 'archived'
)) {
  await directus.request('PATCH', `/items/case_details/${detail.id}`, { status: 'archived' })
  console.log(`archived retired case detail: ${detail.slug}`)
}
for (const stat of stats.filter(
  (candidate) => retiredCaseSlugs.has(candidate.case_slug) && candidate.status !== 'archived'
)) {
  await directus.request('PATCH', `/items/case_stats/${stat.id}`, { status: 'archived' })
  console.log(`archived retired case stat: ${stat.case_slug}/${stat.id}`)
}

for (const item of cases.filter((candidate) => !retiredCaseSlugs.has(candidate.slug))) {
  const detail = details.find(
    (candidate) => candidate.slug === item.slug || candidate.label === item.label
  )
  const localFallback = localFallbacks[item.label]
  if (!detail && !localFallback) continue
  const caseStats = detail
    ? stats
        .filter((candidate) => candidate.case_slug === detail.slug)
        .sort((left, right) => Number(left.sort) - Number(right.sort))
        .map(({ label, value, unit }) => ({ label, value, unit: unit || '' }))
    : localFallback.stats

  await directus.request('PATCH', `/items/cases/${item.id}`, {
    slug: item.slug || detail?.slug || localFallback.slug,
    name: item.name || detail?.name || localFallback.name,
    full_name: item.full_name || detail?.full_name || localFallback.full_name,
    accent: item.accent || detail?.accent || localFallback.accent,
    case_description: item.case_description || detail?.description || item.details,
    stats: item.stats?.length ? item.stats : caseStats,
  })
  console.log(`merged ${item.label}: ${caseStats.length} metrics`)
}

console.log('Unified case migration complete.')
