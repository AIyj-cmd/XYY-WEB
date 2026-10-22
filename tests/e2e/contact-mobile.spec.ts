import { expect, test } from '@playwright/test'
import {
  eligibleVisibleFields,
  fillOptional,
  fillRequired,
  form,
  expectNoHorizontalOverflow,
} from './helpers/contact-mobile'

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue()
    return route.abort('blockedbyclient')
  })
})

const cases = [
  ['zh', '/contact'],
  ['en', '/en/contact'],
] as const
const widths = [360, 390, 430, 1440] as const

for (const [locale, path] of cases) {
  for (const width of widths) {
    test(`${locale} ${width}px keeps all contact fields readable`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 1000 ? 900 : 844 })
      await page.goto(path)
      await expect(form(page)).toBeVisible()
      await expect.poll(() => eligibleVisibleFields(page)).toBe(7)
      await expectNoHorizontalOverflow(page)
      await expect(
        page.locator(
          '#contact-form #name, #contact-form #countryOrRegion, #contact-form #phone, #contact-form #email, #contact-form #company, #contact-form #service, #contact-form #message'
        )
      ).toHaveCount(7)
    })
  }
}

test('keeps optional contact fields visible before service and requirements on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/contact')
  await expect.poll(() => eligibleVisibleFields(page)).toBe(7)
  const fieldOrder = await page
    .locator(
      '#contact-form input:not([type="hidden"]):not([type="checkbox"]):visible, #contact-form select:visible, #contact-form textarea:visible'
    )
    .evaluateAll((fields) => fields.map((field) => field.getAttribute('name')))
  expect(fieldOrder).toEqual([
    'name',
    'phone',
    'countryOrRegion',
    'company',
    'email',
    'service',
    'message',
  ])
  await expectNoHorizontalOverflow(page)
})

test('filled optional fields remain in the DOM and service context is SSR-only', async ({
  page,
}) => {
  const scripts: string[] = []
  page.on('response', async (response) => {
    if (response.url().includes('/_astro/') && response.url().endsWith('.js')) {
      try {
        scripts.push((await response.body()).toString('utf8'))
      } catch (error) {
        void error
      }
    }
  })
  await page.goto('/en/contact?from=%2Fxiefu-yuncang&entry=hero')
  await fillRequired(page, 'en')
  await fillOptional(page, 'en')
  await expect(page.locator('[aria-label="Service page context"]')).toContainText(
    'Apparel fulfilment'
  )
  await expectNoHorizontalOverflow(page)
  await page.waitForTimeout(250)
  expect(scripts.join('\n')).not.toMatch(
    /SERVICE_PAGE_CONFIG|RAW_SERVICE_PAGE_CONFIG|ENGLISH_SERVICE_SOURCES/
  )
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  for (const [locale, path] of cases) {
    test(`${locale} contact remains readable with all fields visible`, async ({ page }) => {
      const target = locale === 'en' ? `${path}?from=%2Fxiefu-yuncang&entry=hero` : path
      await page.goto(target)
      await expect.poll(() => eligibleVisibleFields(page)).toBe(7)
      if (locale === 'en') {
        await expect(page.locator('[aria-label="Service page context"]')).toContainText(
          'Apparel fulfilment'
        )
      }
      await expectNoHorizontalOverflow(page)
    })
  }
})
