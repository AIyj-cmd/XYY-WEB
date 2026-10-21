import { expect, test } from '@playwright/test'
import { startNewsImageFixture } from '../helpers/news-image-fixture'

let fixture: Awaited<ReturnType<typeof startNewsImageFixture>>

test.describe.serial('news body image proxy fixture', () => {
  test.beforeAll(async () => {
    fixture = await startNewsImageFixture()
  })

  test.afterAll(async () => {
    await fixture?.close()
  })

  test('renders six body images through the published asset proxy at desktop and mobile widths', async ({
    page,
    request,
  }) => {
    const direct = await request.get(`${fixture.cmsUrl}/assets/${fixture.imageIds[0]}`)
    expect(direct.status()).toBe(403)

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport)
      await page.goto(`${fixture.app.url}/news/inline-image-fixture`)
      const images = page.locator('[itemprop="articleBody"] img')
      await expect(images).toHaveCount(6)
      await expect
        .poll(() =>
          images.evaluateAll((elements) =>
            elements.every((image) => image instanceof HTMLImageElement && image.naturalWidth > 0)
          )
        )
        .toBe(true)
      await expect
        .poll(() =>
          images.evaluateAll((elements) => elements.every((image) => !image.hasAttribute('srcset')))
        )
        .toBe(true)
      await expect
        .poll(() =>
          images.evaluateAll((elements) =>
            elements.every(
              (image) => image.getAttribute('src')?.startsWith('/api/cms-assets/') === true
            )
          )
        )
        .toBe(true)
    }

    const proxied = await request.get(`${fixture.app.url}/api/cms-assets/${fixture.imageIds[0]}`)
    expect(proxied.status()).toBe(200)
    expect(proxied.headers()['content-type']).toBe('image/png')
    expect(fixture.upstreamAssetRequests).toContain(fixture.imageIds[0])
  })

  test('returns 404 for draft and future inline image IDs without requesting their upstream bytes', async ({
    request,
  }) => {
    for (const id of [fixture.draftId, fixture.futureId]) {
      const response = await request.get(`${fixture.app.url}/api/cms-assets/${id}`)
      expect(response.status()).toBe(404)
      expect(fixture.upstreamAssetRequests).not.toContain(id)
    }
  })
})
