import { expect, test } from '@playwright/test'

const conversionCtaRoutes = [
  '/product',
  '/xiefu-yuncang',
  '/huadong-xiefu-yuncang',
  '/tuihuo-zhijian',
  '/houzheng-xiufu',
  '/kuajing-yuncang',
  '/zhibo-cangpei',
  '/huanan-xiefu-yuncang',
  '/guangzhou-xiefu-yuncang',
  '/b2b-mendian-cangpei',
  '/cases',
  '/news',
  '/senlinqikan',
]

test.setTimeout(60_000)

test('target pages share one accessible conversion CTA without overflow', async ({
  page,
}, testInfo) => {
  const mobile = testInfo.project.name === 'mobile'
  await page.setViewportSize({ width: mobile ? 360 : 1440, height: 900 })

  for (const path of conversionCtaRoutes) {
    const response = await page.goto(path)
    expect(response?.ok(), `${path} should return a successful response`).toBe(true)

    const cta = page.locator('[data-conversion-cta]')
    await expect(cta, `${path} should render exactly one shared conversion CTA`).toHaveCount(1)
    await cta.scrollIntoViewIfNeeded()
    await expect(cta.locator('h2')).toHaveCSS('visibility', 'visible')
    await expect(cta.locator('.conversion-cta__inner')).toHaveCount(1)
    await expect(cta.locator('.conversion-cta__message')).toHaveCount(1)
    await expect(cta.locator('aside')).toHaveCount(1)
    await expect(cta.locator('ol > li')).toHaveCount(3)

    const headingId = await cta.getAttribute('aria-labelledby')
    expect(headingId, `${path} CTA should reference its heading`).toMatch(/^[a-z-]+$/)
    const heading = cta.getByRole('heading', { level: 2 })
    await expect(heading).toHaveCount(1)
    await expect(heading).toHaveAttribute('id', headingId as string)
    await expect(heading).toHaveText(/\S+/)

    const contactLink = cta.locator('a[href="/contact"]')
    await expect(contactLink).toHaveCount(1)
    await expect(contactLink).toHaveAccessibleName(/\S+/)

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(
      dimensions.content,
      `${path} should not overflow at the active viewport`
    ).toBeLessThanOrEqual(dimensions.viewport + 1)
  }
})
