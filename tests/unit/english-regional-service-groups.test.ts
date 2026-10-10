import { describe, expect, it } from 'vitest'
import type { FeatureItem, StatItem } from '@/data/service'
import type { SiteLocale } from '@/i18n/routes'
import type { EnglishServiceSource } from '@/i18n/service-sources'
import { CROSSBORDER_ENGLISH_SOURCE } from '@/i18n/service-sources-crossborder'
import { SOUTH_ENGLISH_SOURCE } from '@/i18n/service-sources-south'
import { EAST_ENGLISH_SOURCE } from '@/i18n/service-sources-east'
import { LIVE_ENGLISH_SOURCE } from '@/i18n/service-sources-live'
import {
  groupCrossborderFeatures,
  groupCrossborderStats,
} from '@/components/service/redesign/crossborder-content'
import { groupSouthFeatures, groupSouthStats } from '@/components/service/redesign/south-content'
import { groupEastFeatures, groupEastStats } from '@/components/service/redesign/east-content'
import { groupLiveFeatures, groupLiveStats } from '@/components/service/redesign/live-content'

type ServiceGroups = {
  name: string
  catalog: EnglishServiceSource
  features: (items: readonly FeatureItem[], locale: SiteLocale) => unknown
  stats: (items: readonly StatItem[], locale: SiteLocale) => unknown
}
const services: ServiceGroups[] = [
  {
    name: 'crossborder',
    catalog: CROSSBORDER_ENGLISH_SOURCE,
    features: groupCrossborderFeatures,
    stats: groupCrossborderStats,
  },
  {
    name: 'south',
    catalog: SOUTH_ENGLISH_SOURCE,
    features: groupSouthFeatures,
    stats: groupSouthStats,
  },
  {
    name: 'east',
    catalog: EAST_ENGLISH_SOURCE,
    features: groupEastFeatures,
    stats: groupEastStats,
  },
  {
    name: 'live',
    catalog: LIVE_ENGLISH_SOURCE,
    features: groupLiveFeatures,
    stats: groupLiveStats,
  },
]

function bucketIndexes(
  grouped: unknown,
  original: readonly (FeatureItem | StatItem)[],
  path = ''
): Record<string, number[]> {
  if (Array.isArray(grouped)) {
    return {
      [path]: grouped.map((item) =>
        original.findIndex(
          (source) => source === item || ('desc' in source && source.desc === item.desc)
        )
      ),
    }
  }
  return Object.fromEntries(
    Object.entries(grouped as Record<string, unknown>).flatMap(([key, value]) =>
      Object.entries(bucketIndexes(value, original, path ? `${path}.${key}` : key))
    )
  )
}

function expectCompleteCoverage(buckets: Record<string, number[]>, length: number) {
  expect(
    Object.values(buckets)
      .flat()
      .sort((a, b) => a - b)
  ).toEqual(Array.from({ length }, (_, index) => index))
}

describe('reviewed English service grouping preserves source placement', () => {
  it.each(services)(
    '$name features occupy the same source buckets without omissions or duplication',
    ({ catalog, features }) => {
      const source = bucketIndexes(
        features(catalog.source.features, 'zh-CN'),
        catalog.source.features
      )
      const english = bucketIndexes(
        features(catalog.english.features, 'en'),
        catalog.english.features
      )
      expectCompleteCoverage(source, catalog.source.features.length)
      expectCompleteCoverage(english, catalog.english.features.length)
      expect(english).toEqual(source)
    }
  )

  it.each(services)(
    '$name stats occupy the same source buckets without omissions or duplication',
    ({ catalog, stats }) => {
      const source = bucketIndexes(stats(catalog.source.stats, 'zh-CN'), catalog.source.stats)
      const english = bucketIndexes(stats(catalog.english.stats, 'en'), catalog.english.stats)
      expectCompleteCoverage(source, catalog.source.stats.length)
      expectCompleteCoverage(english, catalog.english.stats.length)
      expect(english).toEqual(source)
    }
  )
})
