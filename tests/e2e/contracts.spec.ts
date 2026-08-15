import { expect, test } from '@playwright/test'
import { spawn, type ChildProcess } from 'node:child_process'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { getClaimText } from '../../src/lib/claims'

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return (server.address() as AddressInfo).port
}

async function reservePort(): Promise<number> {
  const server = createServer()
  const port = await listen(server)
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  )
  return port
}

async function waitForOrigin(origin: string, child: ChildProcess) {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`isolated Astro server exited with ${child.exitCode}`)
    try {
      const response = await fetch(origin)
      if (response.status > 0) return
    } catch {
      // The child process may still be binding its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`isolated Astro server did not start at ${origin}`)
}

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

test('homepage, SEO, structured data, FAQ and llms share reviewed claims', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Claim contract only needs one browser run')

  const partnerBrands = getClaimText('partnerBrands', 'home')
  const warehouseArea = getClaimText('warehouseArea', 'home')
  await page.goto('/')

  await expect(page.locator('body')).toContainText(partnerBrands)
  await expect(page.locator('body')).toContainText(warehouseArea)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    new RegExp(partnerBrands.replace('+', '\\+'))
  )
  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(structuredData.join('\n')).toContain(partnerBrands)
  expect(structuredData.join('\n')).toContain(warehouseArea)
  await expect(page.locator('#s-faq')).toContainText(partnerBrands)

  const llms = await request.get('/llms.txt')
  const llmsBody = await llms.text()
  expect(llmsBody).toContain(getClaimText('partnerBrands', 'llms'))
  expect(llmsBody).toContain(getClaimText('warehouseArea', 'llms'))

  const rendered = `${await page.content()}\n${llmsBody}`
  expect(rendered).not.toContain('{{')
  expect(rendered).not.toContain('140+')
  expect(rendered).not.toContain('50万㎡+')
  expect(rendered).not.toContain(`${warehouseArea}㎡`)
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

test('case detail returns HTTP 404 when the available CMS has no published slug', async ({
  playwright,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'SSR status contract only needs one server run')

  const directus = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ data: [] }))
  })
  const directusPort = await listen(directus)
  const appPort = await reservePort()
  const origin = `http://127.0.0.1:${appPort}`
  const app = spawn(process.execPath, ['server.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DIRECTUS_URL: `http://127.0.0.1:${directusPort}`,
      DIRECTUS_CONTENT_TOKEN: 'cms-empty-contract-token',
      DIRECTUS_CONTACT_TOKEN: 'cms-empty-contact-token',
      PUBLIC_DIRECTUS_URL: `http://127.0.0.1:${directusPort}`,
      PUBLIC_SITE_URL: origin,
      ENABLE_DOMAIN_REDIRECTS: 'false',
      HOST: '127.0.0.1',
      PORT: String(appPort),
    },
    stdio: 'ignore',
  })

  try {
    await waitForOrigin(origin, app)
    const context = await playwright.request.newContext({ baseURL: origin })
    const response = await context.get('/cases/ur', { maxRedirects: 0 })
    expect(response.status()).toBe(404)
    await context.dispose()
  } finally {
    app.kill('SIGTERM')
    await new Promise<void>((resolve) => directus.close(() => resolve()))
  }
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
