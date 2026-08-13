import { CASE_NEWS_COLLECTION_DEFINITIONS } from './case-news-collection-definitions.mjs'
import { CASE_PUBLICATION_COLLECTION_DEFINITIONS } from './case-publication-collection-definitions.mjs'
import { CONTENT_MANAGEMENT_COLLECTION_DEFINITIONS } from './content-management-collection-definitions.mjs'
import { CORE_CONTENT_COLLECTION_DEFINITIONS } from './core-content-collection-definitions.mjs'
import { FAQ_COLLECTION_DEFINITION } from './faq-collection-definition.mjs'
import { ORGANIZATION_COLLECTION_DEFINITIONS } from './organization-collection-definitions.mjs'
import { SERVICE_CONTENT_COLLECTION_DEFINITIONS } from './service-content-collection-definitions.mjs'

const [homepageStats, services, warehouses, contactLeads] = CORE_CONTENT_COLLECTION_DEFINITIONS

export const CMS_COLLECTION_DEFINITIONS = [
  homepageStats,
  ...CONTENT_MANAGEMENT_COLLECTION_DEFINITIONS,
  services,
  warehouses,
  ...CASE_NEWS_COLLECTION_DEFINITIONS,
  FAQ_COLLECTION_DEFINITION,
  ...CASE_PUBLICATION_COLLECTION_DEFINITIONS,
  ...SERVICE_CONTENT_COLLECTION_DEFINITIONS,
  ...ORGANIZATION_COLLECTION_DEFINITIONS,
  contactLeads,
]
