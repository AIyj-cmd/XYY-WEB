import { describe, expect, it } from 'vitest'

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
    expect(copy.gallery.statements).toHaveLength(5)
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
