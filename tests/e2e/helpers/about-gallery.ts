import { expect, type Page } from '@playwright/test'

const thumbnails = '[data-gallery-thumbnail]'

export async function openWall(page: Page, path = '/about') {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-about-gallery]')).toHaveAttribute('data-preview-ready', 'true')
  await page.locator('[data-about-gallery]').evaluate((element) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + scrollY, behavior: 'instant' })
  })
  await expect
    .poll(() =>
      page
        .locator('[data-about-gallery]')
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top))
    )
    .toBeLessThan(2)
  await page.locator(`${thumbnails} img`).evaluateAll(async (images) => {
    for (const image of images) await (image as HTMLImageElement).decode()
  })
}
