import { caseClaim, publishedSource } from './shared'

export const UR_CASE_CLAIMS = {
  urInventory: caseClaim(
    'ur_total_inventory',
    '2,600,000+',
    2600000,
    'units',
    'UR total inventory',
    publishedSource('ur', 'stats[0]')
  ),
  urSkus: caseClaim(
    'ur_sku_count',
    '130,000+',
    130000,
    'SKUs',
    'UR SKU count',
    publishedSource('ur', 'stats[1]')
  ),
  urWarehouseArea: caseClaim(
    'ur_warehouse_area',
    '100,000+',
    100000,
    'sq m',
    'UR warehouse area',
    publishedSource('ur', 'stats[2]')
  ),
  urDailyInbound: caseClaim(
    'ur_daily_inbound',
    '60,000+',
    60000,
    'units/day',
    'UR average daily inbound volume',
    publishedSource('ur', 'stats[3]')
  ),
  urPeakB2c: caseClaim(
    'ur_peak_b2c',
    '100,000+',
    100000,
    'units/day',
    'UR peak B2C volume',
    publishedSource('ur', 'stats[4]')
  ),
  urDailyB2c: caseClaim(
    'ur_average_daily_b2c',
    '50,000+',
    50000,
    'units/day',
    'UR average daily B2C volume',
    publishedSource('ur', 'stats[5]')
  ),
  urDailyB2b: caseClaim(
    'ur_average_daily_b2b',
    '20,000+',
    20000,
    'units/day',
    'UR average daily B2B volume',
    publishedSource('ur', 'stats[6]')
  ),
  urDailyReturns: caseClaim(
    'ur_average_daily_returns',
    '30,000+',
    30000,
    'units/day',
    'UR average daily returns volume',
    publishedSource('ur', 'stats[7]')
  ),
  urFlagshipGrowth: caseClaim(
    'ur_flagship_store_growth',
    '116',
    116,
    '%',
    'UR official flagship-store year-on-year growth during a Tmall Super Brand Day',
    publishedSource('ur', 'case_description')
  ),
  urGlobalStores: caseClaim(
    'ur_global_store_count',
    '400+',
    400,
    'stores',
    'UR global retail-store count',
    publishedSource('ur', 'case_description')
  ),
  urMidYearRank: caseClaim(
    'ur_mid_year_womenswear_rank',
    'first in womenswear across Tmall, Douyin and JD',
    '榜首',
    '',
    'UR womenwear rank during the mid-year promotion',
    publishedSource('ur', 'case_description')
  ),
  urCooperationSince: caseClaim(
    'ur_cooperation_since',
    '2017',
    2017,
    '',
    'UR cooperation start year',
    publishedSource('ur', 'tags[0]')
  ),
} as const
