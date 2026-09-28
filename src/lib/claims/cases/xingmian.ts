import { caseClaim, publishedSource } from './shared'

export const XINGMIAN_CASE_CLAIMS = {
  xingmianInventory: caseClaim(
    'xingmian_total_inventory',
    '3,700,000+',
    3700000,
    'units',
    'Xingmian total inventory',
    publishedSource('xingmian', 'stats[0]')
  ),
  xingmianSkus: caseClaim(
    'xingmian_sku_count',
    '5,000+',
    5000,
    'SKUs',
    'Xingmian SKU count',
    publishedSource('xingmian', 'stats[1]')
  ),
  xingmianWarehouseArea: caseClaim(
    'xingmian_warehouse_area',
    '25,000+',
    25000,
    'sq m',
    'Xingmian warehouse area',
    publishedSource('xingmian', 'stats[2]')
  ),
  xingmianDailyInbound: caseClaim(
    'xingmian_daily_inbound',
    '50,000+',
    50000,
    'units/day',
    'Xingmian average daily inbound volume',
    publishedSource('xingmian', 'stats[3]')
  ),
  xingmianDailyB2c: caseClaim(
    'xingmian_average_daily_b2c',
    '60,000+',
    60000,
    'units/day',
    'Xingmian average daily B2C volume',
    publishedSource('xingmian', 'stats[4]')
  ),
  xingmianPeakB2c: caseClaim(
    'xingmian_peak_b2c',
    '100,000+',
    100000,
    'units/day',
    'Xingmian peak B2C volume',
    publishedSource('xingmian', 'stats[5]')
  ),
  xingmianDailyReturns: caseClaim(
    'xingmian_average_daily_returns',
    '15,000+',
    15000,
    'units/day',
    'Xingmian average daily returns volume',
    publishedSource('xingmian', 'stats[6]')
  ),
} as const
