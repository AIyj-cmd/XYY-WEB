import { expect, test } from '@playwright/test'

test('homepage loads the shoe-apparel fulfillment message and primary CTA', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('新亦源鞋服云仓', { exact: true }).first()).toBeVisible()
  await expect(
    page.getByRole('heading', { name: /从入库质检到退货上架，.*鞋服仓配一次解决/ }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '获取仓配方案' }).first()).toBeVisible()
  await expect(page.locator('#s-stats .sr-only')).toHaveCount(0)
  await expect(page.locator('a.case-card[href="/cases/ur"]')).toHaveCount(1)
  await expect(page.getByRole('link', { name: /在线估算费用|仓储成本估算器/ })).toHaveCount(0)
})

test('product page presents four selectable solutions and an accessible FAQ', async ({ page }) => {
  await page.goto('/product')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '一套鞋服供应链能力覆盖商品从入仓到再次销售',
    }),
  ).toBeVisible()
  const selector = page.locator('[data-service-selector]')
  await expect(selector.getByRole('tab')).toHaveCount(4)
  await expect(selector.getByRole('tabpanel')).toHaveCount(1)
  for (const [question, solution] of [
    ['SKU多、平台多', '鞋服云仓'],
    ['退货率高', '退货质检与瑕疵修复'],
    ['平台、仓库和物流', '物流数字化能力'],
    ['门店寄件、退仓', '运到智能寄件平台'],
  ]) {
    await selector.getByRole('tab', { name: new RegExp(question) }).click()
    await expect(selector.getByRole('tabpanel')).toContainText(solution)
  }
  await expect(page.getByRole('navigation', { name: '产品页章节导航' })).toHaveCount(0)
  await expect(page.locator('#cloud-warehouse')).toHaveCount(1)
  await expect(page.locator('#quality-inspection')).toHaveCount(1)
  await expect(page.locator('#logistics-cloud')).toHaveCount(1)
  await expect(page.locator('#yundao-platform')).toHaveCount(1)
  await expect(page.locator('.dashboard-frame img')).toHaveAttribute(
    'src',
    '/images/services/operations-dashboard-ui.webp',
  )
  await expect(page.locator('.brand-proof-wall a')).toHaveCount(4)
  await expect(page.locator('.product-cta__fields span')).toHaveCount(6)
  await expect(page.locator('#product-faq details[open]')).toHaveCount(1)

  await page.locator('.dashboard-frame').click()
  await expect(page.getByRole('dialog', { name: '系统界面大图预览' })).toBeVisible()
  await page.getByRole('button', { name: '关闭大图' }).click()
  await expect(page.getByRole('dialog', { name: '系统界面大图预览' })).not.toBeVisible()
})

test('case detail has a crawlable URL and project data', async ({ page }) => {
  await page.goto('/cases/ur')

  await expect(page.getByRole('heading', { name: 'Urban Revivo（UR）' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '品牌背景与服务场景' })).toBeVisible()
  await expect(page.getByText('数据来源于新亦源内部项目运营统计', { exact: false })).toBeVisible()
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
