import { expect, test } from '@playwright/test'

import { contextOptions, expectSuggestion, openWithLanguages } from './helpers/language-suggestion'

test.describe('language suggestion behavior', () => {
  const languageCases = [
    { name: 'first supported language', languages: ['en-US', 'zh-CN'], visible: true },
    { name: 'first Chinese language', languages: ['zh-CN', 'en-US'], visible: false },
    { name: 'unsupported languages', languages: ['fr-FR', 'de-DE'], visible: false },
    { name: 'fallback language', languages: [], fallback: 'en-GB', visible: true },
  ]

  for (const preference of languageCases) {
    test(`uses ${preference.name} without redirect`, async ({ browser }, testInfo) => {
      const { context, page } = await openWithLanguages(
        browser,
        testInfo,
        '/about',
        preference.languages,
        preference.fallback
      )
      await expect(page).toHaveURL(/\/about$/)
      await expectSuggestion(page, preference.visible)
      await context.close()
    })
  }

  test('keeps an English destination without a suggestion', async ({ browser }, testInfo) => {
    const english = await openWithLanguages(browser, testInfo, '/en/about', ['en-US'])
    await expectSuggestion(english.page, false)
    await english.context.close()
  })

  test('accepts paired and unpaired destinations without automatic navigation', async ({
    browser,
  }, testInfo) => {
    const paired = await openWithLanguages(browser, testInfo, '/about', ['en-US'])
    await paired.page.locator('[data-language-choice="en"]').click()
    await expect(paired.page).toHaveURL(/\/en\/about$/)
    await paired.context.close()

    const unpaired = await openWithLanguages(browser, testInfo, '/supply-chain-whitepapers/14/', [
      'en-US',
    ])
    await expect(unpaired.page.locator('[data-language-choice="en"]')).toHaveAttribute(
      'href',
      '/en'
    )
    await unpaired.page.locator('[data-language-choice="en"]').click()
    await expect(unpaired.page).toHaveURL(/\/en$/)
    await unpaired.context.close()
  })

  test('persists keep choice across reload and contact navigation', async ({
    browser,
  }, testInfo) => {
    const { context, page } = await openWithLanguages(browser, testInfo, '/about', ['en-US'])
    const suggestion = page.locator('#language-suggestion')
    await suggestion.locator('[data-language-choice="zh-CN"]').click()
    await expect(suggestion).toBeHidden()
    await expect(page.locator('#site-language-switch')).toBeFocused()
    await page.reload()
    await expectSuggestion(page, false)
    await page.goto('/contact')
    await expectSuggestion(page, false)
    await context.close()
  })

  test('persists close choice across reload and contact navigation', async ({
    browser,
  }, testInfo) => {
    const { context, page } = await openWithLanguages(browser, testInfo, '/about', ['en-US'])
    const suggestion = page.locator('#language-suggestion')
    await suggestion.locator('[data-language-dismiss]').click()
    await expect(suggestion).toBeHidden()
    await expect(page.locator('#site-language-switch')).toBeFocused()
    await page.reload()
    await expectSuggestion(page, false)
    await page.goto('/contact')
    await expectSuggestion(page, false)
    await context.close()
  })

  test('persists Escape choice across reload and contact navigation', async ({
    browser,
  }, testInfo) => {
    const { context, page } = await openWithLanguages(browser, testInfo, '/about', ['en-US'])
    const suggestion = page.locator('#language-suggestion')
    await suggestion.locator('[data-language-dismiss]').focus()
    await page.keyboard.press('Escape')
    await expect(suggestion).toBeHidden()
    await expect(page.locator('#site-language-switch')).toBeFocused()
    await page.reload()
    await expectSuggestion(page, false)
    await page.goto('/contact')
    await expectSuggestion(page, false)
    await context.close()
  })

  test('manual language switch persists across paired routes', async ({ browser }, testInfo) => {
    const manual = await openWithLanguages(browser, testInfo, '/about', ['en-US'])
    await manual.page.locator('#site-language-switch').click()
    await expect(manual.page).toHaveURL(/\/en\/about$/)
    await manual.page.goto('/about')
    await expectSuggestion(manual.page, false)
    await manual.page.reload()
    await expectSuggestion(manual.page, false)
    await manual.page.goto('/en/about')
    await manual.page.locator('#site-language-switch').click()
    await expect(manual.page).toHaveURL(/\/about$/)
    await manual.page.goto('/about')
    await expectSuggestion(manual.page, false)
    await manual.context.close()
  })

  test('keeps focus local, restores the manual switch, and preserves no-JS link behavior', async ({
    browser,
  }, testInfo) => {
    const { context, page } = await openWithLanguages(browser, testInfo, '/about', ['en-US'])
    await page.locator('#site-language-switch').focus()
    await page.keyboard.press('Escape')
    await expect(page.locator('#language-suggestion')).toBeVisible()
    await page.locator('[data-language-dismiss]').focus()
    await page.keyboard.press('Escape')
    await expect(page.locator('#language-suggestion')).toBeHidden()
    await expect(page.locator('#site-language-switch')).toBeFocused()
    await context.close()

    const noJs = await browser.newContext({
      ...contextOptions(testInfo),
      javaScriptEnabled: false,
    })
    const noJsPage = await noJs.newPage()
    await noJsPage.goto('/about')
    await expect(noJsPage.locator('#language-suggestion')).toHaveAttribute('hidden', '')
    await expect(noJsPage.locator('#site-language-switch')).toHaveAttribute('href', '/en/about')
    await expect(noJsPage.locator('#site-language-switch')).toBeVisible()
    await noJs.close()
  })
})
