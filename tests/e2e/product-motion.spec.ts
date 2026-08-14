import { expect, test } from '@playwright/test'

test('product page reveals late sections when they enter the viewport', async ({
  page,
}, testInfo) => {
  const width = testInfo.project.name === 'mobile' ? 430 : 1440
  await page.setViewportSize({ width, height: 900 })
  await page.goto('/product')

  // Trigger the page motion loader, then emulate a user dragging directly
  // to sections near the bottom of the page.
  await page.evaluate(() => window.scrollTo(0, 100))
  await page.waitForTimeout(700)

  const process = page.locator('#service-process')
  await process.scrollIntoViewIfNeeded()
  await expect(process).toBeInViewport()
  await page.waitForTimeout(300)
  expect(
    Number(
      await process
        .locator('#process-heading')
        .evaluate((element) => getComputedStyle(element).opacity)
    ),
    'the process heading should start revealing as soon as its section enters the viewport'
  ).toBeGreaterThan(0.05)
  await expect(process.locator('#process-heading')).toHaveCSS('opacity', '1', { timeout: 2_000 })

  const callToAction = page.locator('.warehouse-cta')
  await callToAction.scrollIntoViewIfNeeded()
  await expect(callToAction).toBeInViewport()
  await page.waitForTimeout(300)
  expect(
    Number(
      await callToAction
        .locator('#warehouse-cta-heading')
        .evaluate((element) => getComputedStyle(element).opacity)
    ),
    'the final CTA should start revealing as soon as it enters the viewport'
  ).toBeGreaterThan(0.05)
  await expect(callToAction.locator('#warehouse-cta-heading')).toHaveCSS('opacity', '1', {
    timeout: 2_000,
  })
})
