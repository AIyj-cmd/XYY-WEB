import { expect, test } from '@playwright/test'

test('homepage loads the shoe-apparel fulfillment message and primary CTA', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /新亦源鞋服云仓.*从入库质检到退货上架.*鞋服仓配一次解决/ }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '获取仓配方案' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /在线估算费用|仓储成本估算器/ })).toHaveCount(0)
})

test('contact form shows API validation errors', async ({ page }) => {
  await page.goto('/contact')
  await page.getByLabel(/您的姓名/).fill('测试')
  await page.getByLabel(/联系电话/).fill('abc')
  await page.getByLabel(/需求描述/).fill('想了解仓配一体服务')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: '提交咨询' }).click()

  await expect(page.locator('#form-result')).toContainText('请输入有效的手机号或座机号')
})

test('news page renders the cleared-content state and unique FAQ', async ({ page }) => {
  await page.goto('/news')

  await expect(page.getByRole('heading', { name: '鞋服物流知识库' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '文章分类筛选' })).toBeVisible()
  await expect(page.locator('main a[href="/senlinqikan"]').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: '当前暂无公开的行业新闻文章' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '行业内容使用与更新说明' })).toBeVisible()
  await expect(page.locator('article')).toHaveCount(0)
})
