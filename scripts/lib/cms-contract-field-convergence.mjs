import { CMS_CONTRACT_BY_COLLECTION } from '../data/cms-contract-definitions.mjs'

const SAFE_TYPE_MIGRATIONS = [
  ['cases', 'metrics', 'string'],
  ['news', 'summary', 'string'],
  ['news', 'published_at', 'string'],
]
const SAFE_REQUIRED_MIGRATIONS = [
  ['faqs', 'page_key'],
  ['about_honors', 'image'],
]

const recordsFor = (snapshot, collection) =>
  snapshot.records?.[collection] ?? snapshot[collection] ?? []
const fieldsFor = (snapshot, collection) => snapshot.fields?.[collection]
const required = (field) => field?.meta?.required === true || field?.schema?.is_nullable === false
const empty = (value) => value === undefined || value === null || value === ''

function contractField(collection, field) {
  const definition = CMS_CONTRACT_BY_COLLECTION[collection]?.fields?.find(
    (candidate) => candidate.field === field
  )
  if (!definition) throw new Error(`missing field contract ${collection}.${field}`)
  return definition
}

function timestampValuesAreSafe(records, field) {
  return records.every((record) => {
    const value = record[field]
    if (value === undefined || value === null) return true
    return (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
      !Number.isNaN(Date.parse(value))
    )
  })
}

function uuidValuesAreSafe(records, field) {
  return records.every((record) => {
    const value = record[field]
    return (
      value === undefined ||
      value === null ||
      value === '' ||
      (typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))
    )
  })
}

export function planContractFieldConvergence(snapshot, issues) {
  const changes = []
  const newsCover = fieldsFor(snapshot, 'news')?.find(
    (candidate) => candidate.field === 'cover_image'
  )
  if (
    newsCover?.type === 'uuid' &&
    newsCover.schema?.data_type &&
    newsCover.schema.data_type !== 'uuid'
  ) {
    if (uuidValuesAreSafe(recordsFor(snapshot, 'news'), 'cover_image')) {
      changes.push({ phase: 'type', collection: 'news', field: 'cover_image', type: 'uuid' })
    } else {
      issues.push('data_validation_required collection=news field=cover_image')
    }
  }
  for (const [collection, field, sourceType] of SAFE_TYPE_MIGRATIONS) {
    const actual = fieldsFor(snapshot, collection)?.find((candidate) => candidate.field === field)
    if (!actual) continue
    const targetType = contractField(collection, field).type
    if (actual.type === targetType) continue
    if (actual.type !== sourceType) {
      issues.push(
        `unsupported_type_conversion collection=${collection} field=${field} expected=${targetType} actual=${actual.type}`
      )
    } else if (
      targetType === 'timestamp' &&
      !timestampValuesAreSafe(recordsFor(snapshot, collection), field)
    ) {
      issues.push(`data_validation_required collection=${collection} field=${field}`)
    } else {
      changes.push({ phase: 'type', collection, field, type: targetType })
    }
  }
  for (const [collection, field] of SAFE_REQUIRED_MIGRATIONS) {
    const actual = fieldsFor(snapshot, collection)?.find((candidate) => candidate.field === field)
    if (!actual || required(actual)) continue
    if (recordsFor(snapshot, collection).some((record) => empty(record[field]))) {
      issues.push(`data_validation_required collection=${collection} field=${field}`)
    } else {
      changes.push({ phase: 'require_contract', collection, field })
    }
  }
  return changes
}

export async function applyContractFieldConvergence(directus, changes) {
  let applied = 0
  for (const change of changes.filter(({ phase }) => phase === 'type')) {
    await directus.request('PATCH', `/fields/${change.collection}/${change.field}`, {
      type: change.type,
      // Directus only runs the database column alteration path when schema is present.
      schema: {},
    })
    applied += 1
  }
  for (const change of changes.filter(({ phase }) => phase === 'require_contract')) {
    await directus.request('PATCH', `/fields/${change.collection}/${change.field}`, {
      meta: { required: true },
      schema: { is_nullable: false },
    })
    applied += 1
  }
  return applied
}
