import type { FeatureItem, StatItem } from '@/data/service'

export interface B2bFeatureGroups {
  allocation: FeatureItem[]
  labels: FeatureItem[]
  erp: FeatureItem[]
  transport: FeatureItem[]
  inventory: FeatureItem[]
  replenishment: FeatureItem[]
  support: FeatureItem[]
}

export function groupB2bFeatures(features: readonly FeatureItem[]): B2bFeatureGroups {
  const groups = {
    allocation: [] as FeatureItem[],
    labels: [] as FeatureItem[],
    erp: [] as FeatureItem[],
    transport: [] as FeatureItem[],
    inventory: [] as FeatureItem[],
    replenishment: [] as FeatureItem[],
    support: [] as FeatureItem[],
  }
  for (const feature of features) {
    if (feature.title === '门店分货精准分拣') groups.allocation.push(feature)
    else if (feature.title === '货架标签 / 吊牌加工') groups.labels.push(feature)
    else if (feature.title === '季节集中铺货保障') groups.replenishment.push(feature)
    else if (feature.title === '零担 / 整车 / 快递混合发货') groups.transport.push(feature)
    else if (feature.title === 'B2C+B2B一盘货管理') groups.inventory.push(feature)
    else if (feature.title === 'ERP / 进销存系统对接') groups.erp.push(feature)
    else groups.support.push(feature)
  }
  return groups
}
export interface B2bStatGroups {
  accuracy: StatItem[]
  partners: StatItem[]
  cities: StatItem[]
  fees: StatItem[]
  support: StatItem[]
  operations: StatItem[]
  systemFee: StatItem[]
}

export function groupB2bStats(stats: readonly StatItem[]): B2bStatGroups {
  const groups: B2bStatGroups = {
    accuracy: [],
    partners: [],
    cities: [],
    fees: [],
    support: [],
    operations: [],
    systemFee: [],
  }
  for (const stat of stats) {
    if (stat.label === '精准分货' || stat.label === '发货准确率') groups.accuracy.push(stat)
    else if (stat.label === '合作品牌') groups.partners.push(stat)
    else if (stat.label === '覆盖城市') groups.cities.push(stat)
    else if (stat.label === '系统使用费') groups.fees.push(stat)
    else groups.support.push(stat)
  }
  groups.operations = stats.filter(({ label }) => label !== '系统使用费')
  groups.systemFee = groups.fees
  return groups
}
