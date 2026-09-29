import { fieldTranslations } from '../data/cms-admin-translations.mjs'
import { CMS_COLLECTION_DEFINITIONS } from '../data/cms-collection-definitions.mjs'

const ENGLISH_NEWS_FIELD_NAMES = new Set([
  'title_en',
  'summary_en',
  'content_en',
  'english_status',
  'english_published_at',
])

function englishNewsDefinition() {
  const definition = CMS_COLLECTION_DEFINITIONS.find(({ name }) => name === 'news')
  if (!definition) throw new Error('missing_news_collection_definition')
  return definition
}

export function buildEnglishNewsSchemaPlan(existingFields = []) {
  const current = new Map(existingFields.map((field) => [field.field, field]))
  const definition = englishNewsDefinition()
  const englishFields = definition.fields.filter(({ field }) => ENGLISH_NEWS_FIELD_NAMES.has(field))
  const existingGroup = current.get('english_content')
  if (
    existingGroup &&
    (existingGroup.type !== 'alias' || !existingGroup.meta?.special?.includes('group'))
  ) {
    throw new Error('migration_required:english_news_group_alias field=english_content')
  }
  for (const definition of englishFields) {
    const existing = current.get(definition.field)
    if (!existing) continue
    if (existing.type !== definition.type) {
      throw new Error(`migration_required:english_news_field_type field=${definition.field}`)
    }
    if (existing.meta?.group !== 'english_content' || existing.meta?.required === true) {
      throw new Error(`migration_required:english_news_field_meta field=${definition.field}`)
    }
    if (existing.schema?.is_nullable === false) {
      throw new Error(`migration_required:english_news_nullable field=${definition.field}`)
    }
    if (definition.field === 'english_status' && existing.schema?.default_value !== 'draft') {
      throw new Error('migration_required:english_news_default field=english_status')
    }
  }
  const aliases = (definition.aliases ?? []).filter(
    ({ field, meta }) =>
      field === 'english_content' && meta?.special?.includes('group') && !current.has(field)
  )
  const fields = englishFields.filter(({ field }) => !current.has(field))
  return { collection: 'news', aliases, fields }
}

export async function applyEnglishNewsSchemaPlan(directus, plan, { apply = false } = {}) {
  if (!apply) return { aliasesApplied: 0, fieldsApplied: 0 }
  for (const definition of plan.aliases) {
    const translations = fieldTranslations(plan.collection, definition.field)
    await directus.request('POST', `/fields/${plan.collection}`, {
      field: definition.field,
      type: 'alias',
      schema: null,
      meta: { ...definition.meta, ...(translations && { translations }) },
    })
  }
  for (const definition of plan.fields) {
    const translations = fieldTranslations(plan.collection, definition.field)
    await directus.request('POST', `/fields/${plan.collection}`, {
      field: definition.field,
      type: definition.type,
      schema: definition.schema ?? {},
      meta: {
        interface: 'input',
        display: 'raw',
        ...definition.meta,
        ...(translations && { translations }),
      },
    })
  }
  return { aliasesApplied: plan.aliases.length, fieldsApplied: plan.fields.length }
}
