import { CMS_CONTRACT_BY_COLLECTION } from '../data/cms-contract-definitions.mjs'
import {
  applyContractFieldConvergence,
  planContractFieldConvergence,
} from './cms-contract-field-convergence.mjs'

export const STABLE_IDENTITY_FIELDS = {
  faqs: 'content_key',
  warehouses: 'content_key',
  about_history: 'content_key',
  about_honors: 'content_key',
}

const recordsFor = (snapshot, collection) =>
  snapshot.records?.[collection] ?? snapshot[collection] ?? []
const fieldsFor = (snapshot, collection) => snapshot.fields?.[collection]
const required = (field) => field?.meta?.required === true || field?.schema?.is_nullable === false
const unique = (field) => field?.schema?.is_unique === true

function stableFieldDefinition(collection, field) {
  const definition = CMS_CONTRACT_BY_COLLECTION[collection]?.fields?.find(
    (candidate) => candidate.field === field
  )
  if (!definition) throw new Error(`missing stable field contract ${collection}.${field}`)
  return definition
}

export function planIdentitySchemaPhases(snapshot, changes, issues) {
  const schemaChanges = []
  const identityChecks = []
  for (const [collection, field] of Object.entries(STABLE_IDENTITY_FIELDS)) {
    const actualFields = fieldsFor(snapshot, collection)
    if (!actualFields) continue
    const definition = stableFieldDefinition(collection, field)
    const actual = actualFields.find((candidate) => candidate.field === field)
    if (!actual) {
      schemaChanges.push({ phase: 'create_nullable', collection, field, definition })
    }

    const simulated = recordsFor(snapshot, collection).map((record) => {
      const change = changes.find(
        (candidate) => candidate.collection === collection && candidate.id === record.id
      )
      return change ? { ...record, ...change.patch } : record
    })
    const values = simulated.map((record) => record[field])
    if (values.some((value) => value === undefined || value === null || value === '')) {
      issues.push(`migration_required:identity_null collection=${collection} field=${field}`)
      continue
    }
    if (new Set(values).size !== values.length) {
      issues.push(`migration_required:identity_duplicate collection=${collection} field=${field}`)
      continue
    }
    if (!actual || !required(actual)) schemaChanges.push({ phase: 'require', collection, field })
    if (!actual || !unique(actual)) schemaChanges.push({ phase: 'unique', collection, field })
    if (!actual || !required(actual) || !unique(actual)) {
      identityChecks.push({ collection, field, expectedCount: simulated.length })
    }
  }
  return { schemaChanges, identityChecks }
}

export function planSafeSchemaChanges(snapshot, issues) {
  const schemaChanges = planContractFieldConvergence(snapshot, issues)

  const newsFields = fieldsFor(snapshot, 'news')
  if (newsFields) {
    const slug = newsFields.find(({ field }) => field === 'slug')
    if (!slug) {
      issues.push('migration_required:missing_field collection=news field=slug')
    } else if (!unique(slug)) {
      const values = recordsFor(snapshot, 'news').map((record) => record.slug)
      if (values.some((value) => typeof value !== 'string' || !value.trim())) {
        issues.push('data_validation_required collection=news field=slug reason=empty')
      } else if (new Set(values).size !== values.length) {
        issues.push('data_validation_required collection=news field=slug reason=duplicate')
      } else {
        schemaChanges.push({ phase: 'unique', collection: 'news', field: 'slug' })
      }
    }
  }

  const contactFields = fieldsFor(snapshot, 'contact_leads')
  if (contactFields) {
    for (const [field, value] of [
      ['status', 'new'],
      ['source', 'website'],
    ]) {
      const actual = contactFields.find((candidate) => candidate.field === field)
      if (!actual) {
        issues.push(`migration_required:missing_field collection=contact_leads field=${field}`)
      } else if (actual.schema?.default_value !== value) {
        schemaChanges.push({ phase: 'default', collection: 'contact_leads', field, value })
      }
    }
  }
  return schemaChanges
}

export async function createNullableIdentityFields(directus, schemaChanges) {
  let applied = 0
  for (const change of schemaChanges.filter(({ phase }) => phase === 'create_nullable')) {
    await directus.request('POST', `/fields/${change.collection}`, {
      field: change.field,
      type: change.definition.type,
      meta: { ...change.definition.meta, required: false, readonly: true },
      schema: { ...change.definition.schema, is_nullable: true, is_unique: false },
    })
    applied += 1
  }
  return applied
}

export async function verifyRemoteIdentities(directus, checks) {
  for (const check of checks) {
    const payload = await directus.request(
      'GET',
      `/items/${check.collection}?limit=-1&fields=id,${encodeURIComponent(check.field)}`
    )
    const records = Array.isArray(payload) ? payload : payload ? [payload] : []
    if (records.length !== check.expectedCount) {
      throw new Error(
        `migration_required:identity_count collection=${check.collection} field=${check.field} expected=${check.expectedCount} actual=${records.length}`
      )
    }
    const values = records.map((record) => record[check.field])
    if (values.some((value) => value === undefined || value === null || value === '')) {
      throw new Error(
        `migration_required:identity_null collection=${check.collection} field=${check.field}`
      )
    }
    if (new Set(values).size !== values.length) {
      throw new Error(
        `migration_required:identity_duplicate collection=${check.collection} field=${check.field}`
      )
    }
  }
}

export async function applyIdentityConstraints(directus, schemaChanges) {
  let applied = await applyContractFieldConvergence(directus, schemaChanges)
  for (const change of schemaChanges.filter(({ phase }) => phase === 'require')) {
    await directus.request('PATCH', `/fields/${change.collection}/${change.field}`, {
      meta: { required: true, readonly: true },
      schema: { is_nullable: false },
    })
    applied += 1
  }
  for (const change of schemaChanges.filter(({ phase }) => phase === 'unique')) {
    await directus.request('PATCH', `/fields/${change.collection}/${change.field}`, {
      schema: { is_unique: true },
    })
    applied += 1
  }
  for (const change of schemaChanges.filter(({ phase }) => phase === 'default')) {
    await directus.request('PATCH', `/fields/${change.collection}/${change.field}`, {
      schema: { default_value: change.value },
    })
    applied += 1
  }
  return applied
}
