import { expect, test } from '@playwright/test'

test('crossborder redesign keeps documents, domestic return handling, and source content readable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/kuajing-yuncang')

  await expect(page.locator('.crossborder-page')).toHaveCount(1)
  await expect(
    page.getByRole('heading', { level: 1, name: /^把出海前的\s*国内仓配准备好$/ })
  ).toBeVisible()
  await expect(page.locator('.crossborder-documents__grid article')).toHaveCount(3)
  await expect(page.getByText('模板确认', { exact: true })).toBeVisible()
  await expect(page.getByText('抽检标准', { exact: true })).toBeVisible()
  await expect(page.locator('[data-redesign-feature]')).toHaveCount(6)
  await expect(page.locator('.crossborder-faq details')).toHaveCount(5)
  await page.locator('.crossborder-faq details').first().locator('summary').press('Enter')
  await expect(page.locator('.crossborder-faq details').first()).toHaveAttribute('open', '')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test.describe('crossborder redesign without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps its boundary, WMS return sequence, and FAQ readable', async ({ page }) => {
    await page.goto('/kuajing-yuncang')
    await expect(page.locator('.crossborder-boundary__track > article')).toHaveCount(3)
    await expect(page.getByText(/核对订单与 SKU 并录入 WMS/)).toBeVisible()
    await expect(page.locator('[data-redesign-faq]')).toHaveCount(5)
  })
})
