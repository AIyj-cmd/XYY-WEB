import { assertSync, isEqual } from './cms-sync-runtime.mjs'

export function findUniqueRecord(records, target, keyFields, collection) {
  const matches = records.filter((record) =>
    keyFields.every((field) => record[field] === target[field])
  )
  const identity = keyFields.map((field) => `${field}=${target[field]}`).join(', ')
  assertSync(matches.length === 1, `${collection}: ${identity} did not match exactly once`)
  return matches[0]
}

export async function syncFixedCollection({
  collection,
  records,
  targets,
  keyFields,
  fields,
  runtime,
}) {
  assertSync(records.length === targets.length, `${collection}: expected ${targets.length} records`)

  for (const target of targets) {
    const current = findUniqueRecord(records, target, keyFields, collection)
    await runtime.patchRecord(collection, current, { ...target, status: 'published' }, [
      'status',
      ...fields,
    ])
  }
}

export function fixedCollectionMatches(records, targets, keyFields, fields) {
  if (records.length !== targets.length) return false
  return targets.every((target) => {
    const record = records.find((candidate) =>
      keyFields.every((field) => candidate[field] === target[field])
    )
    return (
      record &&
      ['status', ...fields].every((field) =>
        isEqual(record[field], field === 'status' ? 'published' : target[field])
      )
    )
  })
}
