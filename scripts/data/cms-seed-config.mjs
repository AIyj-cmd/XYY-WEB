import {
  APPROVED_HOMEPAGE_STATS,
  APPROVED_SERVICES,
  APPROVED_WAREHOUSES,
} from '../approved-cms-content.mjs'
import { APPROVED_FAQ_SEEDS } from './approved-faq-seeds.mjs'
import {
  APPROVED_ABOUT_CONTENT_SEEDS,
  APPROVED_ABOUT_HISTORY_SEEDS,
  APPROVED_ABOUT_HONOR_SEEDS,
  APPROVED_PUBLICATION_SEEDS,
  APPROVED_SERVICE_PAGE_SEEDS,
  APPROVED_SITE_SETTING_SEEDS,
  APPROVED_UNIFIED_CASE_SEEDS,
} from './approved-cms-page-seeds.mjs'
import { FAQ_PAGE_SEEDS } from './content-management-collection-definitions.mjs'
import { CMS_COLLECTION_CONTRACTS } from './cms-contract-definitions.mjs'

const omit = (item, excluded) =>
  Object.fromEntries(Object.entries(item).filter(([field]) => !excluded.includes(field)))

export const CMS_SEEDS = {
  homepage_content: [
    {
      status: 'published',
      key: 'main',
      stats: APPROVED_HOMEPAGE_STATS.map(({ claimKey, label, detail }) => ({
        claimKey,
        label,
        detail,
      })),
    },
  ],
  services: APPROVED_SERVICES.map((item) => omit(item, ['id'])),
  warehouses: APPROVED_WAREHOUSES.map((item) => omit(item, ['aliases'])),
  cases: APPROVED_UNIFIED_CASE_SEEDS,
  news: [],
  faqs: APPROVED_FAQ_SEEDS,
  faq_pages: FAQ_PAGE_SEEDS,
  publications: APPROVED_PUBLICATION_SEEDS,
  service_pages: APPROVED_SERVICE_PAGE_SEEDS,
  about_content: APPROVED_ABOUT_CONTENT_SEEDS,
  about_history: APPROVED_ABOUT_HISTORY_SEEDS,
  about_honors: APPROVED_ABOUT_HONOR_SEEDS,
  site_settings: APPROVED_SITE_SETTING_SEEDS,
}

export const CMS_SEED_IDENTITIES = Object.fromEntries(
  CMS_COLLECTION_CONTRACTS.filter(({ seedPolicy }) => seedPolicy === 'normal').map(
    ({ name, identity }) => [name, [...identity.fields]]
  )
)

export const CMS_SEED_COUNTS = {
  cases: APPROVED_UNIFIED_CASE_SEEDS.length,
  faqs: APPROVED_FAQ_SEEDS.length,
  servicePages: APPROVED_SERVICE_PAGE_SEEDS.length,
}
