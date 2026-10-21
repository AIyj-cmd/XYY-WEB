#!/usr/bin/env node

import { URLSearchParams } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

import { createDirectusAdminClient } from './lib/directus-admin.mjs'

const apply = process.argv.includes('--apply')
const baseUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''
const target = process.argv.find((arg) => arg.startsWith('--target='))?.slice(9)
const environment = process.argv.find((arg) => arg.startsWith('--confirm-environment='))?.slice(22)
const policyId = process.env.DIRECTUS_CONTENT_POLICY_ID || ''

const preview = {
  collection: 'english_news',
  action: 'read',
  fields: ['*'],
  permissions: { status: { _eq: 'published' } },
}
if (!apply) {
  console.log(JSON.stringify({ mode: 'preview', remoteState: 'not_read', ...preview }))
  process.exit(0)
}
if (
  !baseUrl ||
  !token ||
  !policyId ||
  target !== baseUrl ||
  !environment ||
  process.env.CONFIRM_ENGLISH_NEWS_READ_POLICY !== `${target}:${environment}`
)
  throw new Error('apply_requires_exact_target_environment_policy_and_confirmation')

const directus = createDirectusAdminClient({ baseUrl, token })
const query = new URLSearchParams({
  'filter[policy][_eq]': policyId,
  'filter[collection][_eq]': 'english_news',
  'filter[action][_eq]': 'read',
  limit: '2',
  fields: 'id,policy,collection,action,permissions,validation,presets,fields',
})
const matches = await directus.request('GET', `/permissions?${query}`)
if (!Array.isArray(matches) || matches.length > 1)
  throw new Error('english_news_read_policy_conflict')
const body = { policy: policyId, validation: null, presets: null, ...preview }
const id = (value) => (value && typeof value === 'object' ? value.id : value)
const same = (entry) =>
  entry &&
  id(entry.policy) === policyId &&
  entry.collection === body.collection &&
  entry.action === body.action &&
  isDeepStrictEqual(entry.permissions, body.permissions) &&
  isDeepStrictEqual(entry.validation ?? null, body.validation) &&
  isDeepStrictEqual(entry.presets ?? null, body.presets) &&
  Array.isArray(entry.fields) &&
  entry.fields.length === 1 &&
  entry.fields[0] === '*'
if (
  matches[0] &&
  (!matches[0].id ||
    id(matches[0].policy) !== policyId ||
    matches[0].collection !== body.collection ||
    matches[0].action !== body.action)
)
  throw new Error('english_news_read_policy_scope_mismatch')
if (same(matches[0]))
  console.log(JSON.stringify({ mode: 'apply', collection: 'english_news', changed: 0 }))
else {
  await (matches[0]?.id
    ? await directus.request('PATCH', `/permissions/${matches[0].id}`, body)
    : directus.request('POST', '/permissions', body))
  const reread = await directus.request('GET', `/permissions?${query}`)
  if (!Array.isArray(reread) || reread.length !== 1 || !same(reread[0]))
    throw new Error('english_news_read_policy_readback_failed')
  console.log(JSON.stringify({ mode: 'apply', collection: 'english_news', changed: 1 }))
}
