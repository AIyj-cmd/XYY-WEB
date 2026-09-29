import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import {
  startEnglishWhitepaperFixture,
  type EnglishWhitepaperFixture,
} from '../helpers/english-whitepapers-fixture'

const evidenceDir = 'output/english-whitepapers/xyy-20260929-04/luna'
let fixture: EnglishWhitepaperFixture

test.describe.serial('English whitepaper layout and visual evidence', () => {
  test.beforeAll(async () => {
    await mkdir(evidenceDir, { recursive: true })
    fixture = await startEnglishWhitepaperFixture()
  })
  test.afterAll(async () => {
    await fixture?.app.close()
    await fixture?.cms.close()
  })
  test('keeps hero text below the fixed header and captures mobile content views', async ({
    page,
  }) => {
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [360, 780],
    ] as const) {
      fixture.cms.reset()
      await page.setViewportSize({ width, height })
      await page.goto(`${fixture.app.url}/en/supply-chain-whitepapers`)
      await page.evaluate(async () => {
        await document.fonts.ready
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      const geometry = await page.evaluate(() => {
        const header = document.querySelector('.site-header')!.getBoundingClientRect()
        const hero = document.querySelector('section[aria-labelledby="whitepapers-hero-heading"]')!
        const rectsFor = (element: Element) => {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
          const rects: Array<{ left: number; right: number; top: number; bottom: number }> = []
          while (walker.nextNode()) {
            const node = walker.currentNode as Text
            if (!node.textContent?.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(node)
            rects.push(
              ...Array.from(range.getClientRects())
                .filter((rect) => rect.width > 0 && rect.height > 0)
                .map((rect) => ({
                  left: rect.left,
                  right: rect.right,
                  top: rect.top,
                  bottom: rect.bottom,
                }))
            )
          }
          return rects
        }
        const eyebrow = rectsFor(hero.querySelector('p')!)
        const h1 = rectsFor(hero.querySelector('h1')!)
        const insideHorizontalViewport = (rect: { left: number; right: number }) =>
          rect.left >= -1 && rect.right <= innerWidth + 1
        return {
          headerBottom: header.bottom,
          eyebrow,
          h1,
          overflow: document.documentElement.scrollWidth > innerWidth,
          cta: insideHorizontalViewport(
            document
              .querySelector('#english-whitepapers-conversion-cta-heading')!
              .getBoundingClientRect()
          ),
        }
      })
      expect(geometry.overflow, `${width}px overflow`).toBe(false)
      expect(geometry.eyebrow.length, `${width}px eyebrow ranges`).toBeGreaterThan(0)
      expect(geometry.h1.length, `${width}px H1 ranges`).toBeGreaterThan(0)
      expect(
        geometry.eyebrow.every((rect) => rect.left >= -1 && rect.right <= width + 1),
        `${width}px eyebrow viewport`
      ).toBe(true)
      expect(
        geometry.h1.every((rect) => rect.left >= -1 && rect.right <= width + 1),
        `${width}px H1 viewport`
      ).toBe(true)
      if (width <= 390) {
        expect(
          Math.min(...geometry.eyebrow.map((rect) => rect.top)),
          `${width}px eyebrow/header`
        ).toBeGreaterThanOrEqual(geometry.headerBottom - 1)
        expect(
          Math.min(...geometry.h1.map((rect) => rect.top)),
          `${width}px H1/header`
        ).toBeGreaterThanOrEqual(geometry.headerBottom - 1)
      }
      expect(geometry.cta, `${width}px CTA heading`).toBe(true)
      await expect(page.locator('h1')).toBeVisible()
      await expect(
        page
          .locator('section[aria-labelledby="english-whitepapers-conversion-cta-heading"]')
          .getByRole('link', { name: 'Contact us' })
      ).toBeVisible()
      if (width === 1440) await page.screenshot({ path: `${evidenceDir}/whitepapers-1440-top.png` })
      if (width === 390) {
        await page.screenshot({ path: `${evidenceDir}/whitepapers-390-top.png` })
        for (const [selector, name] of [
          ['#issues article h3', 'latest'],
          ['#page-faq-heading', 'faq'],
        ] as const) {
          await page.evaluate(
            ({ selector }) => {
              const element = document.querySelector(selector)
              if (element)
                window.scrollTo({
                  top: element.getBoundingClientRect().top + scrollY - 110,
                  behavior: 'instant',
                })
            },
            { selector }
          )
          await expect
            .poll(() =>
              page.evaluate(
                (target) =>
                  Math.round(document.querySelector(target)?.getBoundingClientRect().top ?? -1),
                selector
              )
            )
            .toBeGreaterThanOrEqual(100)
          await expect
            .poll(() =>
              page.evaluate(
                (target) =>
                  Math.round(document.querySelector(target)?.getBoundingClientRect().top ?? -1),
                selector
              )
            )
            .toBeLessThanOrEqual(120)
          await page.screenshot({ path: `${evidenceDir}/whitepapers-390-${name}.png` })
        }
      }
    }
  })
})
