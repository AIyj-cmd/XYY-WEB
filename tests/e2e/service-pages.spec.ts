import { expect, test } from '@playwright/test'

test('shared service landing layout renders every visual variant', async ({ page }) => {
  const serviceRoutes = [
    '/xiefu-yuncang',
    '/guangzhou-xiefu-yuncang',
    '/huanan-xiefu-yuncang',
    '/huadong-xiefu-yuncang',
    '/b2b-mendian-cangpei',
    '/kuajing-yuncang',
    '/zhibo-cangpei',
    '/tuihuo-zhijian',
    '/houzheng-xiufu',
    '/yundao-zhineng-jijian',
  ]

  for (const path of serviceRoutes) {
    const response = await page.goto(path)
    expect(response?.ok(), `${path} should return a successful response`).toBe(true)
    await expect(page.locator('#lp-h1')).toHaveCount(1)
    await expect(page.locator('.signature')).toHaveCount(1)
    await expect(page.locator('.service-detail')).toHaveCount(1)
    await expect(page.locator('.service-faq')).toHaveCount(1)
    await expect(page.locator('.service-cta')).toHaveCount(1)
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content, `${path} should not overflow`).toBeLessThanOrEqual(
      dimensions.viewport + 1
    )
  }
})

test('mobile navigation and honors dialog support Escape', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/about')

  const menuButton = page.locator('#mobile-menu-btn')
  await expect(menuButton).toHaveAttribute('aria-label', '打开菜单')
  await menuButton.click()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  await expect(menuButton).toBeFocused()

  await page.getByRole('button', { name: '资质与荣誉', exact: true }).click()
  const explorer = page.getByRole('dialog', { name: '资质与荣誉', exact: true })
  await expect(explorer).toBeVisible()

  await page.locator('.honor-card').first().click()
  const honorDialog = page.getByRole('dialog', { name: '证书大图' })
  await expect(honorDialog).toBeVisible()
  await expect(honorDialog.locator('img')).toHaveAttribute('src', /.+/)
  await page.keyboard.press('Escape')
  await expect(honorDialog).toBeHidden()
  await expect(explorer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(explorer).toBeHidden()

  await page.goto('/cases')
  await expect(page.locator('#cases-grid .case-card')).toHaveCount(6)
  const mobileCasesWidth = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(mobileCasesWidth.content).toBeLessThanOrEqual(mobileCasesWidth.viewport + 1)
})

test('news page keeps category filters in content and supports CMS publishing', async ({
  page,
}) => {
  await page.goto('/news')

  await expect(page.getByRole('heading', { name: '鞋服物流知识库' })).toBeVisible()
  await expect(page.getByRole('group', { name: '文章分类筛选' })).toBeVisible()
  await expect(page.locator('main a[href="/senlinqikan"]').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: '当前暂无已发布文章' })).toBeVisible()
  await expect(page.getByText('审核通过的文章会在这里自动发布')).toBeVisible()
  await expect(page.getByRole('heading', { name: '行业内容使用与更新说明' })).toBeVisible()
  await expect(page.locator('article')).toHaveCount(0)
})
