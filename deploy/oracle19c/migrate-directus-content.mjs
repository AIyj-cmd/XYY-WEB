#!/usr/bin/env node

import { chmod, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  directusRequest,
  readAllItems,
  readFieldDefinitions,
} from './lib/directus-transfer-api.mjs'
import {
  analyzeTransferFields,
  contentDigest,
  normalizeTransferItem,
} from './lib/migration-data.mjs'

const required = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}
const timestamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z')

const source = {
  url: required('SOURCE_DIRECTUS_URL').replace(/\/+$/, ''),
  token: required('SOURCE_DIRECTUS_TOKEN'),
}
const target = {
  url: required('TARGET_DIRECTUS_URL').replace(/\/+$/, ''),
  token: required('TARGET_DIRECTUS_TOKEN'),
}
const backupDir = process.env.MIGRATION_BACKUP_DIR || `/var/backups/xyy-directus/${timestamp()}`
const collections = (
  process.env.MIGRATION_COLLECTIONS ||
  'homepage_stats,services,warehouses,cases,news,faqs,case_details,case_stats,publications,service_pages,service_stats,service_features,about_content,about_history,about_honors,site_settings,contact_leads'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

await Promise.all([
  directusRequest(source.url, source.token, '/users/me'),
  directusRequest(target.url, target.token, '/users/me'),
])
await mkdir(backupDir, { recursive: true, mode: 0o700 })
await chmod(backupDir, 0o700)

const report = {
  started_at: new Date().toISOString(),
  source: source.url,
  target: target.url,
  identity_strategy: 'primary keys regenerated; relational collections rejected',
  collections: {},
}

for (const collection of collections) {
  process.stdout.write(`[migrate] ${collection}: `)
  const [sourceItems, targetItems, definitions] = await Promise.all([
    readAllItems(source.url, source.token, collection),
    readAllItems(target.url, target.token, collection),
    readFieldDefinitions(target.url, target.token, collection),
  ])
  if (targetItems.length) {
    throw new Error(`${collection}: target is not empty (${targetItems.length} items)`)
  }

  const { fields, primaryKey } = analyzeTransferFields(definitions, collection)
  const transferItems = sourceItems.map((item) => normalizeTransferItem(item, fields))
  await writeFile(
    path.join(backupDir, `${collection}.source.json`),
    `${JSON.stringify(sourceItems, null, 2)}\n`,
    { mode: 0o600 }
  )
  await writeFile(
    path.join(backupDir, `${collection}.transfer.json`),
    `${JSON.stringify(transferItems, null, 2)}\n`,
    { mode: 0o600 }
  )

  for (const item of transferItems) {
    await directusRequest(target.url, target.token, `/items/${encodeURIComponent(collection)}`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  const imported = (await readAllItems(target.url, target.token, collection)).map((item) =>
    normalizeTransferItem(item, fields)
  )
  const sourceDigest = contentDigest(transferItems)
  const targetDigest = contentDigest(imported)
  if (transferItems.length !== imported.length || sourceDigest !== targetDigest) {
    throw new Error(`${collection}: content verification failed`)
  }

  report.collections[collection] = {
    count: imported.length,
    sha256: targetDigest,
    regenerated_primary_key: primaryKey,
  }
  console.log(`${imported.length} items, verified`)
}

report.finished_at = new Date().toISOString()
await writeFile(
  path.join(backupDir, 'migration-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  { mode: 0o600 }
)
console.log(`[ok] migration backup and report: ${backupDir}`)
