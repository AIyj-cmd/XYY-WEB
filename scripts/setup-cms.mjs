#!/usr/bin/env node

import { CMS_COLLECTION_CONTRACTS, CMS_SCHEMA_VERSION } from './data/cms-contract-definitions.mjs'
import { CMS_NAVIGATION_GROUP_DEFINITIONS } from './data/content-management-collection-definitions.mjs'
import { CMS_SEEDS, CMS_SEED_COUNTS, CMS_SEED_IDENTITIES } from './data/cms-seed-config.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import { createCmsSetupRuntime } from './lib/cms-setup-runtime.mjs'
import {
  DEFAULT_CONTENT_POLICY_NAME,
  syncContentReadPermissions,
} from './lib/content-policy-sync.mjs'

const baseUrl = (process.env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN

if (!token) {
  console.error('DIRECTUS_TOKEN is required')
  process.exit(1)
}

const directus = createDirectusAdminClient({ baseUrl, token })
const { createNavigationGroup, createCollection, seedMissing, resolveFaqSeedRelations } =
  createCmsSetupRuntime(directus)

for (const group of CMS_NAVIGATION_GROUP_DEFINITIONS) {
  await createNavigationGroup(group)
}

for (const definition of CMS_COLLECTION_CONTRACTS) {
  await createCollection(definition)
}

for (const definition of CMS_COLLECTION_CONTRACTS) {
  if (definition.seedPolicy !== 'normal') continue
  const seeds =
    definition.name === 'faqs'
      ? await resolveFaqSeedRelations(CMS_SEEDS[definition.name] ?? [])
      : (CMS_SEEDS[definition.name] ?? [])
  await seedMissing(definition.name, seeds, CMS_SEED_IDENTITIES[definition.name], {
    singleton: Boolean(definition.meta?.singleton),
  })
}

const permissionResult = await syncContentReadPermissions(directus, {
  policyId: process.env.DIRECTUS_CONTENT_POLICY_ID,
  policyName: process.env.DIRECTUS_CONTENT_POLICY_NAME || DEFAULT_CONTENT_POLICY_NAME,
  publishedOnly: process.env.DIRECTUS_CUSTOM_PERMISSION_RULES === 'true',
})

console.log('\n✅ CMS setup complete!')
console.log(`   schema version: ${CMS_SCHEMA_VERSION}`)
console.log(`   collections: ${CMS_COLLECTION_CONTRACTS.map(({ name }) => name).join(', ')}`)
console.log(`   cases: seeded with ${CMS_SEED_COUNTS.cases} items`)
console.log(`   faqs: seeded with ${CMS_SEED_COUNTS.faqs} items`)
console.log(`   service pages: seeded with ${CMS_SEED_COUNTS.servicePages} items`)
console.log(
  `   content policy: ${permissionResult.total} read permissions synchronized ` +
    `(${permissionResult.created} created, ${permissionResult.updated} updated)`
)
console.log(`\nAccess Directus admin at ${baseUrl}/admin`)
