import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { URL } from 'node:url'

import {
  APPROVED_HOMEPAGE_STATS,
  APPROVED_SERVICES,
  APPROVED_WAREHOUSES,
  LEGACY_WAREHOUSE_NAMES,
} from './approved-cms-content.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const apply = process.argv.includes('--apply')

if (!baseUrl || !token) {
  console.error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
  process.exit(1)
}

const endpointLabel = new URL(baseUrl).host
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
}
let changeCount = 0

async function api(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = payload?.errors?.[0]?.message || `${response.status} ${response.statusText}`
    throw new Error(`${method} ${path}: ${message}`)
  }

  return payload?.data ?? payload
}

async function readCollection(collection) {
  return api('GET', `/items/${collection}?limit=-1&sort=sort`)
}

function isEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function buildPatch(current, target, fields) {
  return Object.fromEntries(
    fields
      .filter((field) => !isEqual(current[field], target[field]))
      .map((field) => [field, target[field]])
  )
}

async function patchRecord(collection, current, target, fields) {
  const patch = buildPatch(current, target, fields)
  if (Object.keys(patch).length === 0) return current

  changeCount += 1
  console.log(
    `${apply ? 'apply' : 'plan '} PATCH ${collection}/${current.id}: ${Object.keys(patch).join(', ')}`
  )
  if (!apply) return { ...current, ...patch }

  return api('PATCH', `/items/${collection}/${current.id}`, patch)
}

async function createWarehouse(target) {
  changeCount += 1
  console.log(`${apply ? 'apply' : 'plan '} CREATE warehouses: ${target.name}`)
  if (!apply) return { id: `new:${target.name}`, ...target }

  const draft = await api('POST', '/items/warehouses', { ...target, status: 'draft' })
  return api('PATCH', `/items/warehouses/${draft.id}`, { status: 'published' })
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function writeBackup(snapshot) {
  if (!apply) return

  const backupDir = join(process.cwd(), 'output', 'cms-sync')
  const safeHost = endpointLabel.replace(/[^a-zA-Z0-9.-]+/g, '_')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = join(backupDir, `${safeHost}-${timestamp}.json`)
  await mkdir(backupDir, { recursive: true })
  await writeFile(backupPath, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o600 })
  console.log(`backup ${backupPath}`)
}

async function syncFixedCollection(collection, records, targets, keyFields, fields) {
  assert(records.length === targets.length, `${collection}: expected ${targets.length} records`)

  for (const target of targets) {
    const matches = records.filter((record) =>
      keyFields.every((field) => record[field] === target[field])
    )
    assert(matches.length === 1, `${collection}: target ${target.id} did not match exactly once`)
    await patchRecord(collection, matches[0], { ...target, status: 'published' }, [
      'status',
      ...fields,
    ])
  }
}

function warehousePayload(target, status = 'published') {
  const fields = Object.fromEntries(Object.entries(target).filter(([field]) => field !== 'aliases'))
  return { ...fields, status }
}

async function syncWarehouses(records) {
  const matchedIds = new Set()

  for (const target of APPROVED_WAREHOUSES) {
    const matches = records.filter((record) => target.aliases.includes(record.name))
    assert(matches.length <= 1, `warehouses: duplicate alias match for ${target.name}`)

    if (matches.length === 0) {
      const created = await createWarehouse(warehousePayload(target))
      matchedIds.add(created.id)
      continue
    }

    const current = matches[0]
    assert(!matchedIds.has(current.id), `warehouses: record ${current.id} matched twice`)
    matchedIds.add(current.id)
    await patchRecord('warehouses', current, warehousePayload(target), [
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
    assert(
      LEGACY_WAREHOUSE_NAMES.includes(record.name),
      `warehouses: refusing to archive unexpected published record "${record.name}"`
    )
    await patchRecord('warehouses', record, { status: 'archived' }, ['status'])
  }
}

function warehouseMatchesTarget(record, target) {
  const desired = warehousePayload(target)
  return Object.entries(desired).every(([field, value]) => isEqual(record[field], value))
}

async function verify() {
  const stats = await readCollection('homepage_stats')
  const services = await readCollection('services')
  const warehouses = await readCollection('warehouses')
  const publishedWarehouses = warehouses.filter((record) => record.status === 'published')

  assert(
    APPROVED_HOMEPAGE_STATS.every((target) => {
      const record = stats.find((item) => item.id === target.id)
      return (
        record &&
        Object.entries({ ...target, status: 'published' }).every(([field, value]) =>
          isEqual(record[field], value)
        )
      )
    }),
    'homepage_stats verification failed'
  )
  assert(
    APPROVED_SERVICES.every((target) => {
      const record = services.find((item) => item.id === target.id && item.slug === target.slug)
      return (
        record &&
        Object.entries({ ...target, status: 'published' }).every(([field, value]) =>
          isEqual(record[field], value)
        )
      )
    }),
    'services verification failed'
  )
  assert(
    publishedWarehouses.length === APPROVED_WAREHOUSES.length &&
      APPROVED_WAREHOUSES.every((target) => {
        const record = publishedWarehouses.find((item) => item.name === target.name)
        return record && warehouseMatchesTarget(record, target)
      }),
    'warehouses verification failed'
  )
  assert(
    warehouses
      .filter((record) => LEGACY_WAREHOUSE_NAMES.includes(record.name))
      .every((record) => record.status === 'archived'),
    'legacy warehouse verification failed'
  )
}

console.log(`${apply ? 'Applying' : 'Dry run for'} reviewed CMS content on ${endpointLabel}`)

const snapshot = {
  homepage_stats: await readCollection('homepage_stats'),
  services: await readCollection('services'),
  warehouses: await readCollection('warehouses'),
}
await writeBackup(snapshot)

await syncFixedCollection(
  'homepage_stats',
  snapshot.homepage_stats,
  APPROVED_HOMEPAGE_STATS,
  ['id'],
  ['sort', 'value', 'label', 'unit', 'detail']
)
await syncFixedCollection(
  'services',
  snapshot.services,
  APPROVED_SERVICES,
  ['id', 'slug'],
  ['sort', 'slug', 'icon', 'name', 'subtitle', 'description', 'features']
)
await syncWarehouses(snapshot.warehouses)

if (apply) {
  await verify()
  console.log(`Verified reviewed CMS content on ${endpointLabel}`)
}
console.log(`${changeCount} change(s) ${apply ? 'applied' : 'planned'}`)
