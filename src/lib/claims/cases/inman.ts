import { caseClaim, fallbackSource } from './shared'

export const INMAN_CASE_CLAIMS = {
  inmanInventoryManagement: caseClaim(
    'inman_inventory_management',
    'All-channel unified management',
    '全渠道统一管理',
    '',
    'Inman inventory-management capability',
    fallbackSource('inman', 'stats[0]')
  ),
  inmanFulfilment: caseClaim(
    'inman_fulfilment_capability',
    'Synchronized multi-platform dispatch',
    '多平台同步发货',
    '',
    'Inman fulfilment capability',
    fallbackSource('inman', 'stats[1]')
  ),
} as const
