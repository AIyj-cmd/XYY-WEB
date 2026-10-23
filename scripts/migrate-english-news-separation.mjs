#!/usr/bin/env node

import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import {
  applyEnglishNewsSeparationPlan,
  buildEnglishNewsSeparationPlan,
} from './lib/english-news-separation-migration.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const apply = process.argv.includes('--apply')
const target = process.argv.find((arg) => arg.startsWith('--target='))?.slice(9)
const environment = process.argv.find((arg) => arg.startsWith('--confirm-environment='))?.slice(22)
if (!baseUrl || !token) throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
if (
  apply &&
  (!target ||
    target !== baseUrl ||
    !environment ||
    process.env.CONFIRM_ENGLISH_NEWS_SEPARATION !== `${target}:${environment}`)
)
  throw new Error('apply_requires_exact_target_environment_and_confirmation')

const directus = createDirectusAdminClient({ baseUrl, token })
const legacyNewsProjection = [
  'id',
  'status',
  'published_at',
  'slug',
  'category',
  'cover_image',
  'title_en',
  'summary_en',
  'content_en',
  'english_status',
  'english_published_at',
].join(',')
const [collections, legacyRows, legacyFields] = await Promise.all([
  directus.request('GET', '/collections'),
  directus.request('GET', `/items/news?limit=-1&fields=${legacyNewsProjection}`),
  directus.request('GET', '/fields/news'),
])
const exists = collections.some(({ collection }) => collection === 'english_news')
const [fields, relations, targetRows] = exists
  ? await Promise.all([
      directus.request('GET', '/fields/english_news'),
      directus.request('GET', '/relations/english_news'),
      directus.request('GET', '/items/english_news?limit=-1'),
    ])
  : [[], [], []]
for (const [label, value] of [
  ['collections', collections],
  ['legacy_rows', legacyRows],
  ['legacy_fields', legacyFields],
  ['fields', fields],
  ['relations', relations],
  ['target_rows', targetRows],
]) {
  if (!Array.isArray(value)) throw new Error(`english_news_separation_invalid_${label}`)
}
const plan = buildEnglishNewsSeparationPlan({
  collections,
  fields,
  relations,
  legacyRows,
  legacyFields,
  targetRows: targetRows ?? [],
})
console.log(
  JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    issues: plan.issues,
    schema: {
      createCollection: plan.schema.createCollection,
      collectionMeta: plan.schema.collectionMeta,
      fields: plan.schema.fields.map(({ field }) => field),
      relations: plan.schema.relations.map(({ field }) => field),
    },
    navigation: plan.navigation,
    records: {
      create: plan.records.length,
      slugs: plan.records.map(({ slug }) => slug),
      existing: plan.expectedRecords.length - plan.records.length,
    },
    hideLegacyFields: plan.legacyFields.map(({ field }) => field),
  })
)
if (plan.issues.length) process.exitCode = 1
else if (apply)
  console.log(JSON.stringify(await applyEnglishNewsSeparationPlan(directus, plan, { apply: true })))
