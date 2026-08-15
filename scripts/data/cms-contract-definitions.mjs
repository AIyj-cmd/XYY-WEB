import { bindCmsCollectionDefinitions, CMS_SCHEMA_VERSION } from '../../config/cms-contract.mjs'
import { CMS_COLLECTION_DEFINITIONS } from './cms-collection-definitions.mjs'

export { CMS_SCHEMA_VERSION }

export const CMS_COLLECTION_CONTRACTS = bindCmsCollectionDefinitions(CMS_COLLECTION_DEFINITIONS)

export const CMS_CONTRACT_BY_COLLECTION = Object.fromEntries(
  CMS_COLLECTION_CONTRACTS.map((contract) => [contract.name, contract])
)
