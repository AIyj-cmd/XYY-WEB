import type { FeatureItem } from '@/data/service'
import type { ServicePageContent } from '@/lib/directus-content-queries'

export type ReturnFeatureGroups = Record<
  'grade' | 'apparel' | 'footwear' | 'rules' | 'evidence' | 'repair' | 'other',
  FeatureItem[]
>

const groups = (): ReturnFeatureGroups => ({
  grade: [],
  apparel: [],
  footwear: [],
  rules: [],
  evidence: [],
  repair: [],
  other: [],
})

export function groupReturnFeatures(features: FeatureItem[]): ReturnFeatureGroups {
  return features.reduce((result, feature) => {
    const title = feature.title
    if (title.includes('四级')) result.grade.push(feature)
    else if (title.includes('服装')) result.apparel.push(feature)
    else if (title.includes('鞋')) result.footwear.push(feature)
    else if (title.includes('AQL')) result.rules.push(feature)
    else if (title.includes('视频') || title.includes('举证')) result.evidence.push(feature)
    else if (title.includes('修复')) result.repair.push(feature)
    else result.other.push(feature)
    return result
  }, groups())
}

export function hasReturnContent(content: ServicePageContent, faqCount: number) {
  return Boolean(
    content.h1 ||
    content.h1sub ||
    content.heroDesc ||
    content.contentDesc ||
    content.features.length ||
    content.stats.length ||
    faqCount
  )
}
