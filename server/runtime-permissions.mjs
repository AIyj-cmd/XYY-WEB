export const CONTENT_COLLECTIONS = [
  'homepage_stats',
  'homepage_content',
  'faq_pages',
  'services',
  'warehouses',
  'cases',
  'news',
  'faqs',
  'case_details',
  'case_stats',
  'publications',
  'service_pages',
  'service_stats',
  'service_features',
  'about_content',
  'about_history',
  'about_honors',
  'site_settings',
]

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

export const CONTACT_CREATE_FIELDS = ['name', 'phone', 'company', 'email', 'service', 'message']

export function hasRestrictedContactCreateFields(payload) {
  const fields = payload?.data?.contact_leads?.create?.fields
  if (!Array.isArray(fields)) return false
  const actual = [...fields].sort()
  const expected = [...CONTACT_CREATE_FIELDS].sort()
  return (
    actual.length === expected.length && actual.every((field, index) => field === expected[index])
  )
}
