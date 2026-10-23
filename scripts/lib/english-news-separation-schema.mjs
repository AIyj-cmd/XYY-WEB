import { ENGLISH_NEWS_COLLECTION_DEFINITION } from '../data/english-news-collection-definition.mjs'
import { collectionTranslations } from '../data/cms-admin-translations.mjs'

const metadataKeys = [
  'interface',
  'display',
  'width',
  'required',
  'hidden',
  'readonly',
  'special',
  'options',
  'conditions',
  'group',
]

function normalized(value) {
  if (typeof value === 'string' && /^[{[]/.test(value)) {
    try {
      return normalized(JSON.parse(value))
    } catch {
      return value
    }
  }
  if (Array.isArray(value)) return value.map(normalized)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalized(value[key])])
    )
  return value
}

const same = (left, right) => JSON.stringify(normalized(left)) === JSON.stringify(normalized(right))

function required(field) {
  return field.meta?.required === true || field.schema?.is_nullable === false
}

function systemGenerated(field) {
  return (
    field.field === 'id' ||
    field.schema?.is_primary_key === true ||
    field.schema?.has_auto_increment === true ||
    (field.meta?.readonly === true &&
      Array.isArray(field.meta?.special) &&
      field.meta.special.length > 0)
  )
}

function schemaIssue(actual, expected) {
  if (actual.type !== expected.type) return 'type'
  if (required(actual) !== required(expected)) return 'required'
  for (const key of ['is_nullable', 'is_unique', 'default_value']) {
    if (Object.hasOwn(expected.schema ?? {}, key) && actual.schema?.[key] !== expected.schema[key])
      return key
  }
  for (const key of metadataKeys) {
    if (Object.hasOwn(expected.meta ?? {}, key) && !same(actual.meta?.[key], expected.meta[key]))
      return key
  }
  return null
}

export function planEnglishNewsSchema(collections, fields, relations) {
  const current = new Map(fields.map((field) => [field.field, field]))
  const issues = []
  const existing = collections.find(({ collection }) => collection === 'english_news')
  const desiredMeta = {
    icon: ENGLISH_NEWS_COLLECTION_DEFINITION.icon,
    hidden: false,
    ...ENGLISH_NEWS_COLLECTION_DEFINITION.meta,
    translations: collectionTranslations('english_news'),
  }
  if (existing?.meta?.translations) {
    desiredMeta.translations = [
      ...existing.meta.translations.filter(({ language }) => language !== 'zh-CN'),
      ...desiredMeta.translations,
    ]
  }
  const hasChineseLabel = (existing?.meta?.translations ?? []).some(
    ({ language, translation }) => language === 'zh-CN' && translation === '英文文章管理'
  )
  const metadataMismatch =
    existing &&
    (existing.meta?.icon !== desiredMeta.icon ||
      existing.meta?.group !== desiredMeta.group ||
      existing.meta?.singleton !== false ||
      existing.meta?.hidden === true ||
      !hasChineseLabel)
  const schema = {
    createCollection: !collections.some(({ collection }) => collection === 'english_news'),
    collectionMeta: metadataMismatch ? desiredMeta : null,
    fields: [],
    relations: [],
  }
  for (const expected of ENGLISH_NEWS_COLLECTION_DEFINITION.fields) {
    const actual = current.get(expected.field)
    if (!actual) schema.fields.push(expected)
    else {
      const mismatch = schemaIssue(actual, expected)
      if (mismatch) issues.push(`incompatible_field field=${expected.field} reason=${mismatch}`)
    }
  }
  const expectedFields = new Set(
    ENGLISH_NEWS_COLLECTION_DEFINITION.fields.map(({ field }) => field)
  )
  for (const actual of fields) {
    if (!expectedFields.has(actual.field) && required(actual) && !systemGenerated(actual))
      issues.push(`unexpected_required_field field=${actual.field}`)
  }
  for (const relation of ENGLISH_NEWS_COLLECTION_DEFINITION.relations) {
    const actual = relations.find(({ field }) => field === relation.field)
    if (!actual) schema.relations.push(relation)
    else if (actual.related_collection !== relation.related_collection)
      issues.push(`incompatible_relation field=${relation.field}`)
  }
  return { issues, schema }
}

export function planEnglishNewsNavigation(collections) {
  const siblings = collections
    .filter(({ meta }) => meta?.group === 'website_content' && meta?.hidden !== true)
    .filter(({ collection }) => collection !== 'english_news')
    .sort(
      (left, right) =>
        (left.meta?.sort ?? Number.MAX_SAFE_INTEGER) - (right.meta?.sort ?? Number.MAX_SAFE_INTEGER)
    )
  const newsIndex = siblings.findIndex(({ collection }) => collection === 'news')
  if (newsIndex < 0) return { issues: ['missing_navigation_sibling collection=news'], updates: [] }
  const english = collections.find(({ collection }) => collection === 'english_news')
  const ordered = [
    ...siblings.slice(0, newsIndex + 1),
    {
      collection: 'english_news',
      meta: {
        group: 'website_content',
        sort: english?.meta?.sort,
        ...(english?.meta?.hidden === true && { hidden: false }),
      },
    },
    ...siblings.slice(newsIndex + 1),
  ]
  return {
    issues: [],
    updates: ordered.flatMap(({ collection, meta }, index) => {
      const sort = index + 1
      const restoreEnglishVisibility =
        collection === 'english_news' && english?.meta?.hidden === true
      if (meta?.sort === sort && !restoreEnglishVisibility) return []
      return [
        {
          collection,
          meta: {
            group: 'website_content',
            sort,
            ...(restoreEnglishVisibility && { hidden: false }),
          },
        },
      ]
    }),
  }
}
