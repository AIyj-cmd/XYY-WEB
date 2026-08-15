import { CMS_COLLECTION_CONTRACTS } from './cms-contract.mjs'

export function deriveRuntimeReadCollections(contracts) {
  return contracts
    .filter(({ lifecycle, runtimeRead }) => lifecycle === 'active' && runtimeRead !== false)
    .map(({ name }) => name)
}

export const CMS_CONTENT_COLLECTIONS = deriveRuntimeReadCollections(CMS_COLLECTION_CONTRACTS)

export const CMS_LEGACY_COLLECTIONS = CMS_COLLECTION_CONTRACTS.filter(
  ({ lifecycle }) => lifecycle === 'legacy'
).map(({ name }) => name)

export const CMS_PRIVATE_COLLECTIONS = CMS_COLLECTION_CONTRACTS.filter(
  ({ lifecycle }) => lifecycle === 'private'
).map(({ name }) => name)

export const CMS_ALL_COLLECTIONS = CMS_COLLECTION_CONTRACTS.map(({ name }) => name)
