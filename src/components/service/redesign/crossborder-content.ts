import type { FeatureItem, StatItem } from '@/data/service'

export interface CrossborderFeatureGroups {
  warehouse: FeatureItem[]
  labeling: FeatureItem[]
  quality: FeatureItem[]
  returns: FeatureItem[]
  logistics: FeatureItem[]
  support: FeatureItem[]
  other: FeatureItem[]
}

export interface CrossborderStatGroups {
  caseStudy: StatItem[]
  warehouse: StatItem[]
  quality: StatItem[]
  logistics: StatItem[]
  other: StatItem[]
}

export function groupCrossborderFeatures(
  features: readonly FeatureItem[]
): CrossborderFeatureGroups {
  return features.reduce<CrossborderFeatureGroups>(
    (groups, feature) => {
      const target = feature.title.includes('退货')
        ? 'returns'
        : feature.title.includes('物流')
          ? 'logistics'
          : feature.title.includes('换标') || feature.title.includes('包装')
            ? 'labeling'
            : feature.title.includes('质检')
              ? 'quality'
              : feature.title.includes('项目')
                ? 'support'
                : feature.title.includes('仓')
                  ? 'warehouse'
                  : 'other'
      groups[target].push(feature)
      return groups
    },
    { warehouse: [], labeling: [], quality: [], returns: [], logistics: [], support: [], other: [] }
  )
}

export function groupCrossborderStats(stats: readonly StatItem[]): CrossborderStatGroups {
  return stats.reduce<CrossborderStatGroups>(
    (groups, stat) => {
      const target = stat.label.includes('处理规模')
        ? 'caseStudy'
        : stat.label.includes('国内仓')
          ? 'warehouse'
          : stat.label.includes('QC')
            ? 'quality'
            : stat.label.includes('物流')
              ? 'logistics'
              : 'other'
      groups[target].push(stat)
      return groups
    },
    { caseStudy: [], warehouse: [], quality: [], logistics: [], other: [] }
  )
}
