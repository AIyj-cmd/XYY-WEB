import { createHash } from 'node:crypto'

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])])
    )
  }
  return value
}

export function createCmsMigrationValueHash(value) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')
}

export function createCmsMigrationPreconditionHash(record, fields, { faqPageKey } = {}) {
  const comparable = Object.fromEntries(
    [...fields].sort().map((field) => [field, canonicalize(record[field])])
  )
  const precondition = faqPageKey === undefined ? comparable : { ...comparable, faqPageKey }
  return createCmsMigrationValueHash(precondition)
}

export function resolveCmsMigrationStableKey({ collection, record, entry, faqPageKey }) {
  if (!entry || typeof entry !== 'object' || !entry.targetStableKey) return null
  if (entry.expectedBeforeSha256) {
    if (!Array.isArray(entry.expectedBeforeFields) || !entry.expectedBeforeFields.length)
      return null
    if (collection === 'faqs' && faqPageKey !== entry.expectedFaqPageKey) return null
    if (
      createCmsMigrationPreconditionHash(record, entry.expectedBeforeFields, { faqPageKey }) !==
      entry.expectedBeforeSha256
    ) {
      return null
    }
    return entry.targetStableKey
  }
  if (
    !entry.expectedBefore ||
    typeof entry.expectedBefore !== 'object' ||
    !Object.keys(entry.expectedBefore).length ||
    !Object.entries(entry.expectedBefore).every(([field, value]) => record[field] === value)
  ) {
    return null
  }
  return entry.targetStableKey
}
