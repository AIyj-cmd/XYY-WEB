import { describe, expect, it } from 'vitest'
import { hasRedesignContent } from '@/components/service/redesign/content-presence'
import {
  groupRepairFeatures,
  repairFeaturesInSourceOrder,
} from '@/components/service/redesign/repair-content'

describe('repair redesign content grouping', () => {
  it('keeps every recognized and renamed feature exactly once', () => {
    const features = [
      '清污处理',
      '面料修复',
      '缝线修复',
      '配饰修复',
      '鞋类专项修复',
      '标识与异味处理',
      '改名后的工艺说明',
    ].map((title) => ({ title, desc: `${title}完整说明` }))
    const sourceOrdered = repairFeaturesInSourceOrder(features)
    const grouped = groupRepairFeatures(features)
    const rendered = Object.values(grouped).flat()

    expect(sourceOrdered.map(({ title }) => title)).toEqual(features.map(({ title }) => title))
    expect(rendered).toHaveLength(features.length)
    expect(rendered.map(({ title }) => title)).toEqual(features.map(({ title }) => title))
    expect(grouped.other[0]?.title).toBe('改名后的工艺说明')
  })

  it('keeps partial content available without reviving a fully empty page', () => {
    const empty = { h1: '', h1sub: '', heroDesc: '', contentDesc: '', features: [], stats: [] }
    expect(hasRedesignContent(empty as never, 0)).toBe(false)
    expect(hasRedesignContent({ ...empty, stats: [{}] } as never, 0)).toBe(true)
    expect(hasRedesignContent(empty as never, 1)).toBe(true)
  })
})
