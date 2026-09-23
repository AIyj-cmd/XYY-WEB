import type { FeatureItem } from '@/data/service'

export type RepairFeatureGroups = Record<
  'cleaning' | 'fabric' | 'stitching' | 'accessories' | 'footwear' | 'identity' | 'other',
  FeatureItem[]
>

const emptyGroups = (): RepairFeatureGroups => ({
  cleaning: [],
  fabric: [],
  stitching: [],
  accessories: [],
  footwear: [],
  identity: [],
  other: [],
})

export function repairFeaturesInSourceOrder(features: FeatureItem[]) {
  return [...features]
}

export function groupRepairFeatures(features: FeatureItem[]): RepairFeatureGroups {
  return features.reduce((groups, feature) => {
    const title = feature.title
    if (title.includes('清污')) groups.cleaning.push(feature)
    else if (title.includes('面料')) groups.fabric.push(feature)
    else if (title.includes('缝线')) groups.stitching.push(feature)
    else if (title.includes('配饰')) groups.accessories.push(feature)
    else if (title.includes('鞋')) groups.footwear.push(feature)
    else if (title.includes('标识') || title.includes('异味')) groups.identity.push(feature)
    else groups.other.push(feature)
    return groups
  }, emptyGroups())
}
