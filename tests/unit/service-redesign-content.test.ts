import { describe, expect, it } from 'vitest'
import {
  groupReturnFeatures,
  hasReturnContent,
} from '@/components/service/redesign/returns-content'

describe('return inspection content grouping', () => {
  it('keeps every recognized and unknown feature exactly once', () => {
    const features = [
      '四级质检评定示例',
      '服装专项检查',
      '鞋类专项检查',
      'AQL质检规则',
      '全程视频举证',
      '修复联动上架',
      '改名后的补充说明',
    ].map((title) => ({ title, desc: `${title}完整说明` }))
    const grouped = groupReturnFeatures(features)
    const rendered = Object.values(grouped).flat()

    expect(rendered).toHaveLength(features.length)
    expect(rendered.map(({ title }) => title)).toEqual(features.map(({ title }) => title))
    expect(grouped.other[0]?.title).toBe('改名后的补充说明')
  })

  it('keeps partial CMS content available without reviving an all-empty page', () => {
    const empty = {
      h1: '',
      h1sub: '',
      heroDesc: '',
      contentDesc: '',
      features: [],
      stats: [],
    }
    expect(hasReturnContent(empty as never, 0)).toBe(false)
    expect(hasReturnContent({ ...empty, contentDesc: '仍可显示的说明' } as never, 0)).toBe(true)
    expect(hasReturnContent(empty as never, 1)).toBe(true)
  })
})
