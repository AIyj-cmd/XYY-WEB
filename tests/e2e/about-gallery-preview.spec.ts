import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

import { openWall } from './helpers/about-gallery'

const evidence = process.env.PLAYWRIGHT_ARTIFACTS_DIR ?? 'output/playwright'
mkdirSync(evidence, { recursive: true })
const thumbnails = '[data-gallery-thumbnail]'
const preview = '[data-gallery-preview]'
const dialog = '[data-gallery-dialog]'

async function expectPreview(page: Page, index: number) {
  const trigger = page.locator(thumbnails).nth(index)
  await expect(page.locator(preview)).toBeVisible()
  await expect(page.locator('[data-gallery-preview-image]')).toHaveAttribute(
    'src',
    new URL((await trigger.getAttribute('href'))!, page.url()).href
  )
  const [box, source] = await Promise.all([
    page.locator(preview).boundingBox(),
    trigger.boundingBox(),
  ])
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height)
  expect(
    box!.x >= source!.x + source!.width ||
      box!.x + box!.width <= source!.x ||
      box!.y >= source!.y + source!.height ||
      box!.y + box!.height <= source!.y
  ).toBe(true)
  expect(box!.width * box!.height).toBeGreaterThan(source!.width * source!.height)
  await expect(page.locator('[data-gallery-preview-image]')).toHaveCSS('object-fit', 'contain')
}

test('mouse previews stay open across pointer transit and close on exit or Escape', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Mouse interaction runs in Chromium')
  await page.setViewportSize({ width: 1440, height: 900 })
  await openWall(page)
  for (const index of [0, 23, 65, 156]) {
    await page.locator(thumbnails).nth(index).hover()
    await expectPreview(page, index)
    const box = (await page.locator(preview).boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 })
    await page.waitForTimeout(260)
    await expectPreview(page, index)
    await page.keyboard.press('Escape')
    await expect(page.locator(preview)).not.toBeVisible()
  }
  await page.locator(thumbnails).nth(4).hover()
  await expectPreview(page, 4)
  await page.screenshot({ path: `${evidence}/gallery-hover-desktop.png` })
  await page.mouse.move(2, 800)
  await expect(page.locator(preview)).not.toBeVisible()
})

test('Escape keeps a covered thumbnail closed until real pointer movement and preserves keyboard previews', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Mouse dismissal runs in Chromium')
  await page.setViewportSize({ width: 1440, height: 900 })
  await openWall(page)
  await page.locator(thumbnails).nth(23).hover()
  await expectPreview(page, 23)
  const covered = await page.locator(thumbnails).evaluateAll((links) => {
    const popover = document.querySelector('[data-gallery-preview]')!.getBoundingClientRect()
    return links
      .map((link, index) => {
        const box = link.getBoundingClientRect()
        return { index, x: box.x + box.width / 2, y: box.y + box.height / 2 }
      })
      .find(
        ({ x, y }) =>
          x > popover.left + 12 &&
          x < popover.right - 12 &&
          y > popover.top + 12 &&
          y < popover.bottom - 12
      )
  })
  expect(covered, 'The preview must cover another thumbnail for this regression').toBeDefined()
  const point = covered!
  const exposed = page.locator(thumbnails).nth(point.index)
  await page.mouse.move(point.x, point.y)
  await expectPreview(page, 23)
  await page.keyboard.press('Escape')
  await expect(page.locator(preview)).not.toBeVisible()
  await page.waitForTimeout(260)
  await expect(page.locator(preview)).not.toBeVisible()
  expect(
    await exposed.evaluate(
      (link, { x, y }) =>
        document.elementFromPoint(x, y)?.closest('[data-gallery-thumbnail]') === link,
      point
    )
  ).toBe(true)

  // Stay inside the newly exposed thumbnail: no new pointerenter is required to resume.
  await page.mouse.move(point.x + 1, point.y + 1)
  await expectPreview(page, point.index)
  await page.screenshot({ path: `${evidence}/gallery-escape-resumed.png` })
  await page.keyboard.press('Escape')
  await expect(page.locator(preview)).not.toBeVisible()
  await page.locator(thumbnails).first().focus()
  await page.keyboard.press('Tab')
  await expectPreview(page, 1)
  await page.keyboard.press('Escape')
  await expect(page.locator(preview)).not.toBeVisible()
})

test('keyboard and native dialog restore focus, unlock scrolling and preserve modified links', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Keyboard interaction runs in Chromium')
  await page.setViewportSize({ width: 1440, height: 900 })
  await openWall(page, '/en/about')
  const first = page.locator(thumbnails).first()
  await first.focus()
  await page.keyboard.press('Tab')
  await expectPreview(page, 1)
  const trigger = page.locator(thumbnails).nth(1)
  for (const close of ['escape', 'button', 'backdrop']) {
    await trigger.press('Enter')
    await expect(page.locator(dialog)).toBeVisible()
    await expect(page.locator('[data-gallery-close]')).toBeFocused()
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
    if (close === 'escape') await page.keyboard.press('Escape')
    if (close === 'button') await page.locator('[data-gallery-close]').click()
    if (close === 'backdrop') await page.mouse.click(2, 2)
    await expect(page.locator(dialog)).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await expect(page.locator('html')).not.toHaveClass(/about-gallery-dialog-open/)
    await expect(page.locator(preview)).not.toBeVisible()
  }
  const popupPromise = page.context().waitForEvent('page')
  await trigger.click({ modifiers: ['ControlOrMeta'] })
  const popup = await popupPromise
  await popup.waitForLoadState()
  await expect(popup).toHaveURL(new RegExp((await trigger.getAttribute('href'))!))
  await popup.close()
  await expect(page.locator(dialog)).not.toBeVisible()
  await page.locator('[data-about-explorer-open]').first().click()
  await expect(page.locator('#about-explorer-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#about-explorer-dialog')).not.toBeVisible()
})

test('touch opens a proportional photo without hover and restores the wall on close', async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Touch interaction uses a dedicated context')
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  await openWall(page, '/en/about')
  await expect(page.locator(preview)).not.toBeVisible()
  const trigger = page.locator(thumbnails).nth(4)
  await trigger.tap()
  await expect(page.locator(dialog)).toBeVisible()
  await expect(page.locator(preview)).not.toBeVisible()
  const image = page.locator('[data-gallery-dialog-image]')
  await image.evaluate((element: HTMLImageElement) => element.decode())
  const ratioError = await image.evaluate((element: HTMLImageElement) => {
    const box = element.getBoundingClientRect()
    return Math.abs(box.width / box.height - element.naturalWidth / element.naturalHeight)
  })
  expect(ratioError).toBeLessThan(0.01)
  await page.screenshot({ path: `${evidence}/gallery-touch-dialog.png` })
  await page.locator('[data-gallery-close]').tap()
  await expect(page.locator(dialog)).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await expect(page.locator(preview)).not.toBeVisible()
  await expect(page.locator('html')).not.toHaveClass(/about-gallery-dialog-open/)
  await context.close()
})
