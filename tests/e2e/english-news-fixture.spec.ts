import { expect, test } from '@playwright/test'
import {
  startEnglishNewsFixture,
  type EnglishNewsFixture,
  type EnglishNewsFixtureMode,
} from '../helpers/english-news-fixture'

let fixture: EnglishNewsFixture

test.describe.serial('English news independent CMS fixture', () => {
  test.beforeAll(async () => {
    fixture = await startEnglishNewsFixture()
  })

  test.afterAll(async () => {
    await fixture?.app.close()
    await fixture?.cms.close()
  })

  test.beforeEach(async () => {
    fixture.cms.setMode('ok')
    fixture.cms.setRecords(fixture.records)
  })

  test('publishes complete English content with reciprocal language links', async ({
    page,
    request,
  }) => {
    const listResponse = await request.get(`${fixture.app.url}/en/news`)
    expect(listResponse.status()).toBe(200)

    await page.goto(`${fixture.app.url}/en/news`)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(
      page.getByRole('heading', { name: 'Apparel fulfilment insights', level: 1 })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'A live English insight' })).toHaveAttribute(
      'href',
      '/en/news/english-news-live'
    )
    await expect(page.getByRole('link', { name: 'Draft English insight' })).toHaveCount(0)

    const detailResponse = await request.get(`${fixture.app.url}/en/news/english-news-live`)
    expect(detailResponse.status()).toBe(200)
    await page.goto(`${fixture.app.url}/en/news/english-news-live`)
    await expect(page.locator('h1')).toHaveText('A live English insight')
    await expect(page.locator('[itemprop="articleBody"]')).toContainText(
      'Visible English body content.'
    )
    await expect(page.locator('[itemprop="articleBody"] script')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/en\/news\/english-news-live$/
    )
    await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute(
      'href',
      /\/news\/english-news-live$/
    )

    const chineseSwitch = page.getByRole('link', { name: '查看此页面的中文版本' })
    await expect(chineseSwitch).toHaveAttribute('href', '/news/english-news-live')
    await chineseSwitch.click()
    await expect(page).toHaveURL(/\/news\/english-news-live$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
    await expect(page.getByRole('link', { name: 'View this page in English' })).toHaveAttribute(
      'href',
      '/en/news/english-news-live'
    )
  })

  test('keeps Chinese-only legacy records working without English fields', async ({
    page,
    request,
  }) => {
    const legacyRecord = fixture.records.find((record) => record.slug === 'english-news-live')
    if (!legacyRecord) throw new Error('fixture live record missing')
    const legacy = { ...legacyRecord }
    for (const field of [
      'title_en',
      'summary_en',
      'content_en',
      'english_status',
      'english_published_at',
    ]) {
      Reflect.deleteProperty(legacy, field)
    }
    fixture.cms.setRecords([
      legacy,
      ...fixture.records.filter((record) => record.slug !== 'english-news-live'),
    ])

    const response = await request.get(`${fixture.app.url}/news/english-news-live`)
    expect(response.status()).toBe(200)
    await page.goto(`${fixture.app.url}/news/english-news-live`)
    await expect(page.locator('h1')).toHaveText('中文 live article')
    await expect(page.locator('#site-language-switch')).toHaveAttribute('href', '/en')
  })

  test('returns true 404 without hreflang for unpublished, incomplete, future, and unknown slugs', async ({
    request,
  }) => {
    const slugs = [
      'english-news-draft',
      'english-news-future',
      'english-news-archived',
      'english-news-missing-body',
      'does-not-exist',
    ]
    for (const slug of slugs) {
      const response = await request.get(`${fixture.app.url}/en/news/${slug}`, { maxRedirects: 0 })
      expect(response.status(), `${slug} should be a true 404`).toBe(404)
      const body = await response.text()
      expect(body, `${slug} must not advertise a language pair`).not.toContain('hreflang=')
    }
  })

  test('keeps sitemap English entries aligned with public visibility', async ({ request }) => {
    const response = await request.get(`${fixture.app.url}/sitemap.xml`)
    expect(response.status()).toBe(200)
    const sitemap = await response.text()
    expect(sitemap).toContain('/en/news/english-news-live</loc>')
    expect(sitemap).toContain('/en/news/english-news-related</loc>')
    for (const slug of [
      'english-news-draft',
      'english-news-future',
      'english-news-archived',
      'english-news-missing-body',
    ]) {
      expect(sitemap).not.toContain(`/en/news/${slug}</loc>`)
    }
  })

  test('updates visibility, related links, language pairing, and sitemap after state changes', async ({
    page,
    request,
  }) => {
    const live = fixture.records.find((record) => record.slug === 'english-news-live')
    if (!live) throw new Error('fixture live record missing')
    const current = () => fixture.records.map((record) => ({ ...record }))

    const visibleList = await request.get(`${fixture.app.url}/en/news`)
    expect(await visibleList.text()).toContain('/en/news/english-news-live')
    expect((await request.get(`${fixture.app.url}/en/news/english-news-live`)).status()).toBe(200)
    expect(await (await request.get(`${fixture.app.url}/sitemap.xml`)).text()).toContain(
      '/en/news/english-news-live</loc>'
    )

    fixture.cms.setRecords(
      current().map((record) =>
        record.slug === live.slug ? { ...record, english_status: 'draft' } : record
      )
    )
    expect(await (await request.get(`${fixture.app.url}/en/news`)).text()).not.toContain(
      '/en/news/english-news-live'
    )
    const withdrawnEnglish = await request.get(`${fixture.app.url}/en/news/${live.slug}`)
    expect(withdrawnEnglish.status()).toBe(404)
    expect(
      await (await request.get(`${fixture.app.url}/en/news/english-news-related`)).text()
    ).not.toContain('/en/news/english-news-live')
    expect(await (await request.get(`${fixture.app.url}/sitemap.xml`)).text()).not.toContain(
      '/en/news/english-news-live</loc>'
    )
    await page.goto(`${fixture.app.url}/news/${live.slug}`)
    await expect(page.locator('#site-language-switch')).toHaveAttribute('href', '/en')

    fixture.cms.setRecords(
      current().map((record) =>
        record.slug === live.slug
          ? { ...record, english_status: 'published', status: 'draft' }
          : record
      )
    )
    expect((await request.get(`${fixture.app.url}/en/news/${live.slug}`)).status()).toBe(404)
    expect(
      (await request.get(`${fixture.app.url}/news/${live.slug}`, { maxRedirects: 0 })).status()
    ).not.toBe(200)

    fixture.cms.setRecords(
      current().map((record) =>
        record.slug === live.slug
          ? {
              ...record,
              status: 'published',
              published_at: new Date(Date.now() + 86_400_000).toISOString(),
            }
          : record
      )
    )
    expect((await request.get(`${fixture.app.url}/en/news/${live.slug}`)).status()).toBe(404)
    expect(await (await request.get(`${fixture.app.url}/en/news`)).text()).not.toContain(
      '/en/news/english-news-live'
    )

    fixture.cms.setRecords(fixture.records)
    expect((await request.get(`${fixture.app.url}/en/news/${live.slug}`)).status()).toBe(200)
  })

  test('allows only unavailable CMS errors to use an empty fallback', async ({ request }) => {
    const cases: Array<[EnglishNewsFixtureMode, number]> = [
      ['empty', 200],
      ['unavailable', 200],
      ['unauthorized', 500],
      ['forbidden', 500],
      ['invalid', 500],
    ]
    for (const [mode, expectedStatus] of cases) {
      fixture.cms.setMode(mode)
      const response = await request.get(`${fixture.app.url}/en/news`, { maxRedirects: 0 })
      expect(response.status(), `${mode} response status`).toBe(expectedStatus)
      if (expectedStatus === 200)
        expect(await response.text()).toContain('No published English insights yet')
    }
  })
})
