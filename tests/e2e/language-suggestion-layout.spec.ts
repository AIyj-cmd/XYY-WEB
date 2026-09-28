import { expect, test, type Page } from '@playwright/test'

const widths = [1440, 768, 390, 360]
const representativeChinese = ['/about', '/product', '/tuihuo-zhijian', '/contact']
type Rect = { left: number; right: number; top: number; bottom: number; height: number }

async function readLayout(page: Page) {
  return page.evaluate(() => {
    const box = (selector: string) =>
      document.querySelector(selector)?.getBoundingClientRect().toJSON() ?? null
    const strip = box('#language-suggestion')
    const header = box('.site-header')
    const heading = box('h1')
    const switcher = box('#site-language-switch')
    const intersects = (a: Rect | null, b: Rect | null) =>
      Boolean(
        a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
      )
    const scroll = document.querySelector<HTMLElement>('[data-product-video-scroll]')
    return {
      strip,
      header,
      heading,
      switcher,
      stripVisible: Boolean(strip && strip.height > 0),
      headerUnderStrip: !strip || !header || header.top >= strip.bottom - 1,
      headingUnderHeader: !heading || !header || !intersects(heading, header),
      switcherInViewport: Boolean(
        switcher && switcher.left >= 0 && switcher.right <= innerWidth && switcher.top >= 0
      ),
      overflow: document.documentElement.scrollWidth - innerWidth,
      offset: getComputedStyle(document.documentElement)
        .getPropertyValue('--language-suggestion-visible-height')
        .trim(),
      productScroll: scroll
        ? {
            clientHeight: scroll.clientHeight,
            scrollHeight: scroll.scrollHeight,
            scrollWidth: scroll.scrollWidth,
            clientWidth: scroll.clientWidth,
          }
        : null,
    }
  })
}

async function waitForFonts(page: Page) {
  await page.evaluate(async () => {
    await Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ])
  })
}

test.describe('language suggestion layout', () => {
  test('keeps the strip, header and headings inside the viewport', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'languages', {
        configurable: true,
        get: () => ['en-US', 'zh-CN'],
      })
      Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'en-US' })
    })

    for (const width of widths) {
      await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 })
      await page.goto('/')
      await waitForFonts(page)
      const state = await readLayout(page)
      expect(state.stripVisible, `${width}px homepage should show suggestion`).toBe(true)
      expect(state.headerUnderStrip, `${width}px header should clear suggestion`).toBe(true)
      expect(state.headingUnderHeader, `${width}px heading should clear header`).toBe(true)
      expect(state.switcherInViewport, `${width}px switch should be visible`).toBe(true)
      expect(state.overflow, `${width}px homepage should not overflow`).toBeLessThanOrEqual(0)
      expect(Number.parseFloat(state.offset)).toBeGreaterThan(0)
    }

    for (const path of representativeChinese) {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(path)
      await waitForFonts(page)
      const state = await readLayout(page)
      expect(state.stripVisible, `${path} should show suggestion`).toBe(true)
      expect(state.headerUnderStrip, `${path} header should clear suggestion`).toBe(true)
      expect(state.headingUnderHeader, `${path} heading should clear header`).toBe(true)
      expect(state.switcherInViewport, `${path} switch should be visible`).toBe(true)
      expect(state.overflow, `${path} should not overflow`).toBeLessThanOrEqual(0)
      if (path === '/product') {
        expect(state.productScroll?.scrollHeight).toBeGreaterThan(
          state.productScroll?.clientHeight ?? 0
        )
        expect(state.productScroll?.scrollWidth).toBeLessThanOrEqual(
          state.productScroll?.clientWidth ?? 0
        )
        await page
          .locator('[data-product-video-scroll]')
          .evaluate((element) => element.scrollTo({ top: element.clientHeight, behavior: 'auto' }))
        await expect
          .poll(() =>
            page.locator('[data-product-video-scroll]').evaluate((element) => element.scrollTop)
          )
          .toBeGreaterThan(0)
      }
    }

    await page.goto('/en/about')
    await waitForFonts(page)
    const english = await readLayout(page)
    expect(english.stripVisible, 'English route should not show suggestion').toBe(false)
    expect(english.headingUnderHeader).toBe(true)
    expect(english.overflow).toBeLessThanOrEqual(0)

    if (testInfo.project.name === 'chromium') {
      const screenshotDir = 'output/language-suggestion/xyy-20260927-05/luna/screenshots'
      await page.screenshot({ path: `${screenshotDir}/en-about-390.png` })
      for (const [name, path, width] of [
        ['zh-home-1440', '/', 1440],
        ['zh-home-390', '/', 390],
        ['zh-product-390', '/product', 390],
        ['zh-about-390', '/about', 390],
        ['zh-returns-390', '/tuihuo-zhijian', 390],
        ['zh-contact-390', '/contact', 390],
      ] as const) {
        await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 })
        await page.goto(path)
        await waitForFonts(page)
        await page.screenshot({ path: `${screenshotDir}/${name}.png` })
      }
    }
  })

  test('scroll, resize and dismissal restore the header offset', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'languages', { configurable: true, get: () => ['en-US'] })
      Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'en-US' })
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/about')
    await waitForFonts(page)
    const visibleOffset = await page.locator('#language-suggestion').evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      offset: getComputedStyle(document.documentElement).getPropertyValue(
        '--language-suggestion-visible-height'
      ),
    }))
    expect(Number.parseFloat(visibleOffset.offset)).toBeCloseTo(visibleOffset.height, 0)
    await page.evaluate(() => scrollTo(0, 200))
    await expect
      .poll(() =>
        page.locator('#language-suggestion').evaluate((element) => ({
          bottom: element.getBoundingClientRect().bottom,
          offset: getComputedStyle(document.documentElement).getPropertyValue(
            '--language-suggestion-visible-height'
          ),
        }))
      )
      .toMatchObject({ offset: '0px' })
    await page.evaluate(() => scrollTo(0, 0))
    await expect
      .poll(() =>
        page
          .locator('#language-suggestion')
          .evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue(
              '--language-suggestion-visible-height'
            )
          )
      )
      .not.toBe('0px')

    await page.setViewportSize({ width: 1440, height: 900 })
    await expect
      .poll(() =>
        page
          .locator('#language-suggestion')
          .evaluate((element) => element.getBoundingClientRect().height)
      )
      .toBeGreaterThan(0)
    const desktopState = await readLayout(page)
    expect(desktopState.headerUnderStrip).toBe(true)
    await page.locator('[data-language-dismiss]').click()
    await expect(page.locator('#language-suggestion')).toBeHidden()
    await expect
      .poll(() =>
        page
          .locator('html')
          .evaluate((element) =>
            getComputedStyle(element).getPropertyValue('--language-suggestion-visible-height')
          )
      )
      .toBe('0px')
    const dismissedTop = await page
      .locator('.site-header')
      .evaluate((element) => getComputedStyle(element).top)
    await page.goto('/en/about')
    const baselineTop = await page
      .locator('.site-header')
      .evaluate((element) => getComputedStyle(element).top)
    expect(dismissedTop).toBe(baselineTop)
  })
})
