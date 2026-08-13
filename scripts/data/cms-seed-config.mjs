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
  APPROVED_CASE_DETAIL_SEEDS,
  APPROVED_CASE_STAT_SEEDS,
  APPROVED_PUBLICATION_SEEDS,
  APPROVED_SERVICE_FEATURE_SEEDS,
  APPROVED_SERVICE_PAGE_SEEDS,
  APPROVED_SERVICE_STAT_SEEDS,
  APPROVED_SITE_SETTING_SEEDS,
  APPROVED_UNIFIED_CASE_SEEDS,
} from './approved-cms-page-seeds.mjs'
import { FAQ_PAGE_SEEDS } from './content-management-collection-definitions.mjs'

const omit = (item, excluded) =>
  Object.fromEntries(Object.entries(item).filter(([field]) => !excluded.includes(field)))

export const CMS_SEEDS = {
  homepage_content: [
    {
      status: 'published',
      key: 'main',
      stats: APPROVED_HOMEPAGE_STATS.map(({ value, label, unit, detail }) => ({
        value,
        label,
        unit,
        detail,
      })),
    },
  ],
  homepage_stats: APPROVED_HOMEPAGE_STATS.map((item) => omit(item, ['id'])),
  services: APPROVED_SERVICES.map((item) => omit(item, ['id'])),
  warehouses: APPROVED_WAREHOUSES.map((item) => omit(item, ['aliases'])),
  cases: APPROVED_UNIFIED_CASE_SEEDS,
  news: [],
  faqs: APPROVED_FAQ_SEEDS,
  faq_pages: FAQ_PAGE_SEEDS,
  case_details: APPROVED_CASE_DETAIL_SEEDS,
  case_stats: APPROVED_CASE_STAT_SEEDS,
  publications: APPROVED_PUBLICATION_SEEDS,
  service_pages: APPROVED_SERVICE_PAGE_SEEDS,
  service_stats: APPROVED_SERVICE_STAT_SEEDS,
  service_features: APPROVED_SERVICE_FEATURE_SEEDS,
  about_content: APPROVED_ABOUT_CONTENT_SEEDS,
  about_history: APPROVED_ABOUT_HISTORY_SEEDS,
  about_honors: APPROVED_ABOUT_HONOR_SEEDS,
  site_settings: APPROVED_SITE_SETTING_SEEDS,
  contact_leads: [],
}

export const CMS_SEED_IDENTITIES = {
  homepage_content: ['key'],
  homepage_stats: ['sort'],
  services: ['slug'],
  warehouses: ['name'],
  cases: ['label'],
  news: ['slug'],
  faqs: ['page_key', 'sort'],
  faq_pages: ['key'],
  case_details: ['slug'],
  case_stats: ['case_slug', 'sort'],
  publications: ['issue'],
  service_pages: ['slug'],
  service_stats: ['service_slug', 'sort'],
  service_features: ['service_slug', 'sort'],
  about_content: ['key'],
  about_history: ['year'],
  about_honors: ['sort'],
  site_settings: ['key'],
  contact_leads: ['id'],
}

export const CMS_SEED_COUNTS = {
  cases: APPROVED_UNIFIED_CASE_SEEDS.length,
  faqs: APPROVED_FAQ_SEEDS.length,
  servicePages: APPROVED_SERVICE_PAGE_SEEDS.length,
}
