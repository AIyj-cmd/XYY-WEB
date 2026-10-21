import { parseNewsPublicationTime } from '../../src/lib/news-publication-time-core.mjs'
import {
  hasEnglishNewsRawInput,
  hasVisibleEnglishNewsText,
  sanitizedEnglishNewsContent,
} from '../../src/lib/news-english-visibility.mjs'
import { collectionTranslations, fieldTranslations } from '../data/cms-admin-translations.mjs'
import { ENGLISH_NEWS_COLLECTION_DEFINITION } from '../data/english-news-collection-definition.mjs'
import {
  planEnglishNewsNavigation,
  planEnglishNewsSchema,
} from './english-news-separation-schema.mjs'
import { verifyEnglishNewsSeparationReadback } from './english-news-separation-readback.mjs'

const legacyCategories = {
  行业资讯: 'industry-news',
  物流干货: 'logistics-guides',
  政策解读: 'policy-updates',
  新亦源动态: 'xinyiyuan-news',
}
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const utcTimestamp = (timestamp) => (timestamp === null ? null : new Date(timestamp).toISOString())

function migratedRecord(row) {
  const englishTime = parseNewsPublicationTime(row.english_published_at)
  const chineseTime = parseNewsPublicationTime(row.published_at)
  const hasMaterial = [row.title_en, row.summary_en, row.content_en, row.english_published_at].some(
    hasEnglishNewsRawInput
  )
  if (!hasMaterial) return null
  if (
    !hasVisibleEnglishNewsText(row.title_en) ||
    !hasVisibleEnglishNewsText(row.summary_en) ||
    !sanitizedEnglishNewsContent(row.content_en)
  )
    return { issue: `incomplete_legacy_record id=${row.id}` }
  if (row.english_published_at != null && englishTime === null)
    return { issue: `invalid_legacy_time id=${row.id} field=english_published_at` }
  const category = legacyCategories[row.category]
  if (!slugPattern.test(row.slug ?? '') || !category)
    return { issue: `invalid_legacy_record id=${row.id}` }
  const published =
    row.status === 'published' &&
    row.english_status === 'published' &&
    chineseTime !== null &&
    englishTime !== null
  const status = row.english_status === 'archived' ? 'archived' : published ? 'published' : 'draft'
  return {
    id: Number(row.id),
    record: {
      legacy_news_id: Number(row.id),
      status,
      title: row.title_en.trim(),
      slug: row.slug,
      category,
      summary: row.summary_en.trim(),
      content: row.content_en,
      cover_image: row.cover_image ?? null,
      published_at: utcTimestamp(published ? Math.max(chineseTime, englishTime) : englishTime),
    },
  }
}

function sameRecord(left, right) {
  return (
    ['status', 'title', 'slug', 'category', 'summary', 'content', 'cover_image'].every(
      (field) => (left[field] ?? null) === (right[field] ?? null)
    ) &&
    Number(left.legacy_news_id) === Number(right.legacy_news_id) &&
    parseNewsPublicationTime(left.published_at) === parseNewsPublicationTime(right.published_at)
  )
}

export function buildEnglishNewsSeparationPlan(snapshot) {
  const collections = snapshot.collections ?? []
  const { issues, schema } = planEnglishNewsSchema(
    collections,
    snapshot.fields ?? [],
    snapshot.relations ?? []
  )
  const desired = []
  for (const row of snapshot.legacyRows ?? []) {
    const migrated = migratedRecord(row)
    if (!migrated) continue
    if (migrated.issue) issues.push(migrated.issue)
    else desired.push(migrated.record)
  }
  const targetByLegacy = new Map(
    (snapshot.targetRows ?? [])
      .filter((row) => row.legacy_news_id != null)
      .map((row) => [Number(row.legacy_news_id), row])
  )
  const targetBySlug = new Map((snapshot.targetRows ?? []).map((row) => [row.slug, row]))
  const records = []
  for (const record of desired) {
    const existing = targetByLegacy.get(record.legacy_news_id)
    const duplicate = targetBySlug.get(record.slug)
    if (existing && !sameRecord(existing, record))
      issues.push(`target_conflict legacy_news_id=${record.legacy_news_id}`)
    else if (!existing && duplicate) issues.push(`slug_conflict slug=${record.slug}`)
    else if (!existing) records.push(record)
  }
  const navigation = planEnglishNewsNavigation(collections)
  issues.push(...navigation.issues)
  const legacyFields = (snapshot.legacyFields ?? []).filter(
    ({ field, meta }) =>
      [
        'english_content',
        'title_en',
        'summary_en',
        'content_en',
        'english_status',
        'english_published_at',
      ].includes(field) &&
      (!meta?.hidden || !meta?.readonly)
  )
  return {
    issues,
    schema,
    records,
    expectedRecords: desired,
    legacyFields,
    navigation: navigation.updates,
  }
}

export async function applyEnglishNewsSeparationPlan(directus, plan, { apply = false } = {}) {
  if (plan.issues.length) throw new Error(plan.issues.join('\n'))
  if (!apply) return { applied: 0 }
  if (plan.schema.createCollection) {
    await directus.request('POST', '/collections', {
      collection: 'english_news',
      schema: { name: 'english_news' },
      meta: {
        icon: ENGLISH_NEWS_COLLECTION_DEFINITION.icon,
        hidden: false,
        ...ENGLISH_NEWS_COLLECTION_DEFINITION.meta,
        translations: collectionTranslations('english_news'),
      },
    })
  } else if (plan.schema.collectionMeta)
    await directus.request('PATCH', '/collections/english_news', {
      meta: plan.schema.collectionMeta,
    })
  for (const field of plan.schema.fields) {
    await directus.request('POST', '/fields/english_news', {
      ...field,
      meta: { ...field.meta, translations: fieldTranslations('english_news', field.field) },
    })
  }
  for (const relation of plan.schema.relations)
    await directus.request('POST', '/relations', relation)
  for (const update of plan.navigation)
    await directus.request('PATCH', `/collections/${update.collection}`, { meta: update.meta })
  if (plan.records.length) await directus.request('POST', '/items/english_news', plan.records)
  await verifyEnglishNewsSeparationReadback(directus, plan, sameRecord)
  for (const field of plan.legacyFields) {
    await directus.request('PATCH', `/fields/news/${field.field}`, {
      meta: { ...field.meta, hidden: true, readonly: true },
    })
  }
  if (plan.legacyFields.length) {
    const fields = await directus.request('GET', '/fields/news')
    if (!Array.isArray(fields)) throw new Error('english_news_separation_invalid_legacy_fields')
    if (
      plan.legacyFields.some(({ field }) => {
        const meta = fields.find((candidate) => candidate.field === field)?.meta
        return !meta?.hidden || !meta?.readonly
      })
    )
      throw new Error('english_news_separation_legacy_hide_readback_failed')
  }
  return { applied: plan.records.length }
}
