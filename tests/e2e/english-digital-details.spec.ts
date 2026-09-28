import { expect, test } from '@playwright/test'

test.use({ channel: 'chrome', locale: 'zh-CN' })
const routes = [
  { en: '/en/digital-operations', zh: '/wuliu-shuzihua', h1: 'Orders, inventory' },
  { en: '/en/smart-shipping', zh: '/yundao-zhineng-jijian', h1: 'Store shipping' },
] as const

test('home 03 and 04 enter their English details by actual clicks', async ({ page }) => {
  for (const [index, route] of routes.entries()) {
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    const section = page.locator(index === 0 ? '#svc-logistics-cloud' : '#dp-yundao-platform')
    await expect(section.locator('.svc-num-badge > span')).toHaveText(`0${index + 3}`)
    const link = section.locator('a.svc-link')
    await expect(link).toHaveAttribute('href', route.en)
    await link.click()
    await expect(page).toHaveURL(new RegExp(`${route.en}$`))
    await expect(page.locator('h1')).toContainText(route.h1)
  }
})

test('SSR, reciprocal SEO, schemas and discovery expose both complete pages', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Shared SSR checks run once')
  const origin = testInfo.project.use.baseURL!
  for (const route of routes) {
    const response = await request.get(route.en)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(route.h1)
    await page.goto(route.en, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page).toHaveTitle(/\S+ \| XINYIYUAN Supply Chain/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', origin + route.en)
    for (const [language, path] of [
      ['en', route.en],
      ['zh-CN', route.zh],
      ['x-default', route.zh],
    ])
      await expect(page.locator(`link[hreflang="${language}"]`)).toHaveAttribute(
        'href',
        origin + path
      )
    const schemas = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).map((value) => JSON.parse(value))
    expect(schemas.find((value) => value['@type'] === 'Service')).toMatchObject({
      url: origin + route.en,
    })
    expect(
      schemas.find((value) => value['@type'] === 'BreadcrumbList').itemListElement.at(-1).item
    ).toBe(origin + route.en)
    expect(await page.locator('main').innerText()).not.toMatch(/[\u3400-\u9fff]/)
    const attributes = await page
      .locator('main [aria-label], main img[alt]')
      .evaluateAll((elements) =>
        elements.flatMap((element) => [
          element.getAttribute('aria-label'),
          element.getAttribute('alt'),
        ])
      )
    expect(attributes.join(' ')).not.toMatch(/[\u3400-\u9fff]/)
    await expect(page.locator('main a[href="/en/contact"]').first()).toBeVisible()
    if (route.en.endsWith('smart-shipping')) {
      await expect(page.locator('.yd-flow li')).toHaveCount(6)
      await expect(page.locator('.yd-scenarios article')).toHaveCount(3)
      await expect(page.locator('.service-faq__list > div')).toHaveCount(5)
      const faq = schemas.find((value) => value['@type'] === 'FAQPage')
      expect(faq.mainEntity).toHaveLength(5)
      for (const item of faq.mainEntity) {
        await expect(page.locator('.service-faq')).toContainText(item.name)
        await expect(page.locator('.service-faq')).toContainText(item.acceptedAnswer.text)
      }
      expect(await page.locator('main').innerText()).not.toMatch(/\b11\b|50%/)
    } else {
      await expect(page.locator('.digital-module')).toHaveCount(6)
      await expect(page.locator('.digital-chain li')).toHaveCount(3)
    }
    await page.goto(route.zh, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', origin + route.en)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', origin + route.zh)
  }
  for (const path of ['/sitemap.xml', '/llms.txt']) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    const text = await response.text()
    for (const route of routes) expect(text).toContain(origin + route.en)
  }
  expect((await request.get('/en/not-a-real-page', { maxRedirects: 0 })).status()).toBe(404)
})

test('language switches keep the detail pair and Services active state', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.en, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.site-header a[href="/en/services"]:visible')).toHaveAttribute(
      'aria-current',
      'page'
    )
    await page.locator('#site-language-switch').click()
    await expect(page).toHaveURL(new RegExp(`${route.zh}$`))
    await page.locator('#site-language-switch').click()
    await expect(page).toHaveURL(new RegExp(`${route.en}$`))
  }
})

test.describe('Browser English suggestion', () => {
  test.use({ locale: 'en-US' })
  test('points to each paired English detail and offsets the fixed header', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    for (const route of routes) {
      await page.goto(route.zh, { waitUntil: 'domcontentloaded' })
      const prompt = page.locator('#language-suggestion')
      await expect(prompt).toBeVisible()
      const link = prompt.locator('a[data-language-choice="en"]')
      await expect(link).toHaveAttribute('href', route.en)
      await expect
        .poll(async () =>
          page.evaluate(() => {
            const strip = document.querySelector('#language-suggestion')!.getBoundingClientRect()
            const header = document.querySelector('.site-header')!.getBoundingClientRect()
            return header.top - strip.bottom
          })
        )
        .toBeGreaterThanOrEqual(-1)
      await link.click()
      await expect(page).toHaveURL(new RegExp(`${route.en}$`))
      await expect(page.locator('#language-suggestion')).toBeHidden()
    }
  })
})
