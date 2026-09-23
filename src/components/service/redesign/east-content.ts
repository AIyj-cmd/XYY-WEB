import type { FeatureItem, StatItem } from '@/data/service'

export interface EastFeatureGroups {
  network: FeatureItem[]
  b2c: FeatureItem[]
  b2b: FeatureItem[]
  returns: FeatureItem[]
  collaboration: FeatureItem[]
  support: FeatureItem[]
}

export interface EastStatGroups {
  network: StatItem[]
  channels: StatItem[]
  warehouse: StatItem[]
  fees: StatItem[]
  other: StatItem[]
}

export function groupEastFeatures(features: readonly FeatureItem[]): EastFeatureGroups {
  const groups: EastFeatureGroups = {
    network: [],
    b2c: [],
    b2b: [],
    returns: [],
    collaboration: [],
    support: [],
  }
  for (const feature of features) {
    if (feature.title.includes('B2C') || feature.title.includes('电商')) groups.b2c.push(feature)
    else if (feature.title.includes('B2B') || feature.title.includes('门店'))
      groups.b2b.push(feature)
    else if (feature.title.includes('退货')) groups.returns.push(feature)
    else if (feature.title.includes('协同')) groups.collaboration.push(feature)
    else if (feature.title.includes('仓网') || feature.title.includes('仓库分布'))
      groups.network.push(feature)
    else groups.support.push(feature)
  }
  return groups
}

export function groupEastStats(stats: readonly StatItem[]): EastStatGroups {
  return stats.reduce<EastStatGroups>(
    (groups, stat) => {
      if (stat.label.includes('截单')) groups.warehouse.push(stat)
      else if (stat.label.includes('系统')) groups.fees.push(stat)
      else if (stat.label.includes('仓配')) groups.channels.push(stat)
      else if (stat.label.includes('仓网')) groups.network.push(stat)
      else groups.other.push(stat)
      return groups
    },
    { network: [], channels: [], warehouse: [], fees: [], other: [] }
  )
}
