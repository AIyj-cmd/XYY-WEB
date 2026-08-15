import { CMS_COLLECTION_CONTRACTS } from './cms-contract.mjs'

export const CMS_CONTENT_COLLECTIONS = CMS_COLLECTION_CONTRACTS.filter(
  ({ lifecycle }) => lifecycle !== 'private'
).map(({ name }) => name)

export const CMS_PRIVATE_COLLECTIONS = CMS_COLLECTION_CONTRACTS.filter(
  ({ lifecycle }) => lifecycle === 'private'
).map(({ name }) => name)

export const CMS_ALL_COLLECTIONS = [...CMS_CONTENT_COLLECTIONS, ...CMS_PRIVATE_COLLECTIONS]
