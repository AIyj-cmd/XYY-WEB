import { pathToFileURL } from 'node:url'

import { CMS_LEGACY_COLLECTIONS } from '../config/cms-collections.mjs'
import { runRuntimePermissionCli } from './lib/runtime-permission-cli.mjs'
import {
  ASSET_COLLECTIONS,
  CONTENT_COLLECTIONS,
  hasAllowedContactCreateFields,
  hasContactCreatePermission,
  hasContentReadPermission,
  permissionAccess,
} from '../server/runtime-permissions.mjs'

const ACTIONS = ['create', 'read', 'update', 'delete', 'share']
const PRIVILEGED_COLLECTIONS = [
  'directus_users',
  'directus_roles',
  'directus_permissions',
  'directus_policies',
]
const SYSTEM_ENDPOINTS = [
  '/users?limit=1&fields=id',
  '/roles?limit=1&fields=id',
  '/permissions?limit=1&fields=id',
  '/policies?limit=1&fields=id',
]

function authorization(token) {
  return { Authorization: `Bearer ${token}` }
}

async function fetchStatus(fetchImpl, directusUrl, token, path, label) {
  try {
    const response = await fetchImpl(`${directusUrl}${path}`, {
      headers: authorization(token),
    })
    return response.status
  } catch {
    throw new Error(`permission_verification_unreachable: ${label}`)
  }
}

async function readPermissions(fetchImpl, directusUrl, token, label) {
  let response
  try {
    response = await fetchImpl(`${directusUrl}/permissions/me`, {
      headers: authorization(token),
    })
  } catch {
    throw new Error(`permission_verification_unreachable: ${label} permission map`)
  }
  if (!response.ok) throw new Error(`${label} permission check returned ${response.status}`)
  return response.json()
}

function requireNoActions(failures, payload, tokenLabel, collections) {
  for (const collection of collections) {
    for (const action of ACTIONS) {
      if (permissionAccess(payload, collection, action) !== 'none') {
        failures.push(`${tokenLabel} unexpectedly has ${action} access to ${collection}`)
      }
    }
  }
}

function forbiddenProbe(label, token, path) {
  return { label, token, path }
}

export async function verifyRuntimePermissions({
  directusUrl,
  contentToken,
  contactToken,
  fetchImpl = fetch,
}) {
  const normalizedUrl = (directusUrl || '').replace(/\/+$/, '')
  if (!normalizedUrl || !contentToken || !contactToken) {
    throw new Error('runtime_tokens_missing')
  }
  if (contentToken === contactToken) throw new Error('runtime_tokens_must_be_distinct')

  const [contentPermissions, contactPermissions] = await Promise.all([
    readPermissions(fetchImpl, normalizedUrl, contentToken, 'content token'),
    readPermissions(fetchImpl, normalizedUrl, contactToken, 'contact token'),
  ])
  const failures = []

  for (const collection of [...CONTENT_COLLECTIONS, ...ASSET_COLLECTIONS]) {
    if (!hasContentReadPermission(contentPermissions, collection)) {
      failures.push(`content token cannot read ${collection}`)
    }
    for (const action of ['create', 'update', 'delete', 'share']) {
      if (permissionAccess(contentPermissions, collection, action) !== 'none') {
        failures.push(`content token unexpectedly has ${action} access to ${collection}`)
      }
    }
  }

  requireNoActions(failures, contentPermissions, 'content token', [
    ...CMS_LEGACY_COLLECTIONS,
    'contact_leads',
    ...PRIVILEGED_COLLECTIONS,
  ])

  if (!hasContactCreatePermission(contactPermissions)) {
    failures.push('contact token cannot create contact_leads')
  }
  if (!hasAllowedContactCreateFields(contactPermissions)) {
    failures.push('contact token has an unsupported create field permission shape')
  }
  requireNoActions(failures, contactPermissions, 'contact token', [
    ...CONTENT_COLLECTIONS,
    ...ASSET_COLLECTIONS,
    ...CMS_LEGACY_COLLECTIONS,
    ...PRIVILEGED_COLLECTIONS,
  ])
  for (const action of ['read', 'update', 'delete', 'share']) {
    if (permissionAccess(contactPermissions, 'contact_leads', action) !== 'none') {
      failures.push(`contact token unexpectedly has ${action} access to contact_leads`)
    }
  }

  const readProbes = [
    ...CONTENT_COLLECTIONS.map((collection) => ({
      collection,
      path: `/items/${collection}?limit=1&fields=id`,
    })),
    ...ASSET_COLLECTIONS.map((collection) => ({
      collection,
      path: '/files?limit=1&fields=id',
    })),
  ]
  const readStatuses = await Promise.all(
    readProbes.map(({ collection, path }) =>
      fetchStatus(fetchImpl, normalizedUrl, contentToken, path, `content token ${collection}`)
    )
  )
  readStatuses.forEach((status, index) => {
    if (status < 200 || status >= 300) {
      failures.push(`content token request for ${readProbes[index].collection} returned ${status}`)
    }
  })

  const contentForbiddenPaths = [
    ...SYSTEM_ENDPOINTS,
    '/items/contact_leads?limit=1&fields=id',
    ...CMS_LEGACY_COLLECTIONS.map((collection) => `/items/${collection}?limit=1&fields=id`),
  ]
  const contactForbiddenPaths = [
    ...SYSTEM_ENDPOINTS,
    '/items/contact_leads?limit=1&fields=id',
    ...CONTENT_COLLECTIONS.map((collection) => `/items/${collection}?limit=1&fields=id`),
    '/files?limit=1&fields=id',
    ...CMS_LEGACY_COLLECTIONS.map((collection) => `/items/${collection}?limit=1&fields=id`),
  ]
  const probes = [
    ...contentForbiddenPaths.map((path) =>
      forbiddenProbe(`content token ${path}`, contentToken, path)
    ),
    ...contactForbiddenPaths.map((path) =>
      forbiddenProbe(`contact token ${path}`, contactToken, path)
    ),
  ]
  const probeResults = await Promise.all(
    probes.map(async (probe) => ({
      ...probe,
      status: await fetchStatus(fetchImpl, normalizedUrl, probe.token, probe.path, probe.label),
    }))
  )
  for (const probe of probeResults) {
    if (![401, 403].includes(probe.status)) {
      failures.push(`${probe.label} should be forbidden but returned ${probe.status}`)
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    fieldRestrictionMode: 'application_enforced',
    contentCollections: [...CONTENT_COLLECTIONS],
    assetCollections: [...ASSET_COLLECTIONS],
  }
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url
if (isMain) await runRuntimePermissionCli(verifyRuntimePermissions)
