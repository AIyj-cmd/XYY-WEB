import { caseClaim, publishedSource } from './shared'

export const MEIYI_CASE_CLAIMS = {
  meiyiAnnualDispatch: caseClaim(
    'meiyi_annual_dispatch_range',
    '1,000,000–1,500,000',
    '1000000–1500000',
    'units/year',
    'MEIYI annual dispatch volume',
    publishedSource('meiyi', 'stats[0]')
  ),
  meiyiAnnualInspection: caseClaim(
    'meiyi_annual_inspection_range',
    '1,200,000–2,000,000',
    '1200000–2000000',
    'units/year',
    'MEIYI annual inspection volume',
    publishedSource('meiyi', 'stats[1]')
  ),
  meiyiAnnualPutaway: caseClaim(
    'meiyi_annual_putaway_range',
    '1,300,000–1,800,000',
    '1300000–1800000',
    'units/year',
    'MEIYI annual putaway volume',
    publishedSource('meiyi', 'stats[2]')
  ),
  meiyiAnnualPacking: caseClaim(
    'meiyi_annual_packing_range',
    '800,000–1,600,000',
    '800000–1600000',
    'units/year',
    'MEIYI annual packing volume',
    publishedSource('meiyi', 'stats[3]')
  ),
} as const
