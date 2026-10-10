import type { FeatureItem, StatItem } from '@/data/service'
import type { SiteLocale } from '@/i18n/routes'

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

export function groupSouthFeatures(
  features: readonly FeatureItem[],
  locale: SiteLocale = 'zh-CN'
): SouthFeatureGroups {
  const english = locale === 'en'
  const groups: SouthFeatureGroups = {
    cities: { 广州: [], 东莞: [], 佛山: [], 肇庆: [] },
    returns: [],
    industry: [],
    other: [],
  }
  for (const sourceFeature of features) {
    const title = sourceFeature.title.toLowerCase()
    const city = (Object.keys(groups.cities) as SouthCity[]).find(
      (name) =>
        sourceFeature.title.includes(name) ||
        (english &&
          title.includes(
            (
              { 广州: 'guangzhou', 东莞: 'dongguan', 佛山: 'foshan', 肇庆: 'zhaoqing' } as Record<
                SouthCity,
                string
              >
            )[name]
          ))
    )
    const feature = normalizeSouthFeature(sourceFeature)
    if (city) groups.cities[city].push(feature)
    else if (sourceFeature.title.includes('退货') || (english && title.includes('return')))
      groups.returns.push(feature)
    else if (
      feature.title === '货源入仓与库存安排' ||
      sourceFeature.title.includes('产业') ||
      (english && (title.includes('factory') || title.includes('stock receiving')))
    )
      groups.industry.push(feature)
    else groups.other.push(feature)
  }
  return groups
}

export function groupSouthStats(
  stats: readonly StatItem[],
  locale: SiteLocale = 'zh-CN'
): SouthStatGroups {
  const english = locale === 'en'
  return stats.reduce<SouthStatGroups>(
    (groups, stat) => {
      const label = stat.label.toLowerCase()
      if (label.includes('截单') || (english && label.includes('cut-off')))
        groups.warehouse.push(stat)
      else if (
        label.includes('华南仓网') ||
        label.includes('直营仓储') ||
        (english &&
          (label.includes('south china network') ||
            label.includes('directly operated south china space')))
      ) {
        groups.network.push(stat)
      } else if (label.includes('仓配模式') || (english && label.includes('fulfilment model'))) {
        groups.channels.push(stat)
      } else {
        groups.other.push(stat)
      }
      return groups
    },
    { network: [], warehouse: [], channels: [], other: [] }
  )
}
