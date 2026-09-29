import { expect, test } from '@playwright/test'
import { startEnglishNewsFixture, type EnglishNewsFixture } from '../helpers/english-news-fixture'

let fixture: EnglishNewsFixture

test.describe.serial('English news Unicode visibility fixture', () => {
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

  test('keeps invisible-only Unicode fields out of every public surface', async ({ request }) => {
    const live = fixture.records.find((record) => record.slug === 'english-news-live')
    if (!live) throw new Error('fixture live record missing')
    const cases = [
      { name: 'title', patch: { title_en: '\u200B' } },
      { name: 'summary', patch: { summary_en: '\u200D' } },
      { name: 'zero-width named entity', patch: { content_en: '<p>&ZeroWidthSpace;</p>' } },
      { name: 'zero-width numeric entity', patch: { content_en: '<p>&#8203;</p>' } },
      { name: 'soft hyphen entity', patch: { content_en: '<p>&shy;</p>' } },
    ]

    for (const { name, patch } of cases) {
      fixture.cms.setRecords(
        fixture.records.map((record) =>
          record.slug === live.slug ? { ...record, ...patch } : record
        )
      )

      const list = await request.get(`${fixture.app.url}/en/news`)
      expect(await list.text(), `${name} must stay out of the English list`).not.toContain(
        '/en/news/english-news-live'
      )

      const detail = await request.get(`${fixture.app.url}/en/news/${live.slug}`, {
        maxRedirects: 0,
      })
      expect(detail.status(), `${name} must be a true English 404`).toBe(404)
      expect(await detail.text(), `${name} must not advertise hreflang`).not.toContain('hreflang=')

      const chinese = await request.get(`${fixture.app.url}/news/${live.slug}`)
      expect(chinese.status(), `${name} Chinese detail should remain public`).toBe(200)
      expect(await chinese.text(), `${name} must not create an English article pair`).not.toContain(
        `/en/news/${live.slug}`
      )

      const sitemap = await request.get(`${fixture.app.url}/sitemap.xml`)
      expect(await sitemap.text(), `${name} must stay out of the sitemap`).not.toContain(
        `/en/news/${live.slug}</loc>`
      )
    }
  })

  test('publishes visible Unicode and preserves ZWJ emoji source text', async ({
    page,
    request,
  }) => {
    const live = fixture.records.find((record) => record.slug === 'english-news-live')
    if (!live) throw new Error('fixture live record missing')
    const visible = {
      ...live,
      title_en: 'Returns 👩‍💻 guide',
      summary_en: 'Teams coordinate across São Paulo.',
      content_en: '<p>Warehouse teams 👩‍💻 coordinate returns.</p><p>Family route: 👨‍👩‍👧‍👦.</p>',
    }
    fixture.cms.setRecords(
      fixture.records.map((record) => (record.slug === live.slug ? visible : record))
    )

    const list = await request.get(`${fixture.app.url}/en/news`)
    expect(await list.text()).toContain('/en/news/english-news-live')
    const detail = await request.get(`${fixture.app.url}/en/news/${live.slug}`)
    expect(detail.status()).toBe(200)

    await page.goto(`${fixture.app.url}/en/news/${live.slug}`)
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).toContain('Returns 👩‍💻 guide')
    expect(bodyText).toContain('Teams coordinate across São Paulo.')
    expect(bodyText).toContain('Warehouse teams 👩‍💻 coordinate returns.')
    expect(bodyText).toContain('Family route: 👨‍👩‍👧‍👦.')
  })
})
