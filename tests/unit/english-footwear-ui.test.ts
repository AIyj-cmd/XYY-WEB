import { describe, expect, it } from 'vitest'
import { groupFootwearFeatures, groupFootwearStats } from '@/components/service/footwear/content'
import {
  FOOTWEAR_ENGLISH_FEATURE_TITLES,
  FOOTWEAR_ENGLISH_STAT_LABELS,
  FOOTWEAR_ENGLISH_UI,
} from '@/i18n/footwear-ui'
import { englishClaim } from '@/i18n/claims'
import { SERVICE_FACTS } from '@/lib/brand'

describe('English footwear UI localization', () => {
  it('classifies translated feature and statistic labels without relying on item order', () => {
    const features = groupFootwearFeatures([
      { title: FOOTWEAR_ENGLISH_FEATURE_TITLES.全程监控追溯, desc: 'Traceable records.' },
      { title: 'Unknown translated feature', desc: 'Kept in the supplement.' },
      { title: FOOTWEAR_ENGLISH_FEATURE_TITLES.RFID智能识别, desc: 'RFID checks.' },
      { title: FOOTWEAR_ENGLISH_FEATURE_TITLES.深度定制WMS, desc: 'Project integration.' },
      { title: FOOTWEAR_ENGLISH_FEATURE_TITLES.精细库存管控, desc: 'Inventory checks.' },
      { title: FOOTWEAR_ENGLISH_FEATURE_TITLES.弹性产能机制, desc: 'Peak preparation.' },
      { title: FOOTWEAR_ENGLISH_FEATURE_TITLES.全渠道一盘货, desc: 'Channel coordination.' },
    ])
    const stats = groupFootwearStats([
      {
        stat: englishClaim('partnerBrands', 'service:xiefu-yuncang'),
        label: FOOTWEAR_ENGLISH_STAT_LABELS.合作品牌,
        sub: 'Partner brands.',
      },
      {
        stat: englishClaim('shippingAccuracy', 'service:xiefu-yuncang'),
        label: FOOTWEAR_ENGLISH_STAT_LABELS.发货准确率,
        sub: 'Dispatch checks.',
      },
      {
        stat: SERVICE_FACTS.orderPickupCutoff,
        label: FOOTWEAR_ENGLISH_STAT_LABELS.截单时间,
        sub: 'Agreed service rule.',
      },
      { stat: 'Unknown', label: 'Unknown metric', sub: 'Kept in the supplement.' },
    ])

    expect(features.goods.map(({ title }) => title)).toEqual([
      FOOTWEAR_ENGLISH_FEATURE_TITLES.RFID智能识别,
      FOOTWEAR_ENGLISH_FEATURE_TITLES.精细库存管控,
    ])
    expect(features.channels).toHaveLength(2)
    expect(features.daily).toHaveLength(2)
    expect(features.unknown).toHaveLength(1)
    expect(stats.daily).toHaveLength(2)
    expect(stats.partner).toHaveLength(1)
    expect(stats.unknown).toHaveLength(1)
  })

  it('provides English-only static UI copy and valid implemented English CTA targets', () => {
    expect(JSON.stringify(FOOTWEAR_ENGLISH_UI)).not.toMatch(/[\u3400-\u9fff]/)
    expect(FOOTWEAR_ENGLISH_UI.returns).toMatchObject({
      inspection: 'Returns inspection',
      care: 'Garment care and repair',
    })
    expect(FOOTWEAR_ENGLISH_UI.cta).toMatchObject({
      contact: 'Discuss apparel fulfilment requirements',
      cases: 'View cases',
      services: 'Explore services',
    })
  })
})
