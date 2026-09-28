import { describe, expect, it } from 'vitest'

import { englishClaim } from '@/i18n/claims'
import { getApprovedClaim } from '@/lib/claims'

describe('English claim presentation', () => {
  it('formats approved figures from the claim registry without Chinese unit text', () => {
    const warehouseArea = getApprovedClaim('warehouseArea', 'home')
    const shippingAccuracy = getApprovedClaim('shippingAccuracy', 'product')
    const recognizableAnomalies = getApprovedClaim('recognizableAnomalies', 'tuihuo-zhijian')

    expect(englishClaim('warehouseArea', 'home')).toBe(
      `${new Intl.NumberFormat('en-US').format(Number(warehouseArea.rawValue))} m²`
    )
    expect(englishClaim('shippingAccuracy', 'product')).toBe(
      `${new Intl.NumberFormat('en-US').format(Number(shippingAccuracy.rawValue))}${shippingAccuracy.unit}`
    )
    expect(englishClaim('shippingAccuracy', 'product').endsWith(shippingAccuracy.unit)).toBe(true)
    expect(englishClaim('recognizableAnomalies', 'tuihuo-zhijian')).toBe(
      `${new Intl.NumberFormat('en-US').format(Number(recognizableAnomalies.rawValue))}+ types`
    )
  })

  it('derives the approved dispatch rule from its source value', () => {
    expect(englishClaim('shippingSla', 'xiefu-yuncang')).toBe(
      'Orders placed before 18:00 are dispatched before 24:00 the same day'
    )
  })
})
