#!/usr/bin/env node

import {
  APPROVED_HOMEPAGE_STATS,
  APPROVED_SERVICES,
  APPROVED_WAREHOUSES,
} from './approved-cms-content.mjs'
import { APPROVED_CASE_SEEDS } from './data/approved-case-seeds.mjs'
import { CMS_COLLECTION_DEFINITIONS } from './data/cms-collection-definitions.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import { createCmsSetupRuntime } from './lib/cms-setup-runtime.mjs'

const baseUrl = (process.env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN

if (!token) {
  console.error('DIRECTUS_TOKEN is required')
  process.exit(1)
}

const directus = createDirectusAdminClient({ baseUrl, token })
const { createCollection, seed } = createCmsSetupRuntime(directus)
const withoutFields = (item, excluded) =>
  Object.fromEntries(Object.entries(item).filter(([field]) => !excluded.includes(field)))
const seeds = {
  homepage_stats: APPROVED_HOMEPAGE_STATS.map((item) => withoutFields(item, ['id'])),
  services: APPROVED_SERVICES.map((item) => withoutFields(item, ['id'])),
  warehouses: APPROVED_WAREHOUSES.map((item) => withoutFields(item, ['aliases'])),
}

for (const definition of CMS_COLLECTION_DEFINITIONS) {
  await createCollection(definition)
  await seed(definition.name, seeds[definition.name])
}

console.log('\n[collection] cases (existing — seeding only)')
await seed('cases', APPROVED_CASE_SEEDS)

console.log('\n✅ CMS setup complete!')
console.log('   collections: homepage_stats, services, warehouses')
console.log(`   cases: seeded with ${APPROVED_CASE_SEEDS.length} items`)
console.log(`\nAccess Directus admin at ${baseUrl}/admin`)
