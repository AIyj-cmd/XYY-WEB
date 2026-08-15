#!/usr/bin/env node

import { CMS_COLLECTION_CONTRACTS, CMS_SCHEMA_VERSION } from './data/cms-contract-definitions.mjs'
import { loadCollectionSnapshot } from './lib/cms-contract-runtime.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''

if (!baseUrl || !token) {
  console.error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
  process.exit(1)
}

const directus = createDirectusAdminClient({ baseUrl, token })
const lifecycleCounts = { active: 0, legacy: 0, private: 0 }
const failures = []
const warnings = []

console.log(`CMS schema version: ${CMS_SCHEMA_VERSION}`)

for (const contract of CMS_COLLECTION_CONTRACTS) {
  lifecycleCounts[contract.lifecycle] += 1
  try {
    const { result, records } = await loadCollectionSnapshot(directus, contract)
    warnings.push(...result.warnings)
    console.log(
      `ok collection ${contract.name} lifecycle=${contract.lifecycle} records=${records.length} identity=${contract.identity.fields.join('+')}`
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push(`collection=${contract.name} ${message}`)
    console.error(`fail collection ${contract.name}: ${message}`)
  }
}

for (const warning of warnings) console.warn(`warn ${warning}`)

console.log(
  `CMS contract summary: total=${CMS_COLLECTION_CONTRACTS.length} active=${lifecycleCounts.active} legacy=${lifecycleCounts.legacy} private=${lifecycleCounts.private} warnings=${warnings.length} failures=${failures.length}`
)

try {
  const filesPayload = await directus.request(
    'GET',
    '/files?limit=1&meta=filter_count',
    undefined,
    {
      unwrapData: false,
    }
  )
  console.log(`ok Directus files (${filesPayload?.meta?.filter_count ?? 'unknown'} items)`)
} catch (error) {
  failures.push(`directus_files ${error instanceof Error ? error.message : String(error)}`)
}

if (failures.length) process.exit(1)
