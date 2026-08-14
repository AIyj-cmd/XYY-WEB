import { CMS_CONTENT_COLLECTIONS } from '../config/cms-collections.mjs'

export const CONTENT_COLLECTIONS = CMS_CONTENT_COLLECTIONS

export function resolveRuntimeTokens(env = process.env) {
  const legacyToken = env.DIRECTUS_TOKEN || ''
  const dedicatedContentToken = env.DIRECTUS_CONTENT_TOKEN || ''
  const dedicatedContactToken = env.DIRECTUS_CONTACT_TOKEN || ''

  return {
    contentToken: dedicatedContentToken || legacyToken,
    contactToken: dedicatedContactToken || legacyToken,
    usingLegacyToken: Boolean(legacyToken) && (!dedicatedContentToken || !dedicatedContactToken),
  }
}

export function permissionAccess(payload, collection, action) {
  return payload?.data?.[collection]?.[action]?.access || 'none'
}

export function hasContactCreatePermission(payload) {
  return ['full', 'partial'].includes(permissionAccess(payload, 'contact_leads', 'create'))
}

export function hasContentReadPermission(payload, collection) {
  return ['full', 'partial'].includes(permissionAccess(payload, collection, 'read'))
}

export const CONTACT_CREATE_FIELDS = ['name', 'phone', 'company', 'email', 'service', 'message']

export function hasAllowedContactCreateFields(payload) {
  const fields = payload?.data?.contact_leads?.create?.fields
  if (!Array.isArray(fields)) return false
  if (fields.length === 1 && fields[0] === '*') return true
  const actual = [...fields].sort()
  const expected = [...CONTACT_CREATE_FIELDS].sort()
  return (
    actual.length === expected.length && actual.every((field, index) => field === expected[index])
  )
}
