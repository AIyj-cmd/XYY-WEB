import { expect, test } from '@playwright/test'
import { readdirSync } from 'node:fs'

import { openWall } from './helpers/about-gallery'

const thumbnails = '[data-gallery-thumbnail]'
const originalSources = readdirSync(new URL('../../public/about/gallery/', import.meta.url))
  .filter((name) => /^gallery-\d+\.webp$/.test(name))
  .map((name) => `/about/gallery/${name}`)
  .sort()

test('keeps all 157 original files in one visible grid with varied image sizes', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Gallery contract runs in Chromium')
  test.setTimeout(180_000)
  expect(originalSources).toHaveLength(157)
  for (const path of ['/about', '/en/about']) {
    for (const [width, height] of [
      [1440, 900],
      [768, 900],
      [390, 844],
      [360, 780],
    ]) {
      await page.setViewportSize({ width, height })
      await openWall(page, path)
      await expect(page.locator('[data-gallery-grid]')).toHaveCount(1)
      await expect(page.locator('[data-gallery-grid] > figure')).toHaveCount(157)
      const sources = await page
        .locator(`${thumbnails} img`)
        .evaluateAll((images) => images.map((image) => image.getAttribute('src')).sort())
      expect(sources).toEqual(originalSources)
      expect(new Set(sources).size).toBe(157)
      const geometry = await page.locator('[data-about-gallery]').evaluate((gallery) => {
        const rect = gallery.getBoundingClientRect()
        const grid = gallery.querySelector<HTMLElement>('[data-gallery-grid]')!
        const frames = [...grid.children].map((element) => {
          const box = element.getBoundingClientRect()
          return { x: box.x, y: box.y, width: box.width, height: box.height }
        })
        return {
          height: rect.height,
          overflow: document.documentElement.scrollWidth - innerWidth,
          internal: grid.scrollHeight - grid.clientHeight,
          frames,
        }
      })
      expect(geometry.height).toBeLessThanOrEqual(height + 2)
      expect(geometry.overflow).toBeLessThanOrEqual(0)
      expect(geometry.internal).toBeLessThanOrEqual(1)
      const areas = geometry.frames.map((box) => box.width * box.height)
      expect(Math.max(...areas)).toBeGreaterThan(Math.min(...areas) * 2)
      const overlapping = geometry.frames.some((a, index) =>
        geometry.frames
          .slice(index + 1)
          .some(
            (b) =>
              Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 0.5 &&
              Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 0.5
          )
      )
      expect(overlapping).toBe(false)
      for (const box of geometry.frames) {
        expect(box.width).toBeGreaterThan(0)
        expect(box.height).toBeGreaterThan(0)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1)
        expect(box.y).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height).toBeLessThanOrEqual(height + 1)
      }
    }
  }
})
