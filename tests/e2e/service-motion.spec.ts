import { expect, test } from '@playwright/test'

const dropdownServiceRoutes = [
  '/xiefu-yuncang',
  '/huadong-xiefu-yuncang',
  '/tuihuo-zhijian',
  '/houzheng-xiufu',
  '/kuajing-yuncang',
  '/zhibo-cangpei',
  '/huanan-xiefu-yuncang',
  '/guangzhou-xiefu-yuncang',
  '/b2b-mendian-cangpei',
]

test('all service dropdown pages share the same prompt scroll reveal', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'The shared layout only needs one route matrix run'
  )
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const path of dropdownServiceRoutes) {
    await page.goto(path)

    const detail = page.locator('.service-detail__header')
    const heading = detail.locator('h2')
    expect(
      Number(await heading.evaluate((element) => getComputedStyle(element).opacity)),
      `${path} should prepare below-fold content for the shared reveal`
    ).toBeLessThan(0.05)

    await detail.scrollIntoViewIfNeeded()
    await expect(detail).toBeInViewport()
    await page.waitForTimeout(300)
    expect(
      Number(await heading.evaluate((element) => getComputedStyle(element).opacity)),
      `${path} should start revealing immediately after entering the viewport`
    ).toBeGreaterThan(0.05)
    await expect(heading).toHaveCSS('opacity', '1', { timeout: 2_000 })
  }
})

test('service motion remains readable on mobile and with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 })
  await page.goto('/xiefu-yuncang')

  const callToAction = page.locator('.service-cta')
  await callToAction.scrollIntoViewIfNeeded()
  await expect(callToAction.locator('#lp-cta-heading')).toHaveCSS('opacity', '1', {
    timeout: 2_000,
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(430)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/xiefu-yuncang')
  await expect(page.locator('.service-detail__header h2')).toHaveCSS('opacity', '1')
})
