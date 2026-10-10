import type { FeatureItem, StatItem } from '@/data/service'
import type { SiteLocale } from '@/i18n/routes'

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

export function groupEastFeatures(
  features: readonly FeatureItem[],
  locale: SiteLocale = 'zh-CN'
): EastFeatureGroups {
  const english = locale === 'en'
  const groups: EastFeatureGroups = {
    network: [],
    b2c: [],
    b2b: [],
    returns: [],
    collaboration: [],
    support: [],
  }
  for (const feature of features) {
    const title = feature.title.toLowerCase()
    if (
      title.includes('b2c') ||
      title.includes('电商') ||
      (english && title.includes('e-commerce'))
    )
      groups.b2c.push(feature)
    else if (
      title.includes('b2b') ||
      title.includes('门店') ||
      (english && title.includes('store'))
    )
      groups.b2b.push(feature)
    else if (title.includes('退货') || (english && title.includes('return')))
      groups.returns.push(feature)
    else if (title.includes('协同') || (english && title.includes('inventory coordination')))
      groups.collaboration.push(feature)
    else if (
      title.includes('仓网') ||
      title.includes('仓库分布') ||
      (english && (title.includes('warehouse network') || title.includes('warehouse locations')))
    )
      groups.network.push(feature)
    else groups.support.push(feature)
  }
  return groups
}

export function groupEastStats(
  stats: readonly StatItem[],
  locale: SiteLocale = 'zh-CN'
): EastStatGroups {
  const english = locale === 'en'
  return stats.reduce<EastStatGroups>(
    (groups, stat) => {
      const label = stat.label.toLowerCase()
      if (label.includes('截单') || (english && label.includes('cut-off')))
        groups.warehouse.push(stat)
      else if (
        label.includes('系统') ||
        (english && (label.includes('system') || label.includes('fee')))
      )
        groups.fees.push(stat)
      else if (label.includes('仓配') || (english && label.includes('fulfilment')))
        groups.channels.push(stat)
      else if (label.includes('仓网') || (english && label.includes('east china network')))
        groups.network.push(stat)
      else groups.other.push(stat)
      return groups
    },
    { network: [], channels: [], warehouse: [], fees: [], other: [] }
  )
}
