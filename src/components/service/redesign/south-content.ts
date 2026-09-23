import type { FeatureItem, StatItem } from '@/data/service'

const LEGACY_SOUTH_HERO_DESCRIPTION =
  '新亦源华南鞋服云仓直营仓储30万㎡+，华南多仓布局覆盖广州、东莞、佛山、肇庆，支持B2C、B2B、全渠道库存协同及退货质检。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日；具体启用仓点、仓容和到达时效以项目方案及线路SLA为准。'
const SOUTH_HERO_DESCRIPTION =
  '广州、东莞、佛山、肇庆多仓布局，支持 B2C、B2B、全渠道库存协同、退货质检及区域配送。'

export type SouthCity = '广州' | '东莞' | '佛山' | '肇庆'

export interface SouthFeatureGroups {
  cities: Record<SouthCity, FeatureItem[]>
  returns: FeatureItem[]
  industry: FeatureItem[]
  other: FeatureItem[]
}

export interface SouthStatGroups {
  network: StatItem[]
  warehouse: StatItem[]
  channels: StatItem[]
  other: StatItem[]
}

export function summarizeSouthHeroDescription(description: string): string {
  return description === LEGACY_SOUTH_HERO_DESCRIPTION ? SOUTH_HERO_DESCRIPTION : description
}

function normalizeSouthFeature(feature: FeatureItem): FeatureItem {
  const city = (['广州', '东莞', '佛山', '肇庆'] as const).find(
    (name) => feature.title === `${name}区域节点`
  )
  const title = city
    ? `${city}仓库`
    : feature.title === '华南产业链协同'
      ? '货源入仓与库存安排'
      : feature.title

  return {
    ...feature,
    title,
    desc: feature.desc,
  }
}

export function groupSouthFeatures(features: readonly FeatureItem[]): SouthFeatureGroups {
  const groups: SouthFeatureGroups = {
    cities: { 广州: [], 东莞: [], 佛山: [], 肇庆: [] },
    returns: [],
    industry: [],
    other: [],
  }
  for (const sourceFeature of features) {
    const city = (Object.keys(groups.cities) as SouthCity[]).find((name) =>
      sourceFeature.title.includes(name)
    )
    const feature = normalizeSouthFeature(sourceFeature)
    if (city) groups.cities[city].push(feature)
    else if (sourceFeature.title.includes('退货')) groups.returns.push(feature)
    else if (feature.title === '货源入仓与库存安排' || sourceFeature.title.includes('产业'))
      groups.industry.push(feature)
    else groups.other.push(feature)
  }
  return groups
}

export function groupSouthStats(stats: readonly StatItem[]): SouthStatGroups {
  return stats.reduce<SouthStatGroups>(
    (groups, stat) => {
      if (stat.label.includes('截单')) groups.warehouse.push(stat)
      else if (stat.label.includes('华南仓网') || stat.label.includes('直营仓储')) {
        groups.network.push(stat)
      } else if (stat.label.includes('仓配模式')) {
        groups.channels.push(stat)
      } else {
        groups.other.push(stat)
      }
      return groups
    },
    { network: [], warehouse: [], channels: [], other: [] }
  )
}
