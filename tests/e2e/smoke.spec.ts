import { expect, test } from '@playwright/test'

test('homepage loads primary CTA without estimate CTA', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /让物流更简单/ })).toBeVisible()
  await expect(page.getByRole('link', { name: '免费咨询' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /在线估算费用|仓储成本估算器/ })).toHaveCount(0)
})

test('contact form shows API validation errors', async ({ page }) => {
  await page.goto('/contact')
  await page.getByLabel(/您的姓名/).fill('测试')
  await page.getByLabel(/联系电话/).fill('abc')
  await page.getByLabel(/需求描述/).fill('想了解仓配一体服务')
  await page.getByRole('button', { name: '提交咨询' }).click()

  await expect(page.locator('#form-result')).toContainText('请输入有效的手机号或座机号')
})

test('news page renders article list or placeholders', async ({ page }) => {
  await page.goto('/news')

  await expect(page.getByRole('heading', { name: '鞋服物流知识库' })).toBeVisible()
  await expect(page.locator('article').first()).toBeVisible()
})
