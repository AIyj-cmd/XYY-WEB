import {
  applyIdentityConstraints,
  createNullableIdentityFields,
  planIdentitySchemaPhases,
  planSafeSchemaChanges,
  STABLE_IDENTITY_FIELDS,
  verifyRemoteIdentities,
} from './cms-contract-schema-migration.mjs'
import { planHomepageClaims } from './cms-homepage-claim-migration.mjs'
import {
  createCmsMigrationPreconditionHash,
  createCmsMigrationValueHash,
  resolveCmsMigrationStableKey,
} from './cms-migration-preconditions.mjs'

export { writeCmsMigrationSnapshot } from './cms-contract-snapshot.mjs'
export { createCmsMigrationPreconditionHash, createCmsMigrationValueHash }

export const CMS_CONTRACT_MIGRATION_COLLECTIONS = [
  'homepage_content',
  'faq_pages',
  'faqs',
  'warehouses',
  'about_history',
  'about_honors',
  'news',
]

export const CMS_CONTRACT_SCHEMA_ONLY_COLLECTIONS = ['contact_leads']

const recordId = (record) => String(record.id)
const recordsFor = (snapshot, collection) =>
  snapshot.records?.[collection] ?? snapshot[collection] ?? []

function relatedFaqPageKey(record, snapshot) {
  const relationId =
    typeof record.faq_page === 'object' && record.faq_page ? record.faq_page.id : record.faq_page
  const page = recordsFor(snapshot, 'faq_pages').find(
    (candidate) => String(candidate.id) === String(relationId)
  )
  return page?.key
}

function mappingFor(collection, record, mappings, snapshot) {
  const entry = mappings[collection]?.[recordId(record)]
  const faqPageKey = collection === 'faqs' ? relatedFaqPageKey(record, snapshot) : undefined
  return resolveCmsMigrationStableKey({ collection, record, entry, faqPageKey })
}

function planStableIdentities(snapshot, mappings, changes, issues) {
  for (const [collection, field] of Object.entries(STABLE_IDENTITY_FIELDS)) {
    const records = recordsFor(snapshot, collection)
    const identities = new Map()
    for (const record of records) {
      const mapped = record[field] || mappingFor(collection, record, mappings, snapshot)
      if (!mapped) {
        issues.push(
          `manual_mapping_required collection=${collection} id=${recordId(record)} reason=missing_or_expected_before_mismatch`
        )
        continue
      }
      if (identities.has(mapped)) {
        issues.push(`duplicate_identity collection=${collection} field=${field} value=${mapped}`)
      }
      identities.set(mapped, record.id)
      if (!record[field]) changes.push({ collection, id: record.id, patch: { [field]: mapped } })
    }
  }
}

function planFaqRelations(snapshot, changes, issues) {
  const pages = recordsFor(snapshot, 'faq_pages')
  const pageByKey = new Map()
  const pageById = new Map()
  for (const page of pages) {
    if (pageByKey.has(page.key))
      issues.push(`duplicate_identity collection=faq_pages key=${page.key}`)
    pageByKey.set(page.key, page)
    pageById.set(String(page.id), page)
  }

  const existingChange = new Map(
    changes
      .filter(({ collection }) => collection === 'faqs')
      .map((change) => [String(change.id), change])
  )
  const pageSorts = new Set()
  for (const faq of recordsFor(snapshot, 'faqs')) {
    const relationId =
      typeof faq.faq_page === 'object' && faq.faq_page ? faq.faq_page.id : faq.faq_page
    const relatedPage = relationId ? pageById.get(String(relationId)) : undefined
    const legacyPage = faq.page_key ? pageByKey.get(faq.page_key) : undefined
    const pageForSort = relatedPage ?? legacyPage
    if (pageForSort) {
      const sortSignature = `${pageForSort.key}:${String(faq.sort)}`
      if (pageSorts.has(sortSignature)) {
        issues.push(
          `duplicate_sort collection=faqs page=${pageForSort.key} sort=${String(faq.sort)}`
        )
      }
      pageSorts.add(sortSignature)
    }
    if (relationId && !relatedPage) {
      issues.push(`dangling_relation collection=faqs id=${recordId(faq)} faq_page=${relationId}`)
      continue
    }
    if (!relatedPage && !legacyPage) {
      issues.push(`manual_mapping_required collection=faqs id=${recordId(faq)} relation=faq_page`)
      continue
    }
    const authoritativePage = relatedPage ?? legacyPage
    const patch = existingChange.get(String(faq.id))?.patch ?? {}
    if (!relatedPage) patch.faq_page = authoritativePage.id
    if (faq.page_key !== authoritativePage.key) patch.page_key = authoritativePage.key
    if (Object.keys(patch).length && !existingChange.has(String(faq.id))) {
      changes.push({ collection: 'faqs', id: faq.id, patch })
    }
  }
}

export function buildCmsContractMigrationPlan(snapshot, mappings = {}) {
  const changes = []
  const issues = []
  planStableIdentities(snapshot, mappings, changes, issues)
  planHomepageClaims(recordsFor(snapshot, 'homepage_content'), mappings, changes, issues)
  planFaqRelations(snapshot, changes, issues)
  const { schemaChanges, identityChecks } = planIdentitySchemaPhases(snapshot, changes, issues)
  schemaChanges.push(...planSafeSchemaChanges(snapshot, issues))
  return { changes, schemaChanges, identityChecks, issues }
}

export async function readCmsContractMigrationSnapshot(directus) {
  const snapshot = { records: {}, fields: {} }
  for (const collection of CMS_CONTRACT_MIGRATION_COLLECTIONS) {
    const [value, fields] = await Promise.all([
      directus.request('GET', `/items/${collection}?limit=-1`),
      directus.request('GET', `/fields/${collection}`),
    ])
    snapshot.records[collection] = Array.isArray(value) ? value : value ? [value] : []
    snapshot.fields[collection] = Array.isArray(fields) ? fields : []
  }
  for (const collection of CMS_CONTRACT_SCHEMA_ONLY_COLLECTIONS) {
    const fields = await directus.request('GET', `/fields/${collection}`)
    snapshot.fields[collection] = Array.isArray(fields) ? fields : []
  }
  return snapshot
}

export async function applyCmsContractPlan(directus, plan, { apply = false } = {}) {
  if (plan.issues.length) throw new Error(plan.issues.join('\n'))
  if (!apply) return { applied: 0, schemaApplied: 0 }
  let applied = 0
  let schemaApplied = await createNullableIdentityFields(directus, plan.schemaChanges)
  for (const change of plan.changes) {
    await directus.request('PATCH', `/items/${change.collection}/${change.id}`, change.patch)
    applied += 1
  }
  await verifyRemoteIdentities(directus, plan.identityChecks)
  schemaApplied += await applyIdentityConstraints(directus, plan.schemaChanges)
  return { applied, schemaApplied }
}
