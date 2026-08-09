import { expect, test } from '@playwright/test'

const formalOrigin = 'https://56xyy.com'

test('formal-domain build publishes indexable canonical pages', async ({ page }) => {
  for (const path of ['/', '/product', '/cases', '/about', '/contact']) {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    expect(response?.headers()['x-robots-tag']).toBeUndefined()
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${formalOrigin}${path}`
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      `${formalOrigin}${path}`
    )
  }
})

test('formal discovery files use the production origin without a global crawl block', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBe(true)
  expect(robots.headers()['content-type']).toContain('text/plain')
  const robotsBody = await robots.text()
  expect(robotsBody).toContain(`Sitemap: ${formalOrigin}/sitemap.xml`)
  expect(robotsBody).toMatch(/User-agent: OAI-SearchBot\s+Allow: \//)
  expect(robotsBody).not.toMatch(/User-agent: \*\s+Disallow: \//)

  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBe(true)
  expect(sitemap.headers()['content-type']).toContain('application/xml')
  const sitemapBody = await sitemap.text()
  expect(sitemapBody).toContain(`<loc>${formalOrigin}/product</loc>`)
  expect(sitemapBody).not.toContain('127.0.0.1')
  expect(sitemapBody).not.toContain('wz.tomatopia.top')

  const llms = await request.get('/llms.txt')
  expect(llms.ok()).toBe(true)
  expect(llms.headers()['content-type']).toContain('text/plain')
  const llmsBody = await llms.text()
  expect(llmsBody).toContain(`[产品服务](${formalOrigin}/product)`)
  expect(llmsBody).toContain('直营仓储54万㎡')
  expect(llmsBody).toContain('服务150+品牌')
  expect(llmsBody).toContain('员工1500+名')
  expect(llmsBody).toContain('管理SKU 45万+')
  expect(llmsBody).toContain('覆盖6000+城市')
  expect(llmsBody).not.toContain('127.0.0.1')
  expect(llmsBody).not.toContain('wz.tomatopia.top')
})

test('formal server normalizes www, legacy domains and legacy paths', async ({ request }) => {
  const www = await request.get('/', {
    headers: { host: 'www.56xyy.com', 'x-forwarded-proto': 'https' },
    maxRedirects: 0,
  })
  expect(www.status()).toBe(301)
  expect(www.headers().location).toBe(`${formalOrigin}/`)

  const legacy = await request.get('/product?source=legacy', {
    headers: { host: 'wz.tomatopia.top', 'x-forwarded-proto': 'https' },
    maxRedirects: 0,
  })
  expect(legacy.status()).toBe(301)
  expect(legacy.headers().location).toBe(`${formalOrigin}/product?source=legacy`)

  const legacyPath = await request.get('/index.html?source=old', {
    headers: { host: '56xyy.com', 'x-forwarded-proto': 'https' },
    maxRedirects: 0,
  })
  expect(legacyPath.status()).toBe(301)
  expect(legacyPath.headers().location).toBe('/?source=old')
})
