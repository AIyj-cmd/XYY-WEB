import { getApprovedClaim, type BrandClaimKey } from '@/lib/claims'

export type { SiteLocale } from './routes'

const units: Record<string, string> = {
  '㎡': ' m²',
  家: '',
  个: '',
  名: '',
  小时: ' hours',
  件: ' units',
  种: ' types',
  '单/日': ' orders/day',
  SKU: ' SKUs',
  '%': '%',
}

export function englishClaim(key: BrandClaimKey, scope: string) {
  const claim = getApprovedClaim(key, scope)
  if (key === 'shippingSla') {
    const [cutoff, dispatch] = String(claim.rawValue).split('/')
    if (!/^\d{2}:\d{2}$/.test(cutoff) || !/^\d{2}:\d{2}$/.test(dispatch)) {
      throw new Error(`Unsupported approved English claim presentation: ${key}`)
    }
    return `Orders placed before ${cutoff} are dispatched before ${dispatch} the same day`
  }
  if (typeof claim.rawValue === 'number') {
    const plus = claim.displayValue.includes('+') ? '+' : ''
    const unit = units[claim.unit]
    if (unit === undefined)
      throw new Error(`Unsupported approved English claim unit: ${claim.unit}`)
    return `${new Intl.NumberFormat('en-US').format(claim.rawValue)}${plus}${unit}`
  }
  throw new Error(`Unsupported approved English claim presentation: ${key}`)
}
