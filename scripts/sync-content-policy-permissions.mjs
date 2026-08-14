#!/usr/bin/env node

import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import {
  DEFAULT_CONTENT_POLICY_NAME,
  syncContentReadPermissions,
} from './lib/content-policy-sync.mjs'

const baseUrl = (process.env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/+$/, '')
const token = process.env.DIRECTUS_TOKEN || ''

if (!token) {
  console.error('DIRECTUS_TOKEN is required')
  process.exit(1)
}

const directus = createDirectusAdminClient({ baseUrl, token })
const result = await syncContentReadPermissions(directus, {
  policyId: process.env.DIRECTUS_CONTENT_POLICY_ID,
  policyName: process.env.DIRECTUS_CONTENT_POLICY_NAME || DEFAULT_CONTENT_POLICY_NAME,
  publishedOnly: process.env.DIRECTUS_CUSTOM_PERMISSION_RULES === 'true',
})

console.log(
  `✅ ${result.policy.name || result.policy.id}: ${result.total} content permissions synchronized ` +
    `(${result.created} created, ${result.updated} updated).`
)
