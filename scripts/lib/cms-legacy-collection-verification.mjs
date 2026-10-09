import { assertCollectionSnapshot } from './cms-contract-runtime.mjs'

export async function verifyLegacyCollection(directus, definition, collection) {
  const [fields, relations] = await Promise.all([
    directus.request('GET', `/fields/${definition.name}`),
    directus.request('GET', `/relations/${definition.name}`),
  ])
  assertCollectionSnapshot(
    definition,
    { collection, fields, relations, records: [] },
    { validateLegacyAllowlist: false }
  )
  return { status: 'legacy_verified' }
}
