import { CMS_LEGACY_FIELD_ALLOWLIST } from '../../config/cms-contract.mjs'

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value ?? {}, key)

const required = (field) => field?.meta?.required === true || field?.schema?.is_nullable === false
const unique = (field) => field?.schema?.is_unique === true

const error = (kind, collection, field, expected, actual) =>
  `migration_required:${kind} collection=${collection}${field ? ` field=${field}` : ''} expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`

const legacyException = (collection, field, allowlist) =>
  allowlist.find((entry) => entry.collection === collection && entry.field === field)

export function validateCollectionSnapshot(contract, snapshot, options = {}) {
  const allowlist = options.legacyAllowlist ?? CMS_LEGACY_FIELD_ALLOWLIST
  const errors = []
  const warnings = []
  const collection = contract.name
  const actualCollection = snapshot.collection ?? {}
  const expectedSingleton = Boolean(contract.meta?.singleton)
  const actualSingleton = Boolean(actualCollection.meta?.singleton)
  if (expectedSingleton !== actualSingleton) {
    errors.push(error('singleton', collection, '', expectedSingleton, actualSingleton))
  }

  const actualFields = new Map((snapshot.fields ?? []).map((field) => [field.field, field]))
  const contractFields = new Set([
    ...(contract.fields ?? []).map(({ field }) => field),
    ...(contract.relations ?? []).map(({ field }) => field),
  ])
  for (const exception of options.validateLegacyAllowlist === false ? [] : allowlist) {
    if (exception.collection === collection && !contractFields.has(exception.field)) {
      errors.push(
        error('unknown_legacy_exception', collection, exception.field, 'contract field', null)
      )
    }
  }
  for (const expected of contract.fields ?? []) {
    const actual = actualFields.get(expected.field)
    if (!actual) {
      errors.push(error('missing_field', collection, expected.field, expected.type, null))
      continue
    }
    if (actual.type !== expected.type) {
      const exception = legacyException(collection, expected.field, allowlist)
      if (exception) {
        warnings.push(
          `legacy_field collection=${collection} field=${expected.field} reason=${exception.reason} remove_when=${exception.removeWhen}`
        )
      } else {
        errors.push(error('field_type', collection, expected.field, expected.type, actual.type))
      }
    }
    if (required(expected) !== required(actual)) {
      errors.push(
        error('required', collection, expected.field, required(expected), required(actual))
      )
    }
    if (unique(expected) !== unique(actual)) {
      errors.push(error('unique', collection, expected.field, unique(expected), unique(actual)))
    }
    if (
      hasOwn(expected.schema, 'default_value') &&
      expected.schema.default_value !== actual.schema?.default_value
    ) {
      errors.push(
        error(
          'default',
          collection,
          expected.field,
          expected.schema.default_value,
          actual.schema?.default_value
        )
      )
    }
  }

  const actualRelations = snapshot.relations ?? []
  for (const expected of contract.relations ?? []) {
    const actual = actualRelations.find((relation) => relation.field === expected.field)
    if (!actual) {
      const exception = legacyException(collection, expected.field, allowlist)
      if (exception) {
        warnings.push(
          `legacy_relation collection=${collection} field=${expected.field} reason=${exception.reason} remove_when=${exception.removeWhen}`
        )
      } else {
        errors.push(
          error('missing_relation', collection, expected.field, expected.related_collection, null)
        )
      }
      continue
    }
    if (actual.related_collection !== expected.related_collection) {
      errors.push(
        error(
          'relation_target',
          collection,
          expected.field,
          expected.related_collection,
          actual.related_collection
        )
      )
    }
    const expectedDelete = expected.schema?.on_delete ?? null
    const actualDelete = actual.schema?.on_delete ?? null
    if (expectedDelete !== actualDelete) {
      errors.push(
        error('relation_on_delete', collection, expected.field, expectedDelete, actualDelete)
      )
    }
  }

  if (contract.lifecycle === 'active') {
    const identities = new Map()
    for (const record of snapshot.records ?? []) {
      const values = contract.identity.fields.map((field) => record[field])
      if (values.some((value) => value === undefined || value === null || value === '')) {
        errors.push(
          error('identity_missing', collection, contract.identity.fields.join(','), 'set', values)
        )
        continue
      }
      const signature = JSON.stringify(values)
      if (identities.has(signature)) {
        errors.push(
          error(
            'identity_duplicate',
            collection,
            contract.identity.fields.join(','),
            'unique',
            values
          )
        )
      }
      identities.set(signature, true)
    }
  }

  return { errors, warnings }
}

export function assertCollectionSnapshot(contract, snapshot, options) {
  const result = validateCollectionSnapshot(contract, snapshot, options)
  if (result.errors.length) throw new Error(result.errors.join('\n'))
  return result
}

export async function loadCollectionSnapshot(directus, contract) {
  const identityFields = contract.identity.fields.map(encodeURIComponent).join(',')
  const [collection, fields, relations, itemsPayload] = await Promise.all([
    directus.request('GET', `/collections/${contract.name}`),
    directus.request('GET', `/fields/${contract.name}`),
    contract.relations?.length
      ? directus.request('GET', `/relations/${contract.name}`)
      : Promise.resolve([]),
    contract.lifecycle !== 'active'
      ? Promise.resolve({ data: [] })
      : directus.request(
          'GET',
          `/items/${contract.name}?limit=-1&fields=${identityFields}`,
          undefined,
          { unwrapData: false }
        ),
  ])
  const records = Array.isArray(itemsPayload?.data)
    ? itemsPayload.data
    : itemsPayload?.data
      ? [itemsPayload.data]
      : []
  const result = assertCollectionSnapshot(contract, { collection, fields, relations, records })
  return { result, records }
}
