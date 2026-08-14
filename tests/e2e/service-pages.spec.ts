import { expect, test } from '@playwright/test'

test('shared service landing layout renders every visual variant', async ({ page }) => {
  const serviceRoutes = [
    '/xiefu-yuncang',
    '/fuzhuang-yuncang',
    '/guangzhou-xiefu-yuncang',
    '/huanan-xiefu-yuncang',
    '/huadong-xiefu-yuncang',
    '/b2b-mendian-cangpei',
    '/kuajing-yuncang',
    '/zhibo-cangpei',
    '/weipinhui-jit-jitx',
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

  await page.locator('.honor-card').first().click()
  const dialog = page.getByRole('dialog', { name: '证书大图' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('img')).toHaveAttribute('src', /.+/)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('refactored about, cases, publications and Yundao modules preserve their contracts', async ({
  page,
}) => {
  await page.goto('/about')
  const muteButton = page.locator('#hero-mute-btn')
  await expect(muteButton).toHaveAttribute('aria-label', '开启声音')
  await muteButton.click()
  await expect(muteButton).toHaveAttribute('aria-label', '静音')
  await expect(page.getByRole('heading', { name: '发展历程' })).toBeVisible()
  await expect(page.locator('#history-track > div')).toHaveCount(9)
  await page.getByRole('button', { name: '下一年' }).click()
  await expect(page.locator('[aria-label="跳到2017年"] .history-dot-circle')).toHaveClass(
    /bg-brand-orange/
  )
  await expect(page.getByRole('heading', { name: /CDC\/RDC\/FDC三级仓网/ })).toBeVisible()

  await page.goto('/cases')
  await expect(page.locator('.logos-row')).toHaveCount(2)
  await expect(page.locator('#cases-grid')).toHaveCount(1)
  await expect(page.locator('#cases-grid .case-card')).toHaveCount(6)
  await expect(page.getByRole('heading', { name: '为什么品牌选择新亦源' })).toBeVisible()

  await page.goto('/senlinqikan')
  await expect(page.getByRole('heading', { level: 1, name: '森林期刊' })).toBeVisible()
  await expect(page.locator('#issues a[href$=".pdf"]')).toHaveCount(14)

  await page.goto('/yundao-zhineng-jijian')
  await expect(page.locator('.yd-interface figure')).toHaveCount(3)
  await expect(page.locator('.yd-flow li')).toHaveCount(6)
  await expect(page.locator('.yd-scenarios article')).toHaveCount(3)
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
