import { caseClaim, publishedSource } from './shared'

export const ROMI_CASE_CLAIMS = {
  romiDailyOutbound: caseClaim(
    'romi_daily_outbound',
    '30,000+',
    30000,
    'units/day',
    'ROMI STUDIO average daily outbound volume',
    publishedSource('romi-studio', 'stats[0]')
  ),
  romiReplenishment: caseClaim(
    'romi_replenishment_capability',
    'Fast replenishment',
    '快速补货',
    '',
    'ROMI STUDIO fulfilment capability',
    publishedSource('romi-studio', 'stats[1]')
  ),
  romiSampleDispatch: caseClaim(
    'romi_livestream_sample_dispatch',
    'Creator sample dispatch',
    '达播寄样',
    '',
    'ROMI STUDIO livestream service',
    publishedSource('romi-studio', 'stats[2]')
  ),
  romiFounded: caseClaim(
    'romi_founded_year',
    '2010',
    2010,
    '',
    'ROMI STUDIO founding year',
    publishedSource('romi-studio', 'case_description')
  ),
  romiEcommerceEntry: caseClaim(
    'romi_ecommerce_entry_year',
    '2019',
    2019,
    '',
    'ROMI STUDIO e-commerce entry year',
    publishedSource('romi-studio', 'case_description')
  ),
  romiDouyinGmvYear: caseClaim(
    'romi_douyin_gmv_year',
    '2024',
    2024,
    '',
    'ROMI STUDIO Douyin GMV reference year',
    publishedSource('romi-studio', 'case_description')
  ),
  romiDouyinGmv: caseClaim(
    'romi_douyin_gmv',
    'CNY 2.25 billion',
    2250000000,
    'GMV',
    'ROMI STUDIO Douyin GMV in the published case',
    publishedSource('romi-studio', 'case_description')
  ),
  romiDouyinRank: caseClaim(
    'romi_douyin_ip_womenswear_rank',
    'first among Douyin IP womenswear brands',
    'TOP1',
    '',
    'ROMI STUDIO Douyin IP womenswear rank',
    publishedSource('romi-studio', 'case_description')
  ),
} as const
