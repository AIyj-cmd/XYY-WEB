import type { FeatureItem, StatItem } from '@/data/service'
import { FOOTWEAR_ENGLISH_FEATURE_TITLES, FOOTWEAR_ENGLISH_STAT_LABELS } from '@/i18n/footwear-ui'

export type FootwearFeatureGroups = Record<
  'goods' | 'channels' | 'daily' | 'unknown',
  FeatureItem[]
>
export type FootwearStatGroups = Record<'daily' | 'partner' | 'unknown', StatItem[]>

const featureGroups = new Map<string, keyof Omit<FootwearFeatureGroups, 'unknown'>>([
  ['RFID智能识别', 'goods'],
  ['精细库存管控', 'goods'],
  ['全渠道一盘货', 'channels'],
  ['深度定制WMS', 'channels'],
  ['弹性产能机制', 'daily'],
  ['全程监控追溯', 'daily'],
  [FOOTWEAR_ENGLISH_FEATURE_TITLES.RFID智能识别, 'goods'],
  [FOOTWEAR_ENGLISH_FEATURE_TITLES.精细库存管控, 'goods'],
  [FOOTWEAR_ENGLISH_FEATURE_TITLES.全渠道一盘货, 'channels'],
  [FOOTWEAR_ENGLISH_FEATURE_TITLES.深度定制WMS, 'channels'],
  [FOOTWEAR_ENGLISH_FEATURE_TITLES.弹性产能机制, 'daily'],
  [FOOTWEAR_ENGLISH_FEATURE_TITLES.全程监控追溯, 'daily'],
])

const statGroups = new Map<string, keyof Omit<FootwearStatGroups, 'unknown'>>([
  ['发货准确率', 'daily'],
  ['单仓峰值', 'daily'],
  ['截单时间', 'daily'],
  ['合作品牌', 'partner'],
  [FOOTWEAR_ENGLISH_STAT_LABELS.发货准确率, 'daily'],
  [FOOTWEAR_ENGLISH_STAT_LABELS.单仓峰值, 'daily'],
  [FOOTWEAR_ENGLISH_STAT_LABELS.截单时间, 'daily'],
  [FOOTWEAR_ENGLISH_STAT_LABELS.合作品牌, 'partner'],
])

export const groupFootwearFeatures = (features: FeatureItem[]): FootwearFeatureGroups => {
  const groups: FootwearFeatureGroups = { goods: [], channels: [], daily: [], unknown: [] }
  for (const feature of features) {
    const group = featureGroups.get(feature.title)
    groups[group ?? 'unknown'].push(feature)
  }
  return groups
}

export const groupFootwearStats = (stats: readonly StatItem[]): FootwearStatGroups => {
  const groups: FootwearStatGroups = { daily: [], partner: [], unknown: [] }
  for (const stat of stats) {
    const group = statGroups.get(stat.label)
    groups[group ?? 'unknown'].push(stat)
  }
  return groups
}
