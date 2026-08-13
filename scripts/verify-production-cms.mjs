#!/usr/bin/env node

import { CMS_COLLECTION_DEFINITIONS } from './data/cms-collection-definitions.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''

if (!baseUrl || !token) {
  console.error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
  process.exit(1)
}

const headers = { Authorization: `Bearer ${token}` }
let failed = false

async function read(path) {
  const response = await fetch(`${baseUrl}${path}`, { headers })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.errors?.[0]?.message || `HTTP ${response.status}`)
  return payload
}

for (const definition of CMS_COLLECTION_DEFINITIONS) {
  const collection = definition.name
  try {
    const [itemsPayload, fieldsPayload] = await Promise.all([
      read(`/items/${collection}?limit=1&meta=filter_count`),
      read(`/fields/${collection}`),
    ])
    const fields = fieldsPayload.data ?? fieldsPayload
    const fieldNames = new Set(fields.map(({ field }) => field))
    const missingFields = definition.fields
      .map(({ field }) => field)
      .filter((field) => !fieldNames.has(field))
    if (missingFields.length) throw new Error(`missing fields: ${missingFields.join(', ')}`)

    if (definition.relations?.length) {
      const relationsPayload = await read(`/relations/${collection}`)
      const relations = relationsPayload.data ?? relationsPayload
      for (const expected of definition.relations) {
        const exists = relations.some(
          ({ field, related_collection: relatedCollection }) =>
            field === expected.field && relatedCollection === expected.related_collection
        )
        if (exists) continue
        const relationField = fields.find(({ field }) => field === expected.field)
        const compatibleLegacyFileField =
          expected.related_collection === 'directus_files' &&
          relationField?.schema?.data_type &&
          relationField.schema.data_type !== 'uuid'
        if (compatibleLegacyFileField) {
          console.warn(
            `warn collection ${collection}: legacy path field ${expected.field} has no file relation`
          )
          continue
        }
        throw new Error(`missing relation: ${expected.field}`)
      }
    }

    console.log(
      `ok collection ${collection} (${itemsPayload.meta?.filter_count ?? 'unknown'} items, schema complete)`
    )
  } catch (error) {
    failed = true
    console.error(
      `fail collection ${collection}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

try {
  const payload = await read('/files?limit=1&meta=filter_count')
  console.log(`ok Directus files (${payload.meta?.filter_count ?? 'unknown'} items)`)
} catch (error) {
  failed = true
  console.error(`fail Directus files: ${error instanceof Error ? error.message : String(error)}`)
}

if (failed) process.exit(1)
