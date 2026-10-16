import { expect, test } from '@playwright/test'
import {
  DETAIL_COPY,
  HOME_HERO,
  HOME_LATER_COPY,
  createLocalContext,
  expectEffectivelyVisible,
  expectNoPendingReveal,
  getBlockedRequests,
  scrollAndSettle,
} from './helpers/content-visibility'

const serviceRoutes = [
  '/yundao-zhineng-jijian',
  '/en/smart-shipping',
  '/xiefu-yuncang',
  '/en/apparel-fulfillment',
  '/tuihuo-zhijian',
  '/en/returns-inspection',
  '/houzheng-xiufu',
  '/en/garment-care',
  '/kuajing-yuncang',
  '/en/cross-border-fulfillment',
  '/huanan-xiefu-yuncang',
  '/en/south-china-fulfillment',
  '/huadong-xiefu-yuncang',
  '/en/east-china-fulfillment',
  '/zhibo-cangpei',
  '/en/livestream-fulfillment',
  '/b2b-mendian-cangpei',
  '/en/retail-distribution',
]

const representativeRoutes = [
  '/product',
  '/en/services',
  '/about',
  '/en/about',
  '/contact',
  '/en/contact',
  '/cases',
  '/en/cases',
  '/news',
  '/en/news',
  '/supply-chain-whitepapers',
  '/en/supply-chain-whitepapers',
]

async function expectFirstHeadingVisible(page: import('@playwright/test').Page) {
  const heading = page.locator('main h1, main h2, main h3').first()
  await expect(heading).toHaveCount(1)
  const state = await heading.evaluate((element) => {
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
  expect(state.opacity, 'first content heading opacity').toBeGreaterThan(0.05)
  expect(state.visible && state.area > 0, 'first content heading geometry').toBe(true)
}

async function checkHome(
  page: import('@playwright/test').Page,
  waitForMotion = false,
  screenshotName?: string
) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  if (waitForMotion) await page.waitForTimeout(2_200)
  await expectEffectivelyVisible(page, HOME_HERO)
  await expect(page.locator('.hero-actions a')).toHaveCount(2)
  await expect(page.locator('.hero-actions a').first()).toHaveAttribute('href', '/contact')
  if (screenshotName) {
    await page.screenshot({
      path: `${process.env.LUNA_EVIDENCE_DIR ?? 'output/diagnostics/xyy-20261014-05/luna/repair'}/${screenshotName}`,
    })
  }
  await scrollAndSettle(page, '.s-service')
  await scrollAndSettle(page, '.s-fulfillment')
  await expectEffectivelyVisible(page, HOME_LATER_COPY)
}

test.describe('default content visibility', () => {
  test.describe.configure({ timeout: 180_000 })

  test('Chinese home is readable on desktop and mobile without JS', async ({ browser }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 430, height: 900 },
    ]) {
      const { context, page } = await createLocalContext(browser, {
        ...viewport,
        javaScriptEnabled: false,
      })
      await checkHome(page, false, viewport.width === 1440 ? 'home-nojs-desktop.png' : undefined)
      expect(getBlockedRequests(context)).toEqual([])
      await context.close()
    }
  })

  test('normal JS, blocked scripts, and reduced motion keep home copy readable', async ({
    browser,
  }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 430, height: 900 },
    ]) {
      const normal = await createLocalContext(browser, viewport)
      const errors: string[] = []
      normal.page.on(
        'console',
        (message) => message.type() === 'error' && errors.push(message.text())
      )
      normal.page.on('pageerror', (error) => errors.push(String(error)))
      const response = await normal.page.goto('/', { waitUntil: 'domcontentloaded' })
      expect(response?.status()).toBe(200)
      await normal.page.waitForTimeout(2_200)
      await expectEffectivelyVisible(normal.page, HOME_HERO)
      if (viewport.width === 1440) {
        await normal.page.screenshot({
          path: `${process.env.LUNA_EVIDENCE_DIR ?? 'output/diagnostics/xyy-20261014-05/luna/repair'}/home-js-settled-desktop.png`,
        })
      }
      await scrollAndSettle(normal.page, '.s-service')
      await scrollAndSettle(normal.page, '.s-fulfillment')
      await expectEffectivelyVisible(normal.page, HOME_LATER_COPY)
      expect(errors).toEqual([])
      const csp = response?.headers()['content-security-policy'] ?? ''
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/)
      expect(csp).toMatch(/connect-src\s+'self'/)
      await normal.context.close()

      const blocked = await createLocalContext(browser, { ...viewport, blockScripts: true })
      await checkHome(blocked.page)
      await blocked.context.close()

      const reduced = await createLocalContext(browser, { ...viewport, reducedMotion: 'reduce' })
      await checkHome(reduced.page)
      await expect(reduced.page.locator('.scroll-cue')).toHaveCSS('animation-name', 'none')
      await reduced.context.close()
    }
  })

  test('partial animation and observer faults reveal content and leave no pending markers', async ({
    browser,
  }) => {
    const waapi = await createLocalContext(browser, { width: 1440, height: 900 })
    await waapi.page.addInitScript(() => {
      const original = Element.prototype.animate
      let calls = 0
      Element.prototype.animate = function (...args) {
        calls += 1
        if (calls === 2) throw new Error('luna-partial-waapi-fault')
        return original.apply(this, args)
      }
    })
    await checkHome(waapi.page, true)
    await expectEffectivelyVisible(waapi.page, ['.fulfillment-step'])
    await waapi.context.close()

    const observer = await createLocalContext(browser, { width: 1440, height: 900 })
    await observer.page.addInitScript(() => {
      class BrokenIntersectionObserver {
        constructor() {
          throw new Error('luna-observer-fault')
        }
      }
      // The page code feature-detects this constructor before creating it.
      Object.defineProperty(window, 'IntersectionObserver', {
        configurable: true,
        value: BrokenIntersectionObserver,
      })
    })
    await observer.page.goto('/xiefu-yuncang', { waitUntil: 'domcontentloaded' })
    await observer.page.waitForTimeout(500)
    await expectFirstHeadingVisible(observer.page)
    await expectNoPendingReveal(observer.page)
    await observer.context.close()
  })

  test('all affected service routes and representative pages retain no-JS text', async ({
    browser,
  }) => {
    const { context, page } = await createLocalContext(browser, {
      width: 1440,
      height: 900,
      javaScriptEnabled: false,
    })
    for (const path of [...serviceRoutes, ...representativeRoutes]) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), path).toBe(200)
      const text = (await page.locator('main').innerText()).trim()
      expect(text.length, `${path} SSR text`).toBeGreaterThan(80)
      await expectFirstHeadingVisible(page)
      if (serviceRoutes.includes(path)) {
        await expectEffectivelyVisible(page, DETAIL_COPY.slice(0, 1))
        await expectNoPendingReveal(page)
      }
    }
    expect(getBlockedRequests(context)).toEqual([])
    await context.close()
  })
})
