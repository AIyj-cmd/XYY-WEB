#!/usr/bin/env node

import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import {
  applyEnglishNewsSchemaPlan,
  buildEnglishNewsSchemaPlan,
} from './lib/english-news-schema-migration.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const apply = process.argv.includes('--apply')

if (!baseUrl || !token) throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
if (apply && process.env.CONFIRM_ENGLISH_NEWS_SCHEMA !== 'apply') {
  throw new Error('Apply requires CONFIRM_ENGLISH_NEWS_SCHEMA=apply')
}

const directus = createDirectusAdminClient({ baseUrl, token })
const plan = buildEnglishNewsSchemaPlan(await directus.request('GET', '/fields/news'))
console.log(`English news schema migration mode=${apply ? 'apply' : 'dry-run'}`)
for (const alias of plan.aliases) console.log(`plan alias news.${alias.field}`)
for (const field of plan.fields) console.log(`plan field news.${field.field}`)

if (!apply) {
  console.log(
    `${plan.aliases.length + plan.fields.length} schema change(s) planned; no CMS writes performed.`
  )
  process.exit(0)
}

const result = await applyEnglishNewsSchemaPlan(directus, plan, { apply: true })
console.log(`Applied ${result.aliasesApplied} alias(es) and ${result.fieldsApplied} field(s).`)
