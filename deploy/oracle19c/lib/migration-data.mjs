import { createHash } from 'node:crypto'

const auditSpecials = new Set(['user-created', 'user-updated', 'date-created', 'date-updated'])
const relationSpecials = new Set(['m2o', 'o2m', 'm2a', 'o2a', 'file', 'files'])

export function analyzeTransferFields(definitions, collection) {
  const fields = new Set()
  let primaryKey = null

  for (const definition of definitions) {
    const specials = new Set(definition.meta?.special || [])
    if (definition.schema?.is_primary_key) {
      primaryKey = definition.field
      continue
    }
    if (definition.schema === null || [...specials].some((value) => auditSpecials.has(value))) {
      continue
    }
    if (
      definition.schema?.foreign_key_table ||
      [...specials].some((value) => relationSpecials.has(value))
    ) {
      throw new Error(
        `${collection}.${definition.field} is relational; ID-regenerating transfer is unsafe`
      )
    }
    fields.add(definition.field)
  }

  if (!primaryKey) throw new Error(`${collection}: primary key field was not found`)
  return { fields, primaryKey }
}

export function normalizeTransferItem(item, fields) {
  return Object.fromEntries(
    Object.entries(item)
      .filter(([field]) => fields.has(field))
      .sort(([left], [right]) => left.localeCompare(right))
  )
}

export function contentDigest(items) {
  const stable = items.map((item) => JSON.stringify(item)).sort()
  return createHash('sha256').update(JSON.stringify(stable)).digest('hex')
}
