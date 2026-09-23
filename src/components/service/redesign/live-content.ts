import type { FeatureItem, StatItem } from '@/data/service'

export interface LiveFeatureGroups {
  before: FeatureItem[]
  sync: FeatureItem[]
  peak: FeatureItem[]
  after: FeatureItem[]
  returns: FeatureItem[]
  mcn: FeatureItem[]
  support: FeatureItem[]
}

export function groupLiveFeatures(features: readonly FeatureItem[]): LiveFeatureGroups {
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
    if (feature.title.includes('爆单')) groups.before.push(feature)
    else if (feature.title.includes('波次')) groups.peak.push(feature)
    else if (feature.title.includes('截单')) groups.after.push(feature)
    else if (feature.title.includes('库存')) groups.sync.push(feature)
    else if (feature.title.includes('退货')) groups.returns.push(feature)
    else if (
      feature.title.includes('代播') ||
      feature.title.includes('MCN') ||
      feature.title.includes('多品牌')
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

export function groupLiveStats(stats: readonly StatItem[]): LiveStatGroups {
  const groups: LiveStatGroups = { peak: [], sync: [], after: [], returns: [], support: [] }
  for (const stat of stats) {
    if (stat.label.includes('峰值')) groups.peak.push(stat)
    else if (stat.label.includes('库存') || stat.label.includes('直播')) groups.sync.push(stat)
    else if (stat.label.includes('截单')) groups.after.push(stat)
    else groups.support.push(stat)
  }
  return groups
}
