import { CMS_ASSET_COLLECTIONS, CMS_CONTENT_COLLECTIONS } from '../config/cms-collections.mjs'

export const CONTENT_COLLECTIONS = CMS_CONTENT_COLLECTIONS
export const ASSET_COLLECTIONS = CMS_ASSET_COLLECTIONS

export function resolveRuntimeTokens(env = process.env) {
  const contentToken = env.DIRECTUS_CONTENT_TOKEN || ''
  const contactToken = env.DIRECTUS_CONTACT_TOKEN || ''
  const error =
    !contentToken || !contactToken
      ? 'runtime_tokens_missing'
      : contentToken === contactToken
        ? 'runtime_tokens_must_be_distinct'
        : null

  return {
    contentToken,
    contactToken,
    error,
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
