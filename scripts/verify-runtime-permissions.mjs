import {
  CONTENT_COLLECTIONS,
  hasAllowedContactCreateFields,
  hasContactCreatePermission,
  hasContentReadPermission,
  permissionAccess,
} from '../server/runtime-permissions.mjs'

const directusUrl = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const contentToken = process.env.DIRECTUS_CONTENT_TOKEN || ''
const contactToken = process.env.DIRECTUS_CONTACT_TOKEN || ''

if (!directusUrl || !contentToken || !contactToken) {
  console.error('DIRECTUS_URL, DIRECTUS_CONTENT_TOKEN and DIRECTUS_CONTACT_TOKEN are required')
  process.exit(1)
}

if (contentToken === contactToken) {
  console.error('Content and contact tokens must be different')
  process.exit(1)
}

async function readPermissions(token, label) {
  const response = await fetch(`${directusUrl}/permissions/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`${label} permission check returned ${response.status}`)
  return response.json()
}

async function requestStatus(token, path) {
  const response = await fetch(`${directusUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.status
}

const [contentPermissions, contactPermissions] = await Promise.all([
  readPermissions(contentToken, 'content token'),
  readPermissions(contactToken, 'contact token'),
])

const failures = []
const privilegedCollections = [
  'directus_users',
  'directus_roles',
  'directus_permissions',
  'directus_policies',
]
const sensitiveEndpoints = [
  '/users?limit=1&fields=id',
  '/roles?limit=1&fields=id',
  '/permissions?limit=1&fields=id',
  '/policies?limit=1&fields=id',
  '/items/contact_leads?limit=1&fields=id',
]

for (const collection of CONTENT_COLLECTIONS) {
  if (!hasContentReadPermission(contentPermissions, collection)) {
    failures.push(`content token cannot read ${collection}`)
  }
  for (const action of ['create', 'update', 'delete', 'share']) {
    if (permissionAccess(contentPermissions, collection, action) !== 'none') {
      failures.push(`content token unexpectedly has ${action} access to ${collection}`)
    }
  }
}

for (const collection of ['contact_leads']) {
  for (const action of ['create', 'read', 'update', 'delete', 'share']) {
    if (permissionAccess(contentPermissions, collection, action) !== 'none') {
      failures.push(`content token unexpectedly has ${action} access to ${collection}`)
    }
  }
}

if (!hasContactCreatePermission(contactPermissions)) {
  failures.push('contact token cannot create contact_leads')
}
if (!hasAllowedContactCreateFields(contactPermissions)) {
  failures.push('contact token has an unsupported create field permission shape')
}

for (const collection of [...privilegedCollections, ...CONTENT_COLLECTIONS]) {
  for (const action of ['create', 'read', 'update', 'delete', 'share']) {
    if (permissionAccess(contactPermissions, collection, action) !== 'none') {
      failures.push(`contact token unexpectedly has ${action} access to ${collection}`)
    }
  }
}

for (const action of ['read', 'update', 'delete', 'share']) {
  if (permissionAccess(contactPermissions, 'contact_leads', action) !== 'none') {
    failures.push(`contact token unexpectedly has ${action} access to contact_leads`)
  }
}

const contentReadStatuses = await Promise.all(
  CONTENT_COLLECTIONS.map((collection) =>
    requestStatus(contentToken, `/items/${collection}?limit=1&fields=id`)
  )
)
contentReadStatuses.forEach((status, index) => {
  if (status < 200 || status >= 300) {
    failures.push(`content token request for ${CONTENT_COLLECTIONS[index]} returned ${status}`)
  }
})

const probes = await Promise.all(
  [
    ...sensitiveEndpoints.map((path) => ({
      label: `content token ${path}`,
      token: contentToken,
      path,
    })),
    ...sensitiveEndpoints.map((path) => ({
      label: `contact token ${path}`,
      token: contactToken,
      path,
    })),
    ...CONTENT_COLLECTIONS.map((collection) => ({
      label: `contact token /items/${collection}`,
      token: contactToken,
      path: `/items/${collection}?limit=1&fields=id`,
    })),
  ].map(async (probe) => ({ ...probe, status: await requestStatus(probe.token, probe.path) }))
)

for (const probe of probes) {
  if (![401, 403].includes(probe.status)) {
    failures.push(`${probe.label} should be forbidden but returned ${probe.status}`)
  }
}

if (failures.length) {
  console.error('Runtime Directus permissions are not least-privilege:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `Verified separate least-privilege Directus tokens (${CONTENT_COLLECTIONS.length} content collections + contact create-only).`
)
