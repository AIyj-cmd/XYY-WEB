import { expect, test, type Page } from '@playwright/test'
import {
  expectPreserved,
  fillOptional,
  fillRequired,
  result,
  submit,
} from './helpers/contact-mobile'

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue()
    return route.abort('blockedbyclient')
  })
})

const scenarios = [
  ['400', { status: 400, body: { error: 'mock validation', code: 'validation_failed' } }],
  ['503', { status: 503, body: { error: 'mock storage', code: 'storage_unavailable' } }],
] as const

async function fill(page: Page, locale: 'zh' | 'en') {
  await fillRequired(page, locale)
  await fillOptional(page, locale)
}

for (const locale of ['zh', 'en'] as const) {
  for (const [name, response] of scenarios) {
    test(`${locale} preserves all six fields and focuses summary after API ${name}`, async ({
      page,
    }) => {
      await page.route('**/api/contact', (route) =>
        route.fulfill({ status: response.status, json: response.body })
      )
      await page.goto(locale === 'zh' ? '/contact' : '/en/contact')
      await fill(page, locale)
      await submit(page).click()
      await expect(result(page)).toContainText(
        locale === 'zh'
          ? response.body.error
          : name === '400'
            ? /Please provide your name, a valid email address/
            : /save your enquiry/
      )
      await expect(result(page)).toBeFocused()
      await expectPreserved(page, locale)
    })
  }

  test(`${locale} preserves fields after a network failure`, async ({ page }) => {
    await page.route('**/api/contact', (route) => route.abort('failed'))
    await page.goto(locale === 'zh' ? '/contact' : '/en/contact')
    await fill(page, locale)
    await submit(page).click()
    await expect(result(page)).toContainText(locale === 'zh' ? '提交失败' : 'could not submit')
    await expect(result(page)).toBeFocused()
    await expectPreserved(page, locale)
  })
}

for (const locale of ['zh', 'en'] as const) {
  test(`${locale} invalid optional field opens details and focuses the field`, async ({ page }) => {
    await page.goto(locale === 'zh' ? '/contact' : '/en/contact')
    await fillRequired(page, locale)
    await page.locator('[data-contact-optional-fields] summary').click()
    const invalidField = page.locator(`#contact-form #${locale === 'zh' ? 'email' : 'phone'}`)
    await invalidField.fill(locale === 'zh' ? 'invalid-email' : '12345')
    await page.locator('[data-contact-optional-fields] summary').click()
    await submit(page).click()
    await expect(result(page)).toContainText(
      locale === 'zh' ? '请输入有效的邮箱地址' : 'include + and the country or region code'
    )
    await expect(page.locator('[data-contact-optional-fields]')).toHaveAttribute('open', '')
    await expect(invalidField).toBeFocused()
  })
}

for (const locale of ['zh', 'en'] as const) {
  test(`${locale} aborts a real 15 second pending fetch and retries successfully`, async ({
    page,
  }) => {
    test.setTimeout(40_000)
    let attempts = 0
    await page.route('**/api/contact', async (route) => {
      attempts += 1
      if (attempts === 1) {
        await new Promise((resolve) => setTimeout(resolve, 16_000))
        return route.fulfill({ status: 200, json: { success: true } })
      }
      return route.fulfill({ status: 200, json: { success: true } })
    })
    await page.goto(locale === 'zh' ? '/contact' : '/en/contact')
    await fill(page, locale)
    await submit(page).click()
    await expect(result(page)).toContainText(locale === 'zh' ? '提交超时' : 'request timed out', {
      timeout: 20_000,
    })
    await expectPreserved(page, locale)
    await submit(page).click()
    await expect(result(page)).toContainText(locale === 'zh' ? '提交成功' : 'Thank you')
    await expect(page.locator('#contact-form #name')).toHaveValue('')
    await expect(page.getByRole('checkbox')).not.toBeChecked()
    expect(attempts).toBeGreaterThanOrEqual(2)
  })
}
