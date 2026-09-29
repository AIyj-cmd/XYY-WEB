import { expect, test } from '@playwright/test'
import { startEnglishNewsFixture, type EnglishNewsFixture } from '../helpers/english-news-fixture'

let fixture: EnglishNewsFixture

test.describe('English news responsive layout', () => {
  test.beforeAll(async () => {
    fixture = await startEnglishNewsFixture()
  })

  test.afterAll(async () => {
    await fixture?.app.close()
    await fixture?.cms.close()
  })

  test('keeps list and detail readable at desktop and narrow mobile widths', async ({ page }) => {
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [360, 844],
    ]) {
      await page.setViewportSize({ width, height })
      await page.goto(`${fixture.app.url}/en/news`)
      const listGeometry = await page.evaluate(() => {
        const header = document.querySelector('.site-header')?.getBoundingClientRect()
        const eyebrow = document
          .querySelector('[aria-labelledby="insights-heading"] p')
          ?.getBoundingClientRect()
        const heading = document.querySelector('#insights-heading')?.getBoundingClientRect()
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          headerBottom: header?.bottom ?? -1,
          eyebrowTop: eyebrow?.top ?? -1,
          headingTop: heading?.top ?? -1,
        }
      })
      expect(listGeometry.overflow, `${width}px list overflow`).toBeLessThanOrEqual(0)
      expect(
        listGeometry.eyebrowTop,
        `${width}px list eyebrow/header overlap`
      ).toBeGreaterThanOrEqual(listGeometry.headerBottom - 0.5)
      expect(
        listGeometry.headingTop,
        `${width}px list heading/header overlap`
      ).toBeGreaterThanOrEqual(listGeometry.headerBottom - 0.5)
      if (width === 1440 || width === 390) {
        await page.screenshot({
          path: `output/english-news/xyy-20260929-03/luna/news-list-${width}.png`,
        })
      }

      await page.goto(`${fixture.app.url}/en/news/english-news-live`)
      const detailGeometry = await page.evaluate(() => {
        const header = document.querySelector('.site-header')?.getBoundingClientRect()
        const breadcrumb = document
          .querySelector('[aria-label="Breadcrumb"]')
          ?.getBoundingClientRect()
        const heading = document.querySelector('article h1')?.getBoundingClientRect()
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          headerBottom: header?.bottom ?? -1,
          breadcrumbBottom: breadcrumb?.bottom ?? -1,
          headingTop: heading?.top ?? -1,
        }
      })
      expect(detailGeometry.overflow, `${width}px detail overflow`).toBeLessThanOrEqual(0)
      expect(
        detailGeometry.breadcrumbBottom,
        `${width}px detail breadcrumb/header overlap`
      ).toBeGreaterThanOrEqual(detailGeometry.headerBottom - 0.5)
      expect(
        detailGeometry.headingTop,
        `${width}px detail heading/header overlap`
      ).toBeGreaterThanOrEqual(detailGeometry.headerBottom - 0.5)
      if (width === 1440 || width === 390) {
        await page.screenshot({
          path: `output/english-news/xyy-20260929-03/luna/news-detail-${width}.png`,
        })
      }
    }
  })
})
