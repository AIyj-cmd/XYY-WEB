import { expect, test } from '@playwright/test'

import {
  expectSuggestion,
  openWithDeniedStorage,
  openWithLanguages,
  preferenceKey,
} from './helpers/language-suggestion'

test.describe('language suggestion storage behavior', () => {
  test('stored English preference hides the suggestion', async ({ browser }, testInfo) => {
    const saved = await openWithLanguages(browser, testInfo, '/about', ['en-US'], 'en-US', 'en')
    await expectSuggestion(saved.page, false)
    await saved.context.close()
  })

  test('stored Chinese preference hides the suggestion', async ({ browser }, testInfo) => {
    const saved = await openWithLanguages(browser, testInfo, '/about', ['en-US'], 'en-US', 'zh-CN')
    await expectSuggestion(saved.page, false)
    await saved.context.close()
  })

  test('malformed stored preference leaves the suggestion visible', async ({
    browser,
  }, testInfo) => {
    const malformed = await openWithLanguages(
      browser,
      testInfo,
      '/about',
      ['en-US'],
      'en-US',
      'invalid'
    )
    await expectSuggestion(malformed.page, true)
    await malformed.context.close()
  })

  test('falls back to session storage when local storage is denied', async ({
    browser,
  }, testInfo) => {
    const fallback = await openWithDeniedStorage(browser, testInfo, '/about')
    await fallback.page.locator('[data-language-choice="zh-CN"]').click()
    await expect(fallback.page.locator('#language-suggestion')).toBeHidden()
    expect(await fallback.page.evaluate((key) => sessionStorage.getItem(key), preferenceKey)).toBe(
      'zh-CN'
    )
    await fallback.page.reload()
    await expectSuggestion(fallback.page, false)
    await fallback.context.close()
  })

  test('survives denied local and session storage', async ({ browser }, testInfo) => {
    const denied = await openWithDeniedStorage(browser, testInfo, '/about', true)
    await denied.page.locator('[data-language-dismiss]').click()
    await expect(denied.page.locator('#language-suggestion')).toBeHidden()
    await denied.page.goto('/about')
    await denied.page.locator('[data-language-choice="en"]').click()
    await expect(denied.page).toHaveURL(/\/en\/about$/)
    await denied.context.close()
  })
})
