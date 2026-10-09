#!/usr/bin/env node

import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import {
  applyEnglishNewsSchemaPlan,
  buildEnglishNewsSchemaPlan,
} from './lib/english-news-schema-migration.mjs'

const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const apply = process.argv.includes('--apply')
const target = process.argv.find((argument) => argument.startsWith('--target='))?.slice(9)
const environment = process.argv
  .find((argument) => argument.startsWith('--confirm-environment='))
  ?.slice(22)

if (!baseUrl || !token) throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN are required')
if (apply && (!target || !environment || target !== baseUrl)) {
  throw new Error('Apply requires exact --target and --confirm-environment matching DIRECTUS_URL')
}
if (apply && process.env.CONFIRM_ENGLISH_NEWS_SCHEMA !== `${target}:${environment}`) {
  throw new Error('Apply requires exact CONFIRM_ENGLISH_NEWS_SCHEMA target:environment marker')
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
const verification = buildEnglishNewsSchemaPlan(await directus.request('GET', '/fields/news'))
if (verification.aliases.length || verification.fields.length) {
  throw new Error('english_news_schema_post_apply_verify_failed')
}
console.log(
  `Applied ${result.aliasesApplied} alias(es) and ${result.fieldsApplied} field(s); reread is zero-change.`
)
