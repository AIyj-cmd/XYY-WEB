import { expect, test } from '@playwright/test'

test('return inspection redesign keeps its records, routing, and source content readable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/tuihuo-zhijian')

  await expect(page.locator('.returns-page')).toHaveCount(1)
  await expect(
    page.getByRole('heading', { level: 1, name: /退回来的商品，\s*下一步有依据/ })
  ).toBeVisible()
  const video = page.locator('.returns-hero__media')
  await expect(video).toHaveAttribute('autoplay', '')
  await expect(video).toHaveAttribute('muted', '')
  await expect(video).toHaveAttribute('playsinline', '')
  await expect(video).not.toHaveAttribute('controls')
  await expect(page.getByLabel('质检记录字段示意').locator('article')).toHaveCount(5)
  await expect(page.locator('.returns-grades__table [role="listitem"]')).toHaveCount(4)
  await expect(page.locator('[data-redesign-feature]')).toHaveCount(6)
  await expect(page.getByRole('link', { name: '查看合作案例' })).toHaveAttribute('href', '/cases')
  await expect(page.getByRole('link', { name: '查看全部仓配服务' })).toHaveAttribute(
    'href',
    '/product'
  )
  await page.getByRole('link', { name: /流转修复车间/ }).click()
  await expect(page).toHaveURL(/\/houzheng-xiufu$/)

  await page.goto('/tuihuo-zhijian')
  await expect(page.locator('[data-redesign-faq]')).toHaveCount(5)
  await page.locator('.returns-faq details').first().locator('summary').click()
  await expect(page.locator('.returns-faq details').first()).toHaveAttribute('open', '')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test.describe('return inspection without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps grades, all feature descriptions, and FAQ readable', async ({ page }) => {
    await page.goto('/tuihuo-zhijian')
    await expect(page.locator('.returns-grades__table [role="listitem"]')).toHaveCount(4)
    await expect(page.locator('.returns-checks strong')).toHaveCount(3)
    await expect(page.locator('.returns-evidence dl > div')).toHaveCount(4)
    await expect(page.locator('[data-redesign-faq]')).toHaveCount(5)
  })
})
