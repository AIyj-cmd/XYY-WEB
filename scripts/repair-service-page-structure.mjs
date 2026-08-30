#!/usr/bin/env node

import { APPROVED_SERVICE_PAGE_SEEDS } from './data/approved-cms-page-seeds.mjs'
import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import { assertSync, createCmsSyncRuntime } from './lib/cms-sync-runtime.mjs'
import {
  repairServicePageStructure,
  SERVICE_PAGE_COLLECTION_PATH,
  servicePageStructureMatches,
} from './lib/service-page-structure-sync.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const apply = process.argv.includes('--apply')

if (!baseUrl || !token) {
  console.error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
  process.exit(1)
}

const directus = createDirectusAdminClient({ baseUrl, token })
const runtime = createCmsSyncRuntime({ directus, apply })

console.log(
  `${apply ? 'Applying' : 'Dry run for'} reviewed specialty service-page structure on ${directus.endpointLabel}`
)

const snapshot = {
  service_pages: await directus.request('GET', SERVICE_PAGE_COLLECTION_PATH),
}
await runtime.writeBackup(snapshot, { includeDryRun: true })

await repairServicePageStructure({
  records: snapshot.service_pages,
  seeds: APPROVED_SERVICE_PAGE_SEEDS,
  runtime,
})

if (apply) {
  const verified = await directus.request('GET', SERVICE_PAGE_COLLECTION_PATH)
  assertSync(
    servicePageStructureMatches({ records: verified, seeds: APPROVED_SERVICE_PAGE_SEEDS }),
    'service_pages structure verification failed'
  )
  console.log(`Verified specialty service-page structure on ${directus.endpointLabel}`)
}

console.log(`${runtime.getChangeCount()} change(s) ${apply ? 'applied' : 'planned'}`)
