import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-narrow', width: 360, height: 800 },
]

const pages = [
  {
    name: 'home-zh',
    route: '/',
    lang: 'zh-Hans',
    brandSelector: '.hero-brand-kw',
    brand: '新亦源鞋服云仓 · XINYIYUAN',
    title: /新亦源.*XINYIYUAN/,
    chinese: true,
  },
  {
    name: 'home-en',
    route: '/en',
    lang: 'en',
    brandSelector: '.hero-brand-kw',
    brand: 'XINYIYUAN APPAREL FULFILMENT',
    title: /XINYIYUAN Supply Chain/,
    chinese: false,
  },
  {
    name: 'about-zh',
    route: '/about',
    lang: 'zh-Hans',
    brandSelector: '.about-introduction__brand',
    brand: '新亦源供应链 · XINYIYUAN',
    title: /新亦源.*XINYIYUAN/,
    chinese: true,
  },
  {
    name: 'about-en',
    route: '/en/about',
    lang: 'en',
    brandSelector: '.about-introduction__brand',
    brand: 'XINYIYUAN SUPPLY CHAIN',
    title: /XINYIYUAN/,
    chinese: false,
  },
]

async function schemas(page: Page) {
  return page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')))
}

test.describe('brand identity pages', () => {
  for (const viewport of viewports) {
    for (const target of pages) {
      test(`${target.name} ${viewport.name} exposes the stable identity contract`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(target.route, { waitUntil: 'domcontentloaded' })
        await page.evaluate(() => document.fonts?.ready)
        const baseUrl = new URL(page.url()).origin

        await expect(page).toHaveTitle(target.title)
        await expect(page.locator('html')).toHaveAttribute('lang', target.lang)
        const brand = page.locator(target.brandSelector)
        await expect(brand).toHaveText(target.brand)
        await expect(brand).toBeVisible()

        const metadata = await schemas(page)
        const organizations = metadata.filter((item) => item['@type'] === 'Organization')
        expect(organizations).toHaveLength(1)
        expect(organizations[0]).toMatchObject({
          '@id': `${baseUrl}/#organization`,
          name: '新亦源供应链',
          legalName: '广州新亦源供应链管理有限公司',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
        })
        expect(organizations[0].alternateName).toEqual(
          expect.arrayContaining(['新亦源', 'XINYIYUAN', 'XINYIYUAN Supply Chain'])
        )
        expect(organizations[0]).not.toHaveProperty('sameAs')

        const expectedCanonical = `${baseUrl}${target.route === '/' ? '/' : target.route}`
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          'href',
          expectedCanonical
        )
        const localeLinks = await page
          .locator('link[rel="alternate"]')
          .evaluateAll((links) =>
            Object.fromEntries(
              links
                .map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')])
                .filter(([locale, href]) => locale && href)
            )
          )
        const englishRoute =
          target.route === '/'
            ? '/en'
            : target.route.startsWith('/en')
              ? target.route
              : `/en${target.route}`
        expect(localeLinks).toMatchObject({
          en: `${baseUrl}${englishRoute}`,
          'zh-CN': `${baseUrl}${target.route.startsWith('/en') ? target.route.slice(3) || '/' : target.route}`,
          'x-default':
            baseUrl +
            (target.route.startsWith('/en') ? target.route.slice(3) || '/' : target.route),
        })

        if (target.route === '/') {
          const websites = metadata.filter((item) => item['@type'] === 'WebSite')
          expect(websites).toHaveLength(1)
          expect(websites[0]).toMatchObject({
            '@id': `${baseUrl}/#website`,
            url: baseUrl,
            alternateName: ['XINYIYUAN', 'XINYIYUAN Supply Chain'],
          })
        }
        if (target.chinese) await expect(page.locator('main')).toContainText('新亦源')
        else await expect(page.locator('main')).toContainText('XINYIYUAN')

        await brand.scrollIntoViewIfNeeded()
        const geometry = await brand.evaluate((element) => {
          const rect = element.getBoundingClientRect()
          const point = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
          )
          return {
            top: rect.top,
            bottom: rect.bottom,
            viewportHeight: window.innerHeight,
            covered: Boolean(point && point !== element && !element.contains(point)),
            viewportWidth: document.documentElement.clientWidth,
            contentWidth: document.documentElement.scrollWidth,
          }
        })
        expect(geometry.top).toBeGreaterThanOrEqual(0)
        expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight)
        expect(geometry.covered).toBe(false)
        expect(geometry.contentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1)

        await page.screenshot({
          path: testInfo.outputPath(`${target.name}-${viewport.name}.png`),
          fullPage: false,
        })
        if (target.name === 'home-zh' && viewport.name === 'desktop') {
          await brand.screenshot({ path: testInfo.outputPath('home-zh-brand.png') })
        }
        if (target.name === 'about-zh' && viewport.name === 'desktop') {
          await page.locator('.about-overview').screenshot({
            path: testInfo.outputPath('about-zh-overview.png'),
          })
        }
      })
    }
  }
})
