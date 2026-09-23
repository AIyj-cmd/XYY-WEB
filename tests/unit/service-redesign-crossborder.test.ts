import { describe, expect, it } from 'vitest'
import {
  groupCrossborderFeatures,
  groupCrossborderStats,
} from '@/components/service/redesign/crossborder-content'
import { CLAIM_TEXT } from '@/lib/claims'

describe('crossborder content grouping', () => {
  it('keeps recognized, renamed, and unknown features exactly once', () => {
    const features = [
      '跨境备货仓配',
      '项目质检',
      '换标换包装',
      '跨境退货处理',
      '物流资源协同',
      '跨境项目支持',
      '新命名能力',
    ].map((title) => ({ title, desc: `${title}完整说明` }))

    const grouped = groupCrossborderFeatures(features)
    expect(
      Object.values(grouped)
        .flat()
        .map(({ title }) => title)
        .sort()
    ).toEqual(features.map(({ title }) => title).sort())
    expect(grouped.labeling.map(({ title }) => title)).toEqual(['换标换包装'])
    expect(grouped.quality.map(({ title }) => title)).toEqual(['项目质检'])
    expect(grouped.other.map(({ title }) => title)).toEqual(['新命名能力'])
  })

  it('places every stat by its stated scope without using positional data', () => {
    const stats = [
      { stat: CLAIM_TEXT.returnTurnaround, label: '国内仓退货处理', sub: '质检与二次处理' },
      { stat: 'AQL 1.0–6.5', label: '合作QC团队', sub: '按项目执行' },
      { stat: 'EMS等', label: '物流资源协同', sub: '跨境专线' },
      { stat: '千万件级', label: '处理规模', sub: 'Urbanic合作案例' },
      { stat: '按需', label: '新范围', sub: '项目确认' },
    ]

    const grouped = groupCrossborderStats(stats)
    expect(
      Object.values(grouped)
        .flat()
        .map(({ stat }) => stat)
        .sort()
    ).toEqual(stats.map(({ stat }) => stat).sort())
    expect(grouped.warehouse).toHaveLength(1)
    expect(grouped.quality).toHaveLength(1)
    expect(grouped.logistics).toHaveLength(1)
    expect(grouped.caseStudy).toHaveLength(1)
    expect(grouped.other).toHaveLength(1)
  })
})
