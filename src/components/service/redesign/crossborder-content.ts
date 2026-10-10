import type { FeatureItem, StatItem } from '@/data/service'
import type { SiteLocale } from '@/i18n/routes'

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
  features: readonly FeatureItem[],
  locale: SiteLocale = 'zh-CN'
): CrossborderFeatureGroups {
  const english = locale === 'en'
  return features.reduce<CrossborderFeatureGroups>(
    (groups, feature) => {
      const title = feature.title.toLowerCase()
      const target =
        title.includes('退货') || (english && title.includes('return'))
          ? 'returns'
          : title.includes('物流') || (english && title.includes('logistics'))
            ? 'logistics'
            : title.includes('换标') ||
                title.includes('包装') ||
                (english &&
                  (title.includes('relabel') || title.includes('label') || title.includes('pack')))
              ? 'labeling'
              : title.includes('质检') ||
                  (english && (title.includes('quality') || title.includes('inspection')))
                ? 'quality'
                : title.includes('项目') || (english && title.includes('project'))
                  ? 'support'
                  : title.includes('仓') ||
                      (english &&
                        (title.includes('warehouse') || title.includes('stock preparation')))
                    ? 'warehouse'
                    : 'other'
      groups[target].push(feature)
      return groups
    },
    { warehouse: [], labeling: [], quality: [], returns: [], logistics: [], support: [], other: [] }
  )
}

export function groupCrossborderStats(
  stats: readonly StatItem[],
  locale: SiteLocale = 'zh-CN'
): CrossborderStatGroups {
  const english = locale === 'en'
  return stats.reduce<CrossborderStatGroups>(
    (groups, stat) => {
      const label = stat.label.toLowerCase()
      const target =
        label.includes('处理规模') ||
        (english && (label.includes('handling scale') || label.includes('case')))
          ? 'caseStudy'
          : label.includes('国内仓') ||
              (english &&
                (label.includes('domestic warehouse') || label.includes('returns processing')))
            ? 'warehouse'
            : label.includes('qc') || (english && label.includes('quality'))
              ? 'quality'
              : label.includes('物流') || (english && label.includes('logistics'))
                ? 'logistics'
                : 'other'
      groups[target].push(stat)
      return groups
    },
    { caseStudy: [], warehouse: [], quality: [], logistics: [], other: [] }
  )
}
