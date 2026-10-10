import type { FeatureItem, StatItem } from '@/data/service'
import type { SiteLocale } from '@/i18n/routes'

export interface LiveFeatureGroups {
  before: FeatureItem[]
  sync: FeatureItem[]
  peak: FeatureItem[]
  after: FeatureItem[]
  returns: FeatureItem[]
  mcn: FeatureItem[]
  support: FeatureItem[]
}

export function groupLiveFeatures(
  features: readonly FeatureItem[],
  locale: SiteLocale = 'zh-CN'
): LiveFeatureGroups {
  const english = locale === 'en'
  const groups: LiveFeatureGroups = {
    before: [],
    sync: [],
    peak: [],
    after: [],
    returns: [],
    mcn: [],
    support: [],
  }
  for (const feature of features) {
    const title = feature.title.toLowerCase()
    if (
      title.includes('爆单') ||
      (english &&
        (title.includes('peak') || title.includes('surge') || title.includes('flexible capacity')))
    )
      groups.before.push(feature)
    else if (title.includes('波次') || (english && title.includes('wave')))
      groups.peak.push(feature)
    else if (
      title.includes('截单') ||
      (english && (title.includes('cut-off') || title.includes('dispatch')))
    )
      groups.after.push(feature)
    else if (title.includes('库存') || (english && title.includes('inventory')))
      groups.sync.push(feature)
    else if (title.includes('退货') || (english && title.includes('return')))
      groups.returns.push(feature)
    else if (
      title.includes('代播') ||
      feature.title.includes('MCN') ||
      title.includes('多品牌') ||
      (english && (title.includes('mcn') || title.includes('multi-brand')))
    )
      groups.mcn.push(feature)
    else groups.support.push(feature)
  }
  return groups
}

export interface LiveStatGroups {
  peak: StatItem[]
  sync: StatItem[]
  after: StatItem[]
  returns: StatItem[]
  support: StatItem[]
}

export function groupLiveStats(
  stats: readonly StatItem[],
  locale: SiteLocale = 'zh-CN'
): LiveStatGroups {
  const english = locale === 'en'
  const groups: LiveStatGroups = { peak: [], sync: [], after: [], returns: [], support: [] }
  for (const stat of stats) {
    const label = stat.label.toLowerCase()
    if (label.includes('峰值') || (english && label.includes('peak'))) groups.peak.push(stat)
    else if (
      label.includes('库存') ||
      label.includes('直播') ||
      (english && (label.includes('inventory') || label.includes('livestream')))
    )
      groups.sync.push(stat)
    else if (label.includes('截单') || (english && label.includes('cut-off')))
      groups.after.push(stat)
    else groups.support.push(stat)
  }
  return groups
}
