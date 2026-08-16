import { expect, test } from '@playwright/test'

test('critical public content remains complete when CMS is unavailable', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.stat-num')).toHaveCount(8)
  await expect(page.locator('.s-service')).toHaveCount(4)

  await page.goto('/about')
  await page.getByRole('button', { name: '仓网布局', exact: true }).click()
  const warehouseRegion = page.locator('[aria-labelledby="warehouse-regions-heading"]')
  await expect(warehouseRegion.getByText('黄埔仓', { exact: true })).toBeVisible()
  await expect(warehouseRegion.getByText('上海青浦汇金仓', { exact: true })).toBeVisible()
  await expect(warehouseRegion.getByText(/高速出口3公里/)).toHaveCount(0)
  await expect(warehouseRegion.getByText(/东部高速5公里/)).toHaveCount(0)
  await expect(warehouseRegion.getByText(/专配电商货梯/)).toHaveCount(0)

  await page.goto('/cases')
  await expect(page.locator('#cases-grid .case-card')).toHaveCount(6)
})
