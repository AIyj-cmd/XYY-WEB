import { describe, expect, it } from 'vitest'

import type { Case } from '@/lib/directus'
import { getCaseDescription, getCasePath, getCaseStats } from '@/components/cases/case-display'

const makeCase = (overrides: Partial<Case> = {}): Case => ({
  id: 1,
  category: '测试品类',
  label: '未映射品牌',
  metrics: '',
  details: '完整案例简介',
  tags: [],
  img: '/images/cases/test.webp',
  ...overrides,
})

describe('cases overview display helpers', () => {
  it('uses a non-empty CMS slug before the reviewed label mapping', () => {
    expect(getCasePath(makeCase({ label: 'UR（Urban Revivo）', slug: 'cms-ur' }))).toBe(
      '/cases/cms-ur'
    )
    expect(getCasePath(makeCase({ label: 'UR（Urban Revivo）', slug: ' ' }))).toBe('/cases/ur')
  })

  it('does not invent a detail link for an unmapped case without a slug', () => {
    expect(getCasePath(makeCase())).toBeNull()
  })

  it('keeps the complete details text when the display description is absent', () => {
    expect(getCaseDescription(makeCase({ case_description: '  ' }))).toBe('完整案例简介')
    expect(getCaseDescription(makeCase({ case_description: ' CMS 简介 ' }))).toBe('CMS 简介')
  })

  it('removes blank metric rows and applies the requested visible limit', () => {
    const item = makeCase({
      stats: [
        { label: '有效一', value: '1', unit: '件' },
        { label: ' ', value: '不应显示', unit: '' },
        { label: '无值', value: ' ', unit: '' },
        { label: '有效二', value: '2', unit: '' },
        { label: '有效三', value: '3', unit: '' },
      ],
    })

    expect(getCaseStats(item, 3)).toEqual([
      { label: '有效一', value: '1', unit: '件' },
      { label: '有效二', value: '2', unit: '' },
      { label: '有效三', value: '3', unit: '' },
    ])
    expect(getCaseStats(makeCase({ stats: null }), 4)).toEqual([])
  })
})
