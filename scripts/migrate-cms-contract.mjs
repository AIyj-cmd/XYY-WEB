#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

import { CMS_SCHEMA_VERSION } from '../config/cms-contract.mjs'
import { APPROVED_CMS_CONTRACT_MAPPINGS } from './data/approved-cms-contract-mappings.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import {
  applyCmsContractPlan,
  buildCmsContractMigrationPlan,
  readCmsContractMigrationSnapshot,
  writeCmsMigrationSnapshot,
} from './lib/cms-contract-migration.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const apply = process.argv.includes('--apply')
const mappingArg = process.argv.find((argument) => argument.startsWith('--mapping='))
const mappingPath = mappingArg?.slice('--mapping='.length) || process.env.CMS_CONTRACT_MAPPING_FILE

if (!baseUrl || !token) throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
if (apply && process.env.CONFIRM_CMS_CONTRACT_MIGRATION !== CMS_SCHEMA_VERSION) {
  throw new Error(`Apply requires CONFIRM_CMS_CONTRACT_MIGRATION=${CMS_SCHEMA_VERSION}`)
}

const directus = createDirectusAdminClient({ baseUrl, token })

async function readMappings() {
  if (!mappingPath) return APPROVED_CMS_CONTRACT_MAPPINGS
  const overrides = JSON.parse(await readFile(resolve(mappingPath), 'utf8'))
  return Object.fromEntries(
    [...new Set([...Object.keys(APPROVED_CMS_CONTRACT_MAPPINGS), ...Object.keys(overrides)])].map(
      (collection) => [
        collection,
        {
          ...(APPROVED_CMS_CONTRACT_MAPPINGS[collection] ?? {}),
          ...(overrides[collection] ?? {}),
        },
      ]
    )
  )
}

console.log(
  `CMS contract migration schema=${CMS_SCHEMA_VERSION} mode=${apply ? 'apply' : 'dry-run'}`
)
const mappings = await readMappings()
const before = await readCmsContractMigrationSnapshot(directus)
const plan = buildCmsContractMigrationPlan(before, mappings)

for (const change of plan.changes) {
  console.log(
    `plan collection=${change.collection} id=${change.id} fields=${Object.keys(change.patch).join(',')}`
  )
}
for (const change of plan.schemaChanges) {
  console.log(
    `plan schema collection=${change.collection} field=${change.field} phase=${change.phase}`
  )
}
for (const issue of plan.issues) console.error(`blocked ${issue}`)
if (plan.issues.length) process.exit(1)

if (!apply) {
  console.log(
    `${plan.changes.length} content change(s) and ${plan.schemaChanges.length} schema change(s) planned; no CMS writes performed.`
  )
  process.exit(0)
}

const backup = await writeCmsMigrationSnapshot(before)
console.log(`Migration snapshot: ${backup.path}`)
console.log(`Migration snapshot SHA-256: ${backup.sha256}`)
await applyCmsContractPlan(directus, plan, { apply: true })
const after = await readCmsContractMigrationSnapshot(directus)
const verification = buildCmsContractMigrationPlan(after, mappings)
if (
  verification.issues.length ||
  verification.changes.length ||
  verification.schemaChanges.length
) {
  throw new Error(
    `post_migration_verify_failed issues=${verification.issues.length} changes=${verification.changes.length} schema_changes=${verification.schemaChanges.length}`
  )
}

const schemaVerify = spawnSync(process.execPath, ['scripts/verify-production-cms.mjs'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
})
if (schemaVerify.status !== 0) throw new Error('post_migration_schema_verify_failed')
console.log(
  `${plan.changes.length} content change(s) and ${plan.schemaChanges.length} schema change(s) applied and verified.`
)
