import {
  APPROVED_HOMEPAGE_STATS,
  APPROVED_SERVICES,
  APPROVED_WAREHOUSES,
  LEGACY_WAREHOUSE_NAMES,
} from './approved-cms-content.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import { assertSync, createCmsSyncRuntime } from './lib/cms-sync-runtime.mjs'
import { fixedCollectionMatches, syncFixedCollection } from './lib/fixed-collection-sync.mjs'
import { syncWarehouses, warehousesMatchApproved } from './lib/warehouse-sync.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const apply = process.argv.includes('--apply')

if (!baseUrl || !token) {
  console.error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
  process.exit(1)
}

const directus = createDirectusAdminClient({ baseUrl, token })
const runtime = createCmsSyncRuntime({ directus, apply })

async function verify() {
  const stats = await directus.readCollection('homepage_stats')
  const services = await directus.readCollection('services')
  const warehouses = await directus.readCollection('warehouses')

  assertSync(
    fixedCollectionMatches(
      stats,
      APPROVED_HOMEPAGE_STATS,
      ['sort'],
      ['sort', 'value', 'label', 'unit', 'detail']
    ),
    'homepage_stats verification failed'
  )
  assertSync(
    fixedCollectionMatches(
      services,
      APPROVED_SERVICES,
      ['slug'],
      ['sort', 'slug', 'icon', 'name', 'subtitle', 'description', 'features']
    ),
    'services verification failed'
  )
  assertSync(
    warehousesMatchApproved(warehouses, APPROVED_WAREHOUSES, LEGACY_WAREHOUSE_NAMES),
    'warehouses verification failed'
  )
}

console.log(
  `${apply ? 'Applying' : 'Dry run for'} reviewed CMS content on ${directus.endpointLabel}`
)

const snapshot = {
  homepage_stats: await directus.readCollection('homepage_stats'),
  services: await directus.readCollection('services'),
  warehouses: await directus.readCollection('warehouses'),
}
await runtime.writeBackup(snapshot)

await syncFixedCollection({
  collection: 'homepage_stats',
  records: snapshot.homepage_stats,
  targets: APPROVED_HOMEPAGE_STATS,
  keyFields: ['sort'],
  fields: ['sort', 'value', 'label', 'unit', 'detail'],
  runtime,
})
await syncFixedCollection({
  collection: 'services',
  records: snapshot.services,
  targets: APPROVED_SERVICES,
  keyFields: ['slug'],
  fields: ['sort', 'slug', 'icon', 'name', 'subtitle', 'description', 'features'],
  runtime,
})
await syncWarehouses({
  records: snapshot.warehouses,
  targets: APPROVED_WAREHOUSES,
  legacyNames: LEGACY_WAREHOUSE_NAMES,
  runtime,
})

if (apply) {
  await verify()
  console.log(`Verified reviewed CMS content on ${directus.endpointLabel}`)
}
console.log(`${runtime.getChangeCount()} change(s) ${apply ? 'applied' : 'planned'}`)
