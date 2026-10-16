import { expect, type Browser, type BrowserContext, type Page } from '@playwright/test'

export const HOME_HERO = [
  '.hero-eyebrow',
  '.hero-brand-kw',
  '#hero-heading .hl',
  '.hero-sub',
  '.hero-data',
  '.hero-actions',
]
export const HOME_LATER_COPY = [
  '.s-service .svc-problem',
  '.s-service .svc-title',
  '.s-service .svc-sub',
  '.s-service .svc-quality-assurance',
  '.s-service .svc-desc',
  '.s-service .svc-features',
  '.s-service .svc-link',
  '.s-fulfillment',
  '.fulfillment-step',
]
export const SHARED_SERVICE_COPY = ['.service-detail__header', '.service-detail__brief']
export const DETAIL_COPY = ['main h1', 'main h2', 'main p']

const blockedRequests = new WeakMap<BrowserContext, string[]>()

export async function installLocalGuard(
  context: BrowserContext,
  options: { blockScripts?: boolean } = {}
) {
  const blocked: string[] = []
  blockedRequests.set(context, blocked)
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') {
      blocked.push(url.href)
      await route.abort()
    } else if (options.blockScripts && route.request().resourceType() === 'script') {
      await route.abort()
    } else {
      await route.continue()
    }
  })
}

export function getBlockedRequests(context: BrowserContext) {
  return blockedRequests.get(context) ?? []
}

export async function createLocalContext(
  browser: Browser,
  options: {
    width: number
    height: number
    javaScriptEnabled?: boolean
    reducedMotion?: 'reduce' | 'no-preference'
    blockScripts?: boolean
  }
) {
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4399',
    viewport: { width: options.width, height: options.height },
    javaScriptEnabled: options.javaScriptEnabled,
    extraHTTPHeaders: {
      'x-forwarded-proto': 'https',
      'x-forwarded-for': '127.0.0.1',
    },
  })
  await installLocalGuard(context, { blockScripts: options.blockScripts })
  const page = await context.newPage()
  await page.emulateMedia({ reducedMotion: options.reducedMotion ?? 'no-preference' })
  page.setDefaultTimeout(10_000)
  return { context, page }
}

export async function expectEffectivelyVisible(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    const locator = page.locator(selector)
    await expect(locator, `${selector} should exist`).not.toHaveCount(0)
    const result = await locator.evaluateAll((elements) =>
      elements.map((element) => {
        let opacity = 1
        let visible = true
        let current: Element | null = element
        while (current) {
          const style = getComputedStyle(current)
          opacity *= Number(style.opacity)
          if (style.visibility === 'hidden' || style.display === 'none') visible = false
          current = current.parentElement
        }
        const rect = element.getBoundingClientRect()
        return { opacity, visible, area: rect.width * rect.height }
      })
    )
    expect(
      result.every((entry) => entry.opacity > 0.05 && entry.visible && entry.area > 0),
      `${selector} must be effectively visible: ${JSON.stringify(result)}`
    ).toBe(true)
  }
}

export async function expectNoPendingReveal(page: Page) {
  await expect(page.locator('[data-service-detail-reveal]')).toHaveCount(0)
}

export async function scrollAndSettle(page: Page, selector: string) {
  const target = page.locator(selector).first()
  await expect(target).toHaveCount(1)
  await target.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
}

export async function assertNoConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(String(error)))
  return errors
}
