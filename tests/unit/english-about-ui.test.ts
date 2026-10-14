import { describe, expect, it } from 'vitest'

import { aboutGallery } from '@/i18n/about-gallery'
import { aboutHeroCaptions } from '@/i18n/about-ui-captions'
import { aboutUi } from '@/i18n/about-ui'

describe('English About UI copy', () => {
  it('keeps interface controls, explorer entries and gallery copy in English', () => {
    const copy = aboutUi('en')

    expect(copy.hero).toMatchObject({
      pauseVideo: 'Pause video',
      playVideo: 'Play video',
      unmuteVideo: 'Turn sound on',
      muteVideo: 'Mute video',
    })
    expect(copy.explorer.entries.map(({ title }) => title)).toEqual([
      'Our journey',
      'Warehouse network',
      'Credentials & honours',
      'Frequently asked questions',
    ])
    expect(aboutGallery.en).toMatchObject({
      eyebrow: 'INSIDE 56XYY',
      heading: 'XINYIYUAN, in every frame',
      hint: 'Hover to preview · Click or tap to view',
      dialogTitle: 'Photo viewer',
      close: 'Close',
    })
    expect(aboutGallery.en).not.toHaveProperty('groups')
    expect(aboutGallery.en.images.garments).toBe('Garments hanging in warehouse storage')
    expect(aboutGallery.en.images.archive).toBe(
      'Activity and everyday imagery from the original XINYIYUAN gallery'
    )
    expect(aboutGallery['zh-CN'].images.archive).toBe('新亦源原图库中的活动与日常影像')
    expect(Object.keys(aboutGallery.en.images).sort()).toEqual(
      Object.keys(aboutGallery['zh-CN'].images).sort()
    )
    for (const alt of Object.values(aboutGallery.en.images)) {
      expect(alt.trim().length).toBeGreaterThan(0)
      expect(alt).not.toMatch(/[\u4e00-\u9fff]/)
    }
    expect(copy.footer.backToTop).toBe('Back to top')
  })

  it('preserves the video cue count and formats approved English claims', () => {
    const captions = aboutHeroCaptions('en')

    expect(captions).toHaveLength(31)
    expect(captions[1]?.text).toContain('540,000 m²')
    expect(captions[16]?.text).toContain('24 hours')
  })

  it('retains the Chinese default when a locale is omitted', () => {
    expect(aboutUi().hero.pauseVideo).toBe('暂停视频')
    expect(aboutUi().explorer.entries[0]?.title).toBe('发展历程')
  })
})
