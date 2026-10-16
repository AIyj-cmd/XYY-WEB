import { expect, type Browser, type Page, type TestInfo } from '@playwright/test'

export const preferenceKey = 'xyy-language-preference'

export function contextOptions(testInfo: TestInfo) {
  const use = testInfo.project.use
  return {
    baseURL: use.baseURL,
    viewport: use.viewport,
    isMobile: use.isMobile,
    hasTouch: use.hasTouch,
    userAgent: use.userAgent,
  }
}

export async function openWithLanguages(
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

export async function openWithDeniedStorage(
  browser: Browser,
  testInfo: TestInfo,
  path: string,
  denySessionStorage = false
) {
  const context = await browser.newContext(contextOptions(testInfo))
  await context.addInitScript(
    ({ denySessionStorage }) => {
      Object.defineProperty(navigator, 'languages', { configurable: true, get: () => ['en-US'] })
      Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'en-US' })
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: () => {
          throw new Error('denied')
        },
      })
      if (denySessionStorage) {
        Object.defineProperty(window, 'sessionStorage', {
          configurable: true,
          get: () => {
            throw new Error('denied')
          },
        })
      }
    },
    { denySessionStorage }
  )
  const page = await context.newPage()
  await page.goto(path)
  return { context, page }
}

export async function expectSuggestion(page: Page, visible: boolean) {
  const suggestion = page.locator('#language-suggestion')
  if (visible) {
    await expect(suggestion).toBeVisible()
    await expect(suggestion).toContainText('Prefer English?')
  } else await expect(suggestion).toBeHidden()
}
