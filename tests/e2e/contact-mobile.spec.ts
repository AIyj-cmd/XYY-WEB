import { expect, test } from '@playwright/test'
import {
  eligibleVisibleFields,
  fillOptional,
  fillRequired,
  form,
  optional,
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
    test(`${locale} ${width}px keeps four primary contact fields readable`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 1000 ? 900 : 844 })
      await page.goto(path)
      await expect(form(page)).toBeVisible()
      await expect(optional(page)).not.toHaveAttribute('open', '')
      await expect.poll(() => eligibleVisibleFields(page)).toBe(4)
      await expectNoHorizontalOverflow(page)
      await expect(
        page.locator(
          '#contact-form #name, #contact-form #phone, #contact-form #email, #contact-form #company, #contact-form #service, #contact-form #message'
        )
      ).toHaveCount(6)
    })
  }
}

test('native optional details support keyboard and touch without changing primary layout', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/contact')
  const summary = optional(page).locator('summary')
  const documentHeadingY = () =>
    page.evaluate(() => {
      const heading = document.querySelector('h1')
      if (!heading) return null
      const rect = heading.getBoundingClientRect()
      return rect.top + window.scrollY
    })
  const before = await documentHeadingY()
  await summary.focus()
  await summary.press('Enter')
  await expect(optional(page)).toHaveAttribute('open', '')
  await expect.poll(() => eligibleVisibleFields(page)).toBe(6)
  await summary.press('Space')
  await expect(optional(page)).not.toHaveAttribute('open', '')
  if (testInfo.project.name === 'mobile') {
    const box = await summary.boundingBox()
    if (!box) throw new Error('missing_optional_summary_box')
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
    await expect(optional(page)).toHaveAttribute('open', '')
  }
  await expectNoHorizontalOverflow(page)
  expect(before).not.toBeNull()
  expect(await documentHeadingY()).toBeCloseTo(before as number, 5)
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
    test(`${locale} contact remains readable with native details`, async ({ page }) => {
      const target = locale === 'en' ? `${path}?from=%2Fxiefu-yuncang&entry=hero` : path
      await page.goto(target)
      await expect.poll(() => eligibleVisibleFields(page)).toBe(4)
      await expect(optional(page)).not.toHaveAttribute('open', '')
      if (locale === 'en') {
        await expect(page.locator('[aria-label="Service page context"]')).toContainText(
          'Apparel fulfilment'
        )
      }
      await optional(page).locator('summary').click()
      await expect(optional(page)).toHaveAttribute('open', '')
      await expect.poll(() => eligibleVisibleFields(page)).toBe(6)
      await expectNoHorizontalOverflow(page)
    })
  }
})
