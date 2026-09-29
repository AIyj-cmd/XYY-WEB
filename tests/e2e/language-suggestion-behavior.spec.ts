import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test'

const preferenceKey = 'xyy-language-preference'

function contextOptions(testInfo: TestInfo) {
  const use = testInfo.project.use
  return {
    baseURL: use.baseURL,
    viewport: use.viewport,
    isMobile: use.isMobile,
    hasTouch: use.hasTouch,
    userAgent: use.userAgent,
  }
}

async function openWithLanguages(
  browser: Browser,
  testInfo: TestInfo,
  path: string,
  languages: string[],
  fallback = 'en-US',
  stored?: string
) {
  const context = await browser.newContext(contextOptions(testInfo))
  await context.addInitScript(
    ({ languages, fallback, stored, preferenceKey }) => {
      Object.defineProperty(navigator, 'languages', { configurable: true, get: () => languages })
      Object.defineProperty(navigator, 'language', { configurable: true, get: () => fallback })
      if (stored !== undefined) window.localStorage.setItem(preferenceKey, stored)
    },
    { languages, fallback, stored, preferenceKey }
  )
  const page = await context.newPage()
  await page.goto(path)
  return { context, page }
}

async function expectSuggestion(page: Page, visible: boolean) {
  const suggestion = page.locator('#language-suggestion')
  if (visible) {
    await expect(suggestion).toBeVisible()
    await expect(suggestion).toContainText('Prefer English?')
  } else await expect(suggestion).toBeHidden()
}

test.describe('language suggestion behavior', () => {
  test('uses first supported language, fallback language, and no redirect', async ({
    browser,
  }, testInfo) => {
    const cases = [
      { languages: ['en-US', 'zh-CN'], visible: true },
      { languages: ['zh-CN', 'en-US'], visible: false },
      { languages: ['fr-FR', 'de-DE'], visible: false },
      { languages: [], fallback: 'en-GB', visible: true },
    ]
    for (const preference of cases) {
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
    }

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

  test('persists keep, close, Escape, and manual switch choices', async ({ browser }, testInfo) => {
    for (const action of ['keep', 'close', 'escape'] as const) {
      const { context, page } = await openWithLanguages(browser, testInfo, '/about', ['en-US'])
      const suggestion = page.locator('#language-suggestion')
      if (action === 'keep') await suggestion.locator('[data-language-choice="zh-CN"]').click()
      if (action === 'close') await suggestion.locator('[data-language-dismiss]').click()
      if (action === 'escape') {
        await suggestion.locator('[data-language-dismiss]').focus()
        await page.keyboard.press('Escape')
      }
      await expect(suggestion).toBeHidden()
      await expect(page.locator('#site-language-switch')).toBeFocused()
      await page.reload()
      await expectSuggestion(page, false)
      await page.goto('/contact')
      await expectSuggestion(page, false)
      await context.close()
    }

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

  test('handles malformed, denied, and fallback storage safely', async ({ browser }, testInfo) => {
    for (const stored of ['en', 'zh-CN']) {
      const saved = await openWithLanguages(browser, testInfo, '/about', ['en-US'], 'en-US', stored)
      await expectSuggestion(saved.page, false)
      await saved.context.close()
    }

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

    const fallback = await browser.newContext(contextOptions(testInfo))
    await fallback.addInitScript(() => {
      Object.defineProperty(navigator, 'languages', { configurable: true, get: () => ['en-US'] })
      Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'en-US' })
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: () => {
          throw new Error('denied')
        },
      })
    })
    const fallbackPage = await fallback.newPage()
    await fallbackPage.goto('/about')
    await fallbackPage.locator('[data-language-choice="zh-CN"]').click()
    await expect(fallbackPage.locator('#language-suggestion')).toBeHidden()
    expect(await fallbackPage.evaluate((key) => sessionStorage.getItem(key), preferenceKey)).toBe(
      'zh-CN'
    )
    await fallbackPage.reload()
    await expectSuggestion(fallbackPage, false)
    await fallback.close()

    const denied = await browser.newContext(contextOptions(testInfo))
    await denied.addInitScript(() => {
      Object.defineProperty(navigator, 'languages', { configurable: true, get: () => ['en-US'] })
      Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'en-US' })
      for (const name of ['localStorage', 'sessionStorage']) {
        Object.defineProperty(window, name, {
          configurable: true,
          get: () => {
            throw new Error('denied')
          },
        })
      }
    })
    const deniedPage = await denied.newPage()
    await deniedPage.goto('/about')
    await deniedPage.locator('[data-language-dismiss]').click()
    await expect(deniedPage.locator('#language-suggestion')).toBeHidden()
    await deniedPage.goto('/about')
    await deniedPage.locator('[data-language-choice="en"]').click()
    await expect(deniedPage).toHaveURL(/\/en\/about$/)
    await denied.close()
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
