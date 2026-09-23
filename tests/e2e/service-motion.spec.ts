import { expect, test } from '@playwright/test'

const dropdownServiceRoutes = ['/guangzhou-xiefu-yuncang', '/b2b-mendian-cangpei']

test('all service dropdown pages share the same prompt scroll reveal', async ({
  page,
}, testInfo) => {
  // The complete shared-layout matrix needs a cumulative navigation budget.
  test.setTimeout(60_000)
  test.skip(
    testInfo.project.name !== 'chromium',
    'The shared layout only needs one route matrix run'
  )
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const path of dropdownServiceRoutes) {
    await page.goto(path)

    if (path === '/b2b-mendian-cangpei') {
      const allocation = page.locator('.b2b-allocation')
      await allocation.scrollIntoViewIfNeeded()
      await expect(allocation).toBeInViewport()
      await expect(page.locator('.b2b-hero__video')).toHaveCount(1)
      continue
    }

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

  const heroVideo = page.locator('.footwear-hero__video')
  await expect(heroVideo).toHaveCount(1)
  await expect(heroVideo).toHaveAttribute('autoplay', '')
  await expect(heroVideo).toHaveAttribute('loop', '')
  await expect(heroVideo).toHaveAttribute('muted', '')
  await expect(heroVideo).toHaveAttribute('playsinline', '')
  await expect(heroVideo).not.toHaveAttribute('controls')

  const fulfillment = page.locator('#footwear-fulfillment')
  await fulfillment.scrollIntoViewIfNeeded()
  await expect(fulfillment).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(430)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/xiefu-yuncang')
  await expect(page.locator('#footwear-fulfillment [role="tabpanel"]')).toHaveCount(3)
})
