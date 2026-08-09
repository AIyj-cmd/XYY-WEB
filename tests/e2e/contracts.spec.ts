import { expect, test } from '@playwright/test'

test('core pages and discovery endpoints preserve SEO and AEO contracts', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Semantic contract only needs one browser run')

  for (const path of ['/', '/product', '/cases', '/about', '/contact']) {
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page).toHaveTitle(/\S+/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${path === '/' ? '/$' : `${path}$`}`)
    )
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(schemas.length, `${path} should expose structured data`).toBeGreaterThan(0)
    for (const schema of schemas) expect(() => JSON.parse(schema)).not.toThrow()
  }

  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBe(true)
  expect(await robots.text()).toContain('Sitemap:')
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBe(true)
  expect(await sitemap.text()).toContain('<loc>http://127.0.0.1:4399/product</loc>')
  const llms = await request.get('/llms.txt')
  expect(llms.ok()).toBe(true)
  expect(await llms.text()).toContain('新亦源供应链')
})

test('health endpoint fails closed when configured CMS is unreachable', async ({
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Dependency contract only needs one request')
  const response = await request.get('/healthz')
  expect(response.status()).toBe(503)
  await expect(response.json()).resolves.toEqual({
    status: 'degraded',
    dependencies: { contactStorage: 'unreachable' },
  })

  const pageResponse = await request.get('/')
  expect(pageResponse.headers()['x-content-type-options']).toBe('nosniff')
  expect(pageResponse.headers()['x-frame-options']).toBe('SAMEORIGIN')
  expect(pageResponse.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(pageResponse.headers()['permissions-policy']).toContain('camera=()')
  expect(pageResponse.headers()['content-security-policy']).toContain("default-src 'self'")
  expect(pageResponse.headers()['x-robots-tag']).toBe('noindex, nofollow')
  expect(pageResponse.headers()['x-powered-by']).toBeUndefined()
  expect(pageResponse.headers()['cache-control']).toBe('no-store')

  const imageResponse = await request.get('/images/services/warehouse-hanging.webp')
  expect(imageResponse.ok()).toBe(true)
  expect(imageResponse.headers()['cache-control']).toBe('public, max-age=604800')
})

test('case detail has a crawlable URL and project data', async ({ page }) => {
  await page.goto('/cases/ur')

  await expect(page.getByRole('heading', { name: 'Urban Revivo（UR）' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '品牌背景与服务场景' })).toBeVisible()
  await expect(page.getByText('数据来源于新亦源内部项目运营统计', { exact: false })).toBeVisible()
})

test('contact form shows API validation errors', async ({ page }) => {
  await page.goto('/contact')

  await expect(page.locator('#form-result')).toHaveAttribute('role', 'status')
  await expect(page.locator('#form-result')).toHaveAttribute('aria-live', 'polite')
  await page.getByLabel(/您的姓名/).fill('测试')
  await page.getByLabel(/联系电话/).fill('abc')
  await page.getByLabel(/需求描述/).fill('想了解仓配一体服务')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: '提交咨询' }).click()

  await expect(page.locator('#form-result')).toContainText('请输入有效的手机号或座机号')
})
