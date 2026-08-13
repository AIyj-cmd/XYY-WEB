#!/usr/bin/env node

import { APPROVED_HOMEPAGE_STATS } from './approved-cms-content.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'

const baseUrl = (process.env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
if (!token) throw new Error('DIRECTUS_TOKEN is required')

const directus = createDirectusAdminClient({ baseUrl, token })

async function migrateServicePages() {
  const [pages, stats, features] = await Promise.all([
    directus.request('GET', '/items/service_pages?limit=-1'),
    directus.request('GET', '/items/service_stats?limit=-1&sort=sort'),
    directus.request('GET', '/items/service_features?limit=-1&sort=sort'),
  ])
  for (const page of pages) {
    const unifiedStats = stats
      .filter((item) => item.service_slug === page.slug)
      .map(({ stat, label, sub }) => ({ stat, label, sub }))
    const unifiedFeatures = features
      .filter((item) => item.service_slug === page.slug)
      .map(({ title, desc }) => ({ title, desc }))
    await directus.request('PATCH', `/items/service_pages/${page.id}`, {
      stats: page.stats?.length ? page.stats : unifiedStats,
      features: page.features?.length ? page.features : unifiedFeatures,
    })
    console.log(
      `service ${page.slug}: ${unifiedStats.length} stats, ${unifiedFeatures.length} features`
    )
  }
}

async function migrateFaqRelations() {
  const [pages, faqs] = await Promise.all([
    directus.request('GET', '/items/faq_pages?limit=-1'),
    directus.request('GET', '/items/faqs?limit=-1'),
  ])
  for (const faq of faqs) {
    if (faq.faq_page) continue
    const page = pages.find((item) => item.key === faq.page_key)
    if (!page) continue
    await directus.request('PATCH', `/items/faqs/${faq.id}`, { faq_page: page.id })
  }
  console.log(`FAQ relations checked: ${faqs.length} items`)
}

async function syncHomepageFacts() {
  const main = await directus.request('GET', '/items/homepage_content')
  const stats = APPROVED_HOMEPAGE_STATS.map(({ value, label, unit, detail }) => ({
    value,
    label,
    unit,
    detail,
  }))
  await directus.request('PATCH', '/items/homepage_content', {
    status: 'published',
    key: main?.key || 'main',
    stats,
  })
  const legacy = await directus.request('GET', '/items/homepage_stats?limit=-1')
  for (const approved of APPROVED_HOMEPAGE_STATS) {
    const row = legacy.find((item) => Number(item.sort) === Number(approved.sort))
    if (!row) continue
    await directus.request('PATCH', `/items/homepage_stats/${row.id}`, {
      value: approved.value,
      label: approved.label,
      unit: approved.unit,
      detail: approved.detail,
    })
  }
  console.log('Homepage facts synchronized to approved 150+ / 54万㎡ source.')
}

await migrateServicePages()
await migrateFaqRelations()
await syncHomepageFacts()
console.log('Unified CMS content migration complete.')
