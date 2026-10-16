import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import {
  createLanguageContext,
  holdLanguageScript,
  installEnglishPreference,
  overlaps,
  readContactLayout,
  readLayout,
  targetLayoutCases,
  waitForPaint,
} from './helpers/language-suggestion-layout'

for (const scenario of targetLayoutCases) {
  test(`keeps ${scenario.name} stable while suggestion appears and closes`, async ({
    browser,
  }, testInfo) => {
    const context = await createLanguageContext(
      browser,
      testInfo,
      scenario.width,
      scenario.height,
      scenario.isMobile
    )
    const page = await context.newPage()
    await installEnglishPreference(page)
    const gate = await holdLanguageScript(context)
    try {
      await page.goto(scenario.path, { waitUntil: 'commit' })
      await gate.requestSeen
      await page.locator(scenario.hero).waitFor({ state: 'visible' })
      await waitForPaint(page)
      const before = await readLayout(page, scenario.hero)
      await expect(page.locator('#language-suggestion')).toHaveAttribute(
        'data-language-layout',
        'overlay'
      )
      expect(before.suggestion.position).toBe('absolute')
      expect(before.suggestion.hidden).toBe(true)
      gate.release()
      await expect(page.locator('#language-suggestion')).toBeVisible()
      await waitForPaint(page)
      const visible = await readLayout(page, scenario.hero)
      expect(visible.suggestion.position).toBe('absolute')
      expect(visible.suggestion.hidden).toBe(false)
      expect(Math.abs(visible.hero.top - before.hero.top)).toBeLessThanOrEqual(1)
      expect(overlaps(visible.suggestion, visible.header)).toBe(false)
      expect(overlaps(visible.header, visible.heading)).toBe(false)
      if (process.env.LANGUAGE_R3_SCREENSHOTS) {
        await mkdir(process.env.LANGUAGE_R3_SCREENSHOTS, { recursive: true })
        await page.screenshot({
          path: join(process.env.LANGUAGE_R3_SCREENSHOTS, `${scenario.name}-visible.png`),
        })
      }
      await page.locator('[data-language-dismiss]').click()
      await expect(page.locator('#language-suggestion')).toBeHidden()
      await waitForPaint(page)
      const closed = await readLayout(page, scenario.hero)
      expect(Math.abs(closed.hero.top - before.hero.top)).toBeLessThanOrEqual(1)
      expect(closed.offset).toBe('0px')
    } finally {
      gate.release()
      await context.close()
    }
  })
}

test('keeps English routes and no-JS pages hidden without extra flow', async ({
  browser,
}, testInfo) => {
  const cases = [
    { path: '/en', hero: 'h1' },
    { path: '/en/apparel-fulfillment', hero: 'h1' },
    { path: '/en/contact', hero: '#contact-hero-heading' },
    { path: '/contact', hero: '#contact-hero-heading' },
    { path: '/', hero: '#s-hero' },
    { path: '/xiefu-yuncang', hero: '.footwear-hero' },
  ] as const
  for (const item of cases) {
    const context = await createLanguageContext(browser, testInfo, 390, 844, true, false)
    const page = await context.newPage()
    await page.goto(item.path, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#language-suggestion')).toBeHidden()
    await expect(page.locator(item.hero)).toBeVisible()
    const state = await readLayout(page, item.hero)
    expect(state.offset).toBe('0px')
    await context.close()
  }
})

for (const width of [360, 390, 430, 1440]) {
  test(`keeps Chinese contact hero stable at ${width}px`, async ({ browser }, testInfo) => {
    const context = await createLanguageContext(
      browser,
      testInfo,
      width,
      width >= 768 ? 900 : 844,
      width < 768
    )
    const page = await context.newPage()
    await installEnglishPreference(page)
    const gate = await holdLanguageScript(context)
    try {
      await page.goto('/contact', { waitUntil: 'commit' })
      await gate.requestSeen
      await page.locator('#contact-hero-heading').waitFor({ state: 'visible' })
      await waitForPaint(page)
      const before = await readContactLayout(page)
      expect(before.layout).toBe('overlay')
      expect(before.suggestion.position).toBe('absolute')
      expect(before.suggestion.hidden).toBe(true)
      gate.release()
      await expect(page.locator('#language-suggestion')).toBeVisible()
      await waitForPaint(page)
      const visible = await readContactLayout(page)
      expect(Math.abs(visible.hero.top - before.hero.top)).toBeLessThanOrEqual(1)
      expect(overlaps(visible.header, visible.kicker)).toBe(false)
      expect(overlaps(visible.header, visible.heading)).toBe(false)
      expect(overlaps(visible.suggestion, visible.header)).toBe(false)
      if (process.env.LANGUAGE_R4_SCREENSHOTS && width >= 390) {
        await mkdir(process.env.LANGUAGE_R4_SCREENSHOTS, { recursive: true })
        await page.screenshot({
          path: join(process.env.LANGUAGE_R4_SCREENSHOTS, `zh-contact-${width}.png`),
        })
      }
      await page.locator('[data-language-dismiss]').click()
      await expect(page.locator('#language-suggestion')).toBeHidden()
      await waitForPaint(page)
      const closed = await readContactLayout(page)
      expect(Math.abs(closed.hero.top - before.hero.top)).toBeLessThanOrEqual(1)
      expect(closed.offset).toBe('0px')
    } finally {
      gate.release()
      await context.close()
    }
  })
}

test('keeps non-target Chinese routes in normal flow', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', { configurable: true, get: () => ['en-US'] })
    Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'en-US' })
  })
  for (const path of ['/product', '/about']) {
    await page.goto(path)
    await expect(page.locator('#language-suggestion')).toBeVisible()
    await expect(page.locator('#language-suggestion')).not.toHaveAttribute(
      'data-language-layout',
      'overlay'
    )
    await expect
      .poll(() =>
        page
          .locator('#language-suggestion')
          .evaluate((element) => getComputedStyle(element).position)
      )
      .toBe('relative')
  }
})
