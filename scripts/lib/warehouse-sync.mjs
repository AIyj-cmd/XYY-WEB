import { assertSync, isEqual } from './cms-sync-runtime.mjs'

export function warehousePayload(target, status = 'published') {
  const fields = Object.fromEntries(Object.entries(target).filter(([field]) => field !== 'aliases'))
  return { ...fields, status }
}

export async function syncWarehouses({ records, targets, legacyNames, runtime }) {
  const matchedIds = new Set()

  for (const target of targets) {
    const matches = records.filter((record) => target.aliases.includes(record.name))
    assertSync(matches.length <= 1, `warehouses: duplicate alias match for ${target.name}`)

    if (matches.length === 0) {
      const created = await runtime.createWarehouse(warehousePayload(target))
      matchedIds.add(created.id)
      continue
    }

    const current = matches[0]
    assertSync(!matchedIds.has(current.id), `warehouses: record ${current.id} matched twice`)
    matchedIds.add(current.id)
    await runtime.patchRecord('warehouses', current, warehousePayload(target), [
      'status',
      'sort',
      'name',
      'city',
      'since',
      'address',
      'park',
      'rent',
      'height',
      'highlight',
    ])
  }

  const unmatchedPublished = records.filter(
    (record) => record.status === 'published' && !matchedIds.has(record.id)
  )
  for (const record of unmatchedPublished) {
    assertSync(
      legacyNames.includes(record.name),
      `warehouses: refusing to archive unexpected published record "${record.name}"`
    )
    await runtime.patchRecord('warehouses', record, { status: 'archived' }, ['status'])
  }
}

export function warehousesMatchApproved(records, targets, legacyNames) {
  const published = records.filter((record) => record.status === 'published')
  const currentMatches =
    published.length === targets.length &&
    targets.every((target) => {
      const record = published.find((item) => item.name === target.name)
      const desired = warehousePayload(target)
      return (
        record && Object.entries(desired).every(([field, value]) => isEqual(record[field], value))
      )
    })
  const legacyArchived = records
    .filter((record) => legacyNames.includes(record.name))
    .every((record) => record.status === 'archived')

  return currentMatches && legacyArchived
}
