import { describe, expect, it } from 'vitest'
import { caseLocalePair, localizedCasePath } from '@/i18n/case-routes'

describe('English case route helpers', () => {
  it('constructs a pair only for a supplied, validated case slug', () => {
    expect(caseLocalePair('ur')).toEqual(['/cases/ur', '/en/cases/ur'])
    expect(caseLocalePair(undefined)).toBeUndefined()
    expect(caseLocalePair('   ')).toBeUndefined()
  })

  it('keeps English details under the case route', () => {
    expect(localizedCasePath({ slug: 'maxrieny' }, 'en')).toBe('/en/cases/maxrieny')
    expect(localizedCasePath({ slug: 'maxrieny' }, 'zh-CN')).toBe('/cases/maxrieny')
  })
})
