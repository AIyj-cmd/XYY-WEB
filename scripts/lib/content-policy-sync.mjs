import { URLSearchParams } from 'node:url'

import { CMS_CONTENT_COLLECTIONS } from '../../config/cms-collections.mjs'

export const DEFAULT_CONTENT_POLICY_NAME = 'Website Content Read-Only'

function relationId(value) {
  return value && typeof value === 'object' ? value.id : value
}

export async function resolveContentPolicy(directus, options = {}) {
  if (options.policyId) return { id: options.policyId, name: options.policyName || '' }

  const policyName = options.policyName || DEFAULT_CONTENT_POLICY_NAME
  const query = new URLSearchParams({
    'filter[name][_eq]': policyName,
    limit: '2',
    fields: 'id,name',
  })
  const policies = await directus.request('GET', `/policies?${query}`)
  const matches = Array.isArray(policies)
    ? policies.filter((policy) => policy.name === policyName)
    : []

  if (matches.length !== 1) {
    throw new Error(
      `Expected one Directus policy named "${policyName}", found ${matches.length}. ` +
        'Create or rename the policy, or set DIRECTUS_CONTENT_POLICY_ID explicitly.'
    )
  }
  return matches[0]
}

export async function syncContentReadPermissions(directus, options = {}) {
  const collections = options.collections || CMS_CONTENT_COLLECTIONS
  const publishedOnly = options.publishedOnly === true
  const policy = await resolveContentPolicy(directus, options)
  const query = new URLSearchParams({
    'filter[policy][_eq]': policy.id,
    'filter[action][_eq]': 'read',
    limit: '-1',
    fields: 'id,policy,collection,action',
  })
  const permissions = await directus.request('GET', `/permissions?${query}`)
  const existing = new Map(
    (Array.isArray(permissions) ? permissions : [])
      .filter((permission) => relationId(permission.policy) === policy.id)
      .map((permission) => [permission.collection, permission])
  )

  let created = 0
  let updated = 0
  for (const collection of collections) {
    const body = {
      policy: policy.id,
      collection,
      action: 'read',
      permissions: publishedOnly ? { status: { _eq: 'published' } } : null,
      validation: null,
      presets: null,
      fields: ['*'],
    }
    const current = existing.get(collection)
    if (current?.id) {
      await directus.request('PATCH', `/permissions/${current.id}`, body)
      updated += 1
    } else {
      await directus.request('POST', '/permissions', body)
      created += 1
    }
  }

  return { policy, created, updated, total: collections.length }
}
