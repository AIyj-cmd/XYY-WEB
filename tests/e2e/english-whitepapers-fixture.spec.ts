import { expect, test } from '@playwright/test'
import {
  startEnglishWhitepaperFixture,
  type EnglishWhitepaperFixture,
  type WhitepaperFixtureMode,
} from '../helpers/english-whitepapers-fixture'
let fixture: EnglishWhitepaperFixture
const pageUrl = () => `${fixture.app.url}/en/supply-chain-whitepapers`
test.describe.serial('English whitepaper independent CMS fixture', () => {
  test.beforeAll(async () => {
    fixture = await startEnglishWhitepaperFixture()
  })
  test.afterAll(async () => {
    await fixture?.app.close()
    await fixture?.cms.close()
  })
  test.beforeEach(async () => {
    fixture.cms.reset()
    fixture.cms.setMode('publications', 'ok')
    fixture.cms.setMode('faqs', 'ok')
  })
  test('renders 14 English summaries, source labels, FAQs and original links', async ({
    page,
    request,
  }) => {
    expect((await request.get(pageUrl())).status()).toBe(200)
    await page.goto(pageUrl())
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1')).toHaveText('Supply-chain whitepapers')
    await expect(page.locator('#issues article h3')).toHaveCount(14)
    const titles = await page.locator('#issues article h3').allTextContents()
    expect(titles.join('\n')).not.toMatch(/[\u3400-\u9fff]/)
    await expect(page.locator('#issues article').filter({ hasText: 'Issue 10' })).toContainText(
      'source conflict retained'
    )
    await expect(page.locator('#issues article').filter({ hasText: 'Issue 14' })).toContainText(
      'June 2026 (cover)'
    )
    await expect(page.locator('#issues article').filter({ hasText: 'Issue 12' })).toContainText(
      'original contents page also shows 03–07'
    )
    await expect(page.locator('section[aria-labelledby="page-faq-heading"] details')).toHaveCount(8)
    await page
      .locator('section[aria-labelledby="page-faq-heading"] details')
      .first()
      .locator('summary')
      .click()
    await expect(
      page.locator('section[aria-labelledby="page-faq-heading"] details').first().locator('p')
    ).toContainText('knowledge library')
    const original = page.getByRole('link', { name: 'Read original Chinese article' }).first()
    await expect(original).toHaveAttribute('href', '/supply-chain-whitepapers/14/')
    await original.click()
    await expect(page).toHaveURL(/\/supply-chain-whitepapers\/14\/$/)
    await expect(page.locator('h1')).toHaveText('鞋服产品增长、跨境供应链与上海云仓实践')
    await expect(page.locator('.whitepaper-article__source')).toContainText('第14期')
    await page.goto(pageUrl())
    await expect(
      page
        .locator('section[aria-labelledby="english-whitepapers-conversion-cta-heading"]')
        .getByRole('link', { name: 'Contact us' })
    ).toHaveAttribute('href', '/en/contact')
    const pdf = await page
      .locator('#issues article')
      .first()
      .getByRole('link', { name: 'Open original Chinese PDF' })
      .getAttribute('href')
    expect(pdf).toBe('/senlinqikan/pdf/14.pdf')
    expect((await request.get(`${fixture.app.url}${pdf}`)).status()).toBe(200)
  })
  test('keeps root, trailing-slash pair, Insights active state, sitemap and llms aligned', async ({
    page,
    request,
  }) => {
    await page.goto(`${fixture.app.url}/`)
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /\/en$/)
    await expect(page.locator('#site-language-switch')).toHaveAttribute('href', '/en')
    await page.goto(`${fixture.app.url}/en`)
    await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute('href', /\/$/)
    await expect(page.locator('#site-language-switch')).toHaveAttribute('href', '/')
    await page.goto(`${fixture.app.url}/supply-chain-whitepapers/`)
    await expect(page.locator('#site-language-switch')).toHaveAttribute(
      'href',
      '/en/supply-chain-whitepapers'
    )
    await page.goto(pageUrl())
    await expect(page.locator('#site-language-switch')).toHaveAttribute(
      'href',
      '/supply-chain-whitepapers/'
    )
    await expect(page.locator('a[href="/en/news"][aria-current="page"]')).toHaveCount(2)
    const sitemap = await (await request.get(`${fixture.app.url}/sitemap.xml`)).text()
    expect(sitemap).toContain('/en/supply-chain-whitepapers</loc>')
    const llms = await (await request.get(`${fixture.app.url}/llms.txt`)).text()
    expect(llms).toContain('/en/supply-chain-whitepapers')
    for (const [path, expected] of [
      ['/en/cases', '/en/cases'],
      ['/en/news', '/en/news'],
    ] as const) {
      await page.goto(`${fixture.app.url}${path}`)
      await expect(page.locator('#site-language-switch')).toHaveAttribute(
        'href',
        expected === '/en/news' ? '/news' : '/cases'
      )
    }
  })

  test('keeps successful CMS empty results empty and omits unknown issues or stale FAQ', async ({
    page,
  }) => {
    fixture.cms.setMode('publications', 'empty')
    await page.goto(pageUrl())
    await expect(page.locator('#issues article')).toHaveCount(0)
    await expect(
      page.getByRole('heading', { name: 'No whitepapers are currently available' })
    ).toBeVisible()
    fixture.cms.setMode('publications', 'ok')
    fixture.cms.setMode('faqs', 'empty')
    await page.goto(pageUrl())
    await expect(page.locator('#issues article h3')).toHaveCount(14)
    await expect(page.locator('section[aria-labelledby="page-faq-heading"]')).toHaveCount(0)
    fixture.cms.setRecords('publications', [
      ...fixture.records,
      { issue: 15, id: 99, status: 'published', sort: 15 },
    ])
    await page.goto(pageUrl())
    await expect(page.locator('#issues article h3')).toHaveCount(14)
    fixture.cms.setMode('faqs', 'ok')
    const changed = {
      id: 1,
      sort: 1,
      status: 'published',
      faq_page: { key: 'senlinqikan' },
      question: 'changed source',
      answer: 'changed source',
    }
    fixture.cms.setRecords('faqs', [changed])
    await page.goto(pageUrl())
    await expect(page.locator('section[aria-labelledby="page-faq-heading"]')).toHaveCount(0)
  })
  test('uses fallback for network or unavailable publications and FAQs', async ({ page }) => {
    fixture.cms.setMode('publications', 'network')
    await page.goto(pageUrl())
    await expect(page.locator('#issues article h3')).toHaveCount(14)
    fixture.cms.setMode('publications', 'unavailable')
    await page.goto(pageUrl())
    await expect(page.locator('#issues article h3')).toHaveCount(14)
    for (const mode of ['network', 'unavailable'] as const) {
      fixture.cms.reset()
      fixture.cms.setMode('faqs', mode)
      await page.goto(pageUrl())
      await expect(page.locator('section[aria-labelledby="page-faq-heading"] details')).toHaveCount(
        8
      )
    }
  })

  test('fails SSR explicitly for authorization and invalid CMS responses', async ({ request }) => {
    const modes: WhitepaperFixtureMode[] = ['unauthorized', 'forbidden', 'invalid']
    for (const collection of ['publications', 'faqs'] as const) {
      for (const mode of modes) {
        fixture.cms.setMode(collection, mode)
        expect(
          (await request.get(pageUrl(), { maxRedirects: 0 })).status(),
          `${collection}:${mode}`
        ).toBe(500)
        fixture.cms.reset()
      }
    }
  })
})
