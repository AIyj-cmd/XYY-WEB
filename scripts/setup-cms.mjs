#!/usr/bin/env node

import { CMS_COLLECTION_CONTRACTS, CMS_SCHEMA_VERSION } from './data/cms-contract-definitions.mjs'
import { CMS_NAVIGATION_GROUP_DEFINITIONS } from './data/content-management-collection-definitions.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import { createCmsSetupRuntime } from './lib/cms-setup-runtime.mjs'
import { runCmsContentInitialization } from './lib/cms-content-runtime.mjs'
import { CmsContentError } from './lib/cms-content-snapshot.mjs'
import { parseCmsSetupOptions } from './lib/cms-setup-options.mjs'
import {
  DEFAULT_CONTENT_POLICY_NAME,
  syncContentReadPermissions,
} from './lib/content-policy-sync.mjs'

let options
try {
  options = parseCmsSetupOptions(process.argv.slice(2))
} catch {
  console.error('cms_setup_invalid_arguments; use --help')
  process.exit(1)
}
if (options.help) {
  console.log(`Usage: node scripts/setup-cms.mjs [--schema-only | --help]
Default: initialize schema, synchronize existing content-policy permissions, create missing
approved initial content, and read back to verify initial-content readiness.
--schema-only: initialize schema and policy permissions without seeding or checking readiness.
Schema-only completion does not mean that initial content is ready.`)
  process.exit(0)
}

const baseUrl = (process.env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN
if (!token) {
  console.error('DIRECTUS_TOKEN is required')
  process.exit(1)
}

const directus = createDirectusAdminClient({ baseUrl, token })
const { createNavigationGroup, createCollection } = createCmsSetupRuntime(directus)
for (const group of CMS_NAVIGATION_GROUP_DEFINITIONS) await createNavigationGroup(group)
for (const definition of CMS_COLLECTION_CONTRACTS) await createCollection(definition)

const permissionResult = await syncContentReadPermissions(directus, {
  policyId: process.env.DIRECTUS_CONTENT_POLICY_ID,
  policyName: process.env.DIRECTUS_CONTENT_POLICY_NAME || DEFAULT_CONTENT_POLICY_NAME,
  publishedOnly: process.env.DIRECTUS_CUSTOM_PERMISSION_RULES === 'true',
})

console.log(`schema version: ${CMS_SCHEMA_VERSION}`)
console.log(
  `content policy: ${permissionResult.total} read permissions synchronized ` +
    `(${permissionResult.created} created, ${permissionResult.updated} updated)`
)
if (options.schemaOnly) {
  console.log('CMS schema-only setup complete; initial content NOT initialized or verified.')
  console.log('Use npm run cms:init-content to preview, then explicitly authorize --apply.')
} else {
  try {
    const report = await runCmsContentInitialization(directus, { mode: 'apply' })
    console.log(JSON.stringify(report, null, 2))
    if (!report.ready) process.exitCode = 1
    else console.log('CMS setup complete; initial content readback verified.')
  } catch (error) {
    if (error instanceof CmsContentError) console.error(error.message)
    console.error('cms_setup_initial_content_failed; partial_changes_may_exist')
    if (Number.isInteger(error.writesAccepted))
      console.error(`writes_accepted=${error.writesAccepted}`)
    process.exitCode = 1
  }
}
