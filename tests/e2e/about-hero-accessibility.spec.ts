import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const evidenceDir = process.env.PLAYWRIGHT_ARTIFACTS_DIR ?? 'output/playwright'
mkdirSync(evidenceDir, { recursive: true })

const waitForVideo = async (page: Page) => {
  await page.waitForFunction(() => {
    const video = document.querySelector<HTMLVideoElement>('#hero-bg-video')
    return Boolean(video && video.readyState >= 1)
  })
}

const frameState = async (page: Page) =>
  page.locator('.about-stage__frame').evaluate((frame: HTMLElement) => {
    const rect = frame.getBoundingClientRect()
    return {
      width: rect.width,
      radius: getComputedStyle(frame).borderRadius,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }
  })

test.describe('About video controls and accessibility', () => {
  test('keeps video controls keyboard-operable and explorer dialogs reversible', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Interaction runs once in real Chromium')
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/about')
    await waitForVideo(page)

    const video = page.locator('#hero-bg-video')
    await expect
      .poll(() => video.evaluate((item: HTMLVideoElement) => item.readyState))
      .toBeGreaterThanOrEqual(2)
    const playButton = page.locator('#hero-video-btn')
    const muteButton = page.locator('#hero-mute-btn')

    await playButton.focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => video.evaluate((item: HTMLVideoElement) => item.paused)).toBe(true)
    await expect(playButton).toHaveAttribute('aria-label', '播放视频')
    await page.keyboard.press('Enter')
    await expect.poll(() => video.evaluate((item: HTMLVideoElement) => item.paused)).toBe(false)
    await expect(playButton).toHaveAttribute('aria-label', '暂停视频')

    await muteButton.focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => video.evaluate((item: HTMLVideoElement) => item.muted)).toBe(false)
    await expect(muteButton).toHaveAttribute('aria-label', '静音')
    await page.keyboard.press('Enter')
    await expect.poll(() => video.evaluate((item: HTMLVideoElement) => item.muted)).toBe(true)
    await expect(muteButton).toHaveAttribute('aria-label', '开启声音')

    const triggers = page.locator('[data-about-explorer-open]')
    for (let index = 0; index < 4; index += 1) {
      const trigger = triggers.nth(index)
      const id = await trigger.getAttribute('data-about-explorer-open')
      await trigger.click()
      const dialog = page.locator('#about-explorer-dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog.locator('[data-about-explorer-close]')).toBeFocused()
      await expect(page).toHaveURL(new RegExp(`#about-${id}$`))
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()
      await expect(trigger).toBeFocused()
      await expect(page).toHaveURL(/\/about$/)
    }

    const deepLinkPage = await page.context().newPage()
    await deepLinkPage.goto('/about#about-faq')
    await expect(deepLinkPage.locator('#about-explorer-dialog')).toBeVisible()
    await expect(deepLinkPage.locator('[data-about-explorer-panel="faq"]')).toBeVisible()
    await deepLinkPage.locator('[data-about-explorer-close]').click()
    await expect(deepLinkPage.locator('#about-explorer-dialog')).not.toBeVisible()
    await expect(deepLinkPage).toHaveURL(/\/about$/)
    await deepLinkPage.close()

    await expect(page.locator('[data-about-gallery]')).toHaveCount(1)
    await expect(page.locator('.about-gallery__figure img')).toHaveCount(157)
    await expect(page.locator('[data-gallery-grid]')).toHaveCount(1)
    await expect(page.locator('.about-gallery__group, [data-about-gallery] h3')).toHaveCount(0)
    await expect(page.locator('.about-gallery__figure figcaption')).toHaveCount(0)
    const footer = page.getByRole('contentinfo')
    await expect(footer).toHaveCount(1)
    await expect(footer).toHaveClass(/site-footer/)
  })

  test('honours reduced-motion changes and keeps the page readable without JavaScript', async ({
    page,
    browser,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Accessibility modes run once in real Chromium')
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/about')
    await waitForVideo(page)
    await page.evaluate(() => window.scrollTo(0, 260))
    await expect.poll(() => frameState(page).then((state) => state.radius)).not.toBe('0px')

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect.poll(() => frameState(page).then((state) => state.radius)).toBe('0px')
    const reduced = await frameState(page)
    expect(Math.abs(reduced.width - 390)).toBeLessThanOrEqual(1)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.evaluate(() => window.scrollTo(0, 260))
    await expect.poll(() => frameState(page).then((state) => state.radius)).not.toBe('0px')

    const noJsContext = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    })
    const noJsPage = await noJsContext.newPage()
    await noJsPage.goto('/about')
    await expect(noJsPage.locator('main h1')).toHaveCount(1)
    await expect(noJsPage.locator('[data-about-explorer-open]')).toHaveCount(4)
    await expect(noJsPage.locator('[data-about-gallery]')).toHaveCount(1)
    await expect(noJsPage.locator('.about-gallery__figure img')).toHaveCount(157)
    await expect(noJsPage.locator('[data-gallery-grid]')).toHaveCount(1)
    await expect(noJsPage.locator('.about-gallery__group, [data-about-gallery] h3')).toHaveCount(0)
    await expect(noJsPage.locator('.about-gallery__figure figcaption')).toHaveCount(0)
    const noJsFooter = noJsPage.getByRole('contentinfo')
    await expect(noJsFooter).toHaveCount(1)
    await expect(noJsFooter).toHaveClass(/site-footer/)
    const noJsOverflow = await noJsPage.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(noJsOverflow).toBeLessThanOrEqual(0)
    await noJsPage.screenshot({ path: `${evidenceDir}/luna-zh-no-js-390.png` })
    await noJsContext.close()
  })
})
