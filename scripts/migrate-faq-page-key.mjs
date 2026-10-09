#!/usr/bin/env node

import { CMS_SCHEMA_VERSION } from '../config/cms-contract.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import {
  applyFaqPageKeyMigrationPlan,
  buildFaqPageKeyMigrationPlan,
  readFaqPageKeyMigrationSnapshot,
} from './lib/faq-page-key-migration.mjs'
import { writeCmsMigrationSnapshot } from './lib/cms-contract-snapshot.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const apply = process.argv.includes('--apply')

if (!baseUrl || !token) throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
if (apply && process.env.CONFIRM_FAQ_PAGE_KEY_MIGRATION !== CMS_SCHEMA_VERSION) {
  throw new Error(`Apply requires CONFIRM_FAQ_PAGE_KEY_MIGRATION=${CMS_SCHEMA_VERSION}`)
}

const directus = createDirectusAdminClient({ baseUrl, token })
const before = await readFaqPageKeyMigrationSnapshot(directus)
const plan = buildFaqPageKeyMigrationPlan(before)
for (const change of plan.changes) {
  console.log(`plan collection=faqs id=${change.id} fields=${Object.keys(change.patch).join(',')}`)
}
for (const issue of plan.issues) console.error(`blocked ${issue}`)
if (plan.issues.length) process.exit(1)
if (!apply) {
  console.log(`${plan.changes.length} FAQ legacy field change(s) planned; no CMS writes performed.`)
  process.exit(0)
}
const backup = await writeCmsMigrationSnapshot(before)
console.log(`snapshot=${backup.path} sha256=${backup.sha256}`)
await applyFaqPageKeyMigrationPlan(directus, plan, { apply: true })
const after = await readFaqPageKeyMigrationSnapshot(directus)
const verification = buildFaqPageKeyMigrationPlan(after)
if (verification.issues.length || verification.changes.length) {
  throw new Error(
    `post_migration_verify_failed issues=${verification.issues.length} changes=${verification.changes.length}`
  )
}
console.log('FAQ legacy page_key migration complete with zero remaining changes.')
