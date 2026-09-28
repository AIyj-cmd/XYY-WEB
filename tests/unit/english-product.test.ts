import { describe, expect, it } from 'vitest'
import {
  ENGLISH_ASSURANCE_COPY,
  ENGLISH_PRODUCT_VIDEO_COPY,
  PRODUCT_SEQUENCE_LABELS,
} from '@/i18n/product'
import { SERVICE_FACTS } from '@/lib/brand'
import { PRODUCT_VIDEO_SECTIONS } from '@/data/product/video-sections'
import { englishClaim } from '@/i18n/claims'

describe('English product video localization', () => {
  it('keeps the complete eight-video sequence with valid English route targets', () => {
    expect(ENGLISH_PRODUCT_VIDEO_COPY).toHaveLength(8)
    expect(PRODUCT_VIDEO_SECTIONS.map(({ id }) => id)).toEqual([
      '01-overview',
      '02-returns',
      '03-refurbishment',
      '04-cross-border',
      '05-south-china',
      '06-east-china',
      '07-live-commerce',
      '08-b2b-stores',
    ])
    expect(
      PRODUCT_VIDEO_SECTIONS.every(
        ({ src, poster }) => src.endsWith('.mp4') && poster.endsWith('.jpg')
      )
    ).toBe(true)
    expect(ENGLISH_PRODUCT_VIDEO_COPY.map(({ href }) => href)).toEqual([
      '/en/apparel-fulfillment',
      '/en/returns-inspection',
      '/en/garment-care',
      '/en/services#04-cross-border',
      '/en/apparel-fulfillment',
      '/en/services#06-east-china',
      '/en/services#07-live-commerce',
      '/en/retail-distribution',
    ])
    for (const section of ENGLISH_PRODUCT_VIDEO_COPY) {
      expect(section.label).toMatch(/[A-Za-z]/)
      expect(section.headingPrefix).toMatch(/[A-Za-z]/)
      expect(section.description).toMatch(/[A-Za-z]/)
      expect(section.highlights).toHaveLength(3)
    }
    expect(JSON.stringify(ENGLISH_PRODUCT_VIDEO_COPY)).not.toMatch(/[\u3400-\u9fff]/)
  })

  it('uses approved values for assurance figures and English accessible navigation labels', () => {
    expect(ENGLISH_ASSURANCE_COPY.points.map(({ value }) => value)).toEqual([
      englishClaim('inventoryAccuracy', 'product'),
      SERVICE_FACTS.orderPickupCutoff,
      `By ${SERVICE_FACTS.orderDispatchDeadline}`,
      'End to end',
    ])
    expect(ENGLISH_ASSURANCE_COPY.mechanisms).toHaveLength(5)
    expect(PRODUCT_SEQUENCE_LABELS.en).toEqual({
      navigation: 'Service section navigation',
      previous: 'Previous section',
      next: 'Next section',
    })
  })
})
