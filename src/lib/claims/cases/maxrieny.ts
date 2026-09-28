import { caseClaim, publishedSource } from './shared'

export const MAXRIENY_CASE_CLAIMS = {
  maxrienyInventory: caseClaim(
    'maxrieny_total_inventory',
    '900,000+',
    900000,
    'units',
    'MAXRIENY total inventory',
    publishedSource('maxrieny', 'stats[0]')
  ),
  maxrienySkus: caseClaim(
    'maxrieny_sku_count',
    '17,000+',
    17000,
    'SKUs',
    'MAXRIENY SKU count',
    publishedSource('maxrieny', 'stats[1]')
  ),
  maxrienyWarehouseArea: caseClaim(
    'maxrieny_warehouse_area',
    '12,000+',
    12000,
    'sq m',
    'MAXRIENY warehouse area',
    publishedSource('maxrieny', 'stats[2]')
  ),
  maxrienyDailyInbound: caseClaim(
    'maxrieny_daily_inbound',
    '20,000+',
    20000,
    'units/day',
    'MAXRIENY average daily inbound volume',
    publishedSource('maxrieny', 'stats[3]')
  ),
  maxrienyDailyB2c: caseClaim(
    'maxrieny_average_daily_b2c',
    '12,000+',
    12000,
    'units/day',
    'MAXRIENY average daily B2C volume',
    publishedSource('maxrieny', 'stats[4]')
  ),
  maxrienyPeakB2c: caseClaim(
    'maxrieny_peak_b2c',
    '75,000+',
    75000,
    'units/day',
    'MAXRIENY peak B2C volume',
    publishedSource('maxrieny', 'stats[5]')
  ),
  maxrienyDailyB2b: caseClaim(
    'maxrieny_average_daily_b2b',
    '11,000+',
    11000,
    'units/day',
    'MAXRIENY average daily B2B volume',
    publishedSource('maxrieny', 'stats[6]')
  ),
  maxrienyPeakB2b: caseClaim(
    'maxrieny_peak_b2b',
    '60,000+',
    60000,
    'units/day',
    'MAXRIENY peak B2B volume',
    publishedSource('maxrieny', 'stats[7]')
  ),
  maxrienyAudienceAge: caseClaim(
    'maxrieny_audience_age_range',
    '28–38',
    '28–38',
    'years old',
    'MAXRIENY audience age range',
    publishedSource('maxrieny', 'case_description')
  ),
  maxrienySpringSummerPrice: caseClaim(
    'maxrieny_spring_summer_price_range',
    'CNY 800–3,500',
    '800–3500',
    '',
    'MAXRIENY spring and summer product price range',
    publishedSource('maxrieny', 'case_description')
  ),
  maxrienyAutumnWinterPrice: caseClaim(
    'maxrieny_autumn_winter_price_range',
    'CNY 1,000–4,500',
    '1000–4500',
    '',
    'MAXRIENY autumn and winter product price range',
    publishedSource('maxrieny', 'case_description')
  ),
} as const
