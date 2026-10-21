import {
  planEnglishNewsNavigation,
  planEnglishNewsSchema,
} from './english-news-separation-schema.mjs'

const array = (value, label) => {
  if (!Array.isArray(value)) throw new Error(`english_news_separation_invalid_${label}`)
  return value
}

export async function verifyEnglishNewsSeparationReadback(directus, plan, sameRecord) {
  const [collections, fields, relations, rows] = await Promise.all([
    directus.request('GET', '/collections'),
    directus.request('GET', '/fields/english_news'),
    directus.request('GET', '/relations/english_news'),
    directus.request('GET', '/items/english_news?limit=-1'),
  ])
  const validCollections = array(collections, 'collections')
  const schema = planEnglishNewsSchema(
    validCollections,
    array(fields, 'fields'),
    array(relations, 'relations')
  )
  const navigation = planEnglishNewsNavigation(validCollections)
  if (
    schema.issues.length ||
    schema.schema.collectionMeta ||
    schema.schema.fields.length ||
    schema.schema.relations.length ||
    navigation.issues.length ||
    navigation.updates.length
  )
    throw new Error('english_news_separation_schema_readback_failed')
  const actual = array(rows, 'records')
  if (
    actual.length < plan.expectedRecords.length ||
    plan.expectedRecords.some((record) => !actual.some((row) => sameRecord(row, record)))
  )
    throw new Error('english_news_separation_readback_failed')
}
