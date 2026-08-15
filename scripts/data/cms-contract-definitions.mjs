import { bindCmsCollectionDefinitions, CMS_SCHEMA_VERSION } from '../../config/cms-contract.mjs'
import { CMS_COLLECTION_DEFINITIONS } from './cms-collection-definitions.mjs'

export { CMS_SCHEMA_VERSION }

const RETIRED_LEGACY_IDENTITY_FIELDS = {
  homepage_stats: new Set(['metric_key']),
  case_stats: new Set(['metric_key']),
  service_stats: new Set(['metric_key']),
  service_features: new Set(['content_key']),
}

const CURRENT_STRING_FIELDS = new Set(['cases.metrics', 'news.summary', 'news.published_at'])

function alignWithCurrentCmsContract(definition) {
  const retiredFields = RETIRED_LEGACY_IDENTITY_FIELDS[definition.name] ?? new Set()
  return {
    ...definition,
    fields: (definition.fields ?? [])
      .filter(({ field }) => !retiredFields.has(field))
      .map((field) =>
        CURRENT_STRING_FIELDS.has(`${definition.name}.${field.field}`)
          ? { ...field, type: 'string' }
          : field
      ),
  }
}

export const CMS_COLLECTION_CONTRACTS = bindCmsCollectionDefinitions(
  CMS_COLLECTION_DEFINITIONS.map(alignWithCurrentCmsContract)
)

export const CMS_CONTRACT_BY_COLLECTION = Object.fromEntries(
  CMS_COLLECTION_CONTRACTS.map((contract) => [contract.name, contract])
)
