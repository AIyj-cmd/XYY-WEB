import { caseClaim, publishedSource } from './shared'

export const TOYOUTH_CASE_CLAIMS = {
  toyouthInventoryManagement: caseClaim(
    'toyouth_inventory_management',
    'All-channel',
    '全渠道',
    'unified inventory pool',
    'TOYOUTH inventory-management capability',
    publishedSource('toyouth', 'stats[0]')
  ),
  toyouthBrandOperation: caseClaim(
    'toyouth_brand_operation',
    'Online and offline',
    '线上线下',
    'integrated operations',
    'TOYOUTH brand-operation capability',
    publishedSource('toyouth', 'stats[1]')
  ),
  toyouthFounded: caseClaim(
    'toyouth_founded_year',
    '2006',
    2006,
    '',
    'TOYOUTH founding year',
    publishedSource('toyouth', 'case_description')
  ),
} as const
