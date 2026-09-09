import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { getWhitepapers } from '@/data/whitepapers'
import { hasTraceableBlockSource, hasValidSourceLocator } from '../helpers/whitepaper-claim-source'
import { WHITEPAPER_SOURCE_LAYOUTS } from '../helpers/whitepaper-source-pages'

const repositoryRoot = process.cwd()

describe('whitepaper source locator contract', () => {
  it('binds every article to an audited PDF hash and scans every locator', () => {
    for (const article of getWhitepapers()) {
      const layout = WHITEPAPER_SOURCE_LAYOUTS[article.issue]
      expect(layout, `issue ${article.issue} audited layout`).toBeTruthy()
      expect(article.sourceSha256).toBe(layout!.sha256)
      const sourcePdf = readFileSync(resolve(repositoryRoot, `public${article.sourcePdf}`))
      expect(createHash('sha256').update(sourcePdf).digest('hex')).toBe(layout!.sha256)

      for (const section of article.sections) {
        expect(
          hasValidSourceLocator(section.source, layout!),
          `section ${article.issue}: ${section.title}`
        ).toBe(true)
        for (const block of section.blocks) {
          const label = `issue ${article.issue}, ${section.title}, ${block.type}`
          expect(hasValidSourceLocator(block.source, layout!), label).toBe(true)
          if (['paragraph', 'quote', 'list', 'figure'].includes(block.type)) {
            expect(hasTraceableBlockSource(block, layout!), label).toBe(true)
          }
        }
      }
    }
  })

  it('rejects invalid page, bounds, units and synthetic dimensions', () => {
    const layout = WHITEPAPER_SOURCE_LAYOUTS['10']
    const valid = { pdfPage: 1, side: 'full', bbox: [10, 10, 20, 20] }
    expect(hasValidSourceLocator(valid, layout)).toBe(true)
    expect(hasValidSourceLocator({ ...valid, pdfPage: 9999 }, layout)).toBe(false)
    expect(hasValidSourceLocator({ ...valid, bbox: [-1, 10, 20, 20] }, layout)).toBe(false)
    expect(hasValidSourceLocator({ ...valid, bbox: [10, -1, 20, 20] }, layout)).toBe(false)
    expect(
      hasValidSourceLocator(
        { ...valid, bbox: [10, 10, 820, 850], sourceWidth: 1653, sourceHeight: 2339 },
        layout
      )
    ).toBe(false)
    expect(hasValidSourceLocator({ ...valid, bbox: [10, 10, 20, 20, 30] }, layout)).toBe(false)
  })

  it('uses the audited physical-page height override for issue 14 only', () => {
    const layout = WHITEPAPER_SOURCE_LAYOUTS['14']
    const atPageHeight = { side: 'left', bbox: [10, 800, 20, 825] }
    expect(hasValidSourceLocator({ ...atPageHeight, pdfPage: 10 }, layout)).toBe(false)
    expect(hasValidSourceLocator({ ...atPageHeight, pdfPage: 11 }, layout)).toBe(true)
    expect(hasValidSourceLocator({ ...atPageHeight, pdfPage: 20 }, layout)).toBe(false)
    expect(
      hasValidSourceLocator(
        { pdfPage: 11, side: 'left', bbox: [1207.57, 800, 1207.58, 825] },
        layout
      )
    ).toBe(false)
  })
})
