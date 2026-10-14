import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const evidenceDir = process.env.PLAYWRIGHT_ARTIFACTS_DIR ?? 'output/playwright'
mkdirSync(evidenceDir, { recursive: true })

const widths = [
  { name: '1440', width: 1440, height: 900, desktop: true },
  { name: '768', width: 768, height: 900, desktop: true },
  { name: '390', width: 390, height: 844, desktop: false },
  { name: '360', width: 360, height: 768, desktop: false },
] as const

const locales = [
  { path: '/about', key: 'zh' },
  { path: '/en/about', key: 'en' },
] as const

const waitForRevealFrame = async (page: Page) => {
  await page.waitForFunction(() => {
    const video = document.querySelector<HTMLVideoElement>('#hero-bg-video')
    return Boolean(video && video.readyState >= 1)
  })
}

const frameState = async (page: Page) =>
  page.locator('.about-stage__frame').evaluate((frame: HTMLElement) => {
    const rect = frame.getBoundingClientRect()
    const stage = frame.closest<HTMLElement>('.about-stage')!
    const style = getComputedStyle(frame)
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      radius: style.borderRadius,
      inset: stage.style.getPropertyValue('--about-reveal-inset'),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }
  })

const visibleBounds = async (page: Page, selector: string) =>
  page.locator(selector).evaluate((element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
  })

const waitForStableFrame = async (page: Page) => {
  let previous = await frameState(page)
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await page.waitForTimeout(80)
    const next = await frameState(page)
    if (Math.abs(next.width - previous.width) <= 0.25 && next.radius === previous.radius) {
      return next
    }
    previous = next
  }
  return previous
}

const scrollToStageProgress = async (page: Page, progress: number) => {
  const stage = await page.locator('#about-hero').evaluate((element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return { top: rect.top + window.scrollY, height: rect.height }
  })
  await page.evaluate(
    ({ top, height, progress }) => {
      window.scrollTo(0, top + height * progress)
    },
    { ...stage, progress }
  )
  return waitForStableFrame(page)
}

test.describe('About video edge reveal', () => {
  test('keeps the shared hero, next-screen introduction and reveal geometry usable', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Matrix runs once in real Chromium')
    test.setTimeout(120_000)

    for (const locale of locales) {
      for (const viewport of widths) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(locale.path)
        await waitForRevealFrame(page)

        const main = page.locator('main')
        const stage = page.locator('#about-hero')
        const intro = page.locator('.about-introduction')
        const video = page.locator('#hero-bg-video')

        await expect(main.locator('h1')).toHaveCount(1)
        await expect(stage.locator('h1')).toHaveCount(0)
        await expect(intro.locator('h1')).toHaveCount(1)
        await expect(page.locator('[data-about-explorer-open]')).toHaveCount(4)
        await expect(video).toHaveAttribute('poster', '/introduce-poster.jpg')
        await expect(video.locator('source[media="(min-width: 768px)"]')).toHaveAttribute(
          'src',
          '/introduce-desktop.mp4'
        )
        await expect(video.locator('source:not([media])')).toHaveAttribute(
          'src',
          '/introduce-540p.mp4'
        )
        await expect
          .poll(() => video.evaluate((item: HTMLVideoElement) => item.currentSrc))
          .toContain(viewport.desktop ? 'introduce-desktop.mp4' : 'introduce-540p.mp4')

        const top = await frameState(page)
        expect(top.left).toBeGreaterThanOrEqual(-0.5)
        expect(top.right).toBeLessThanOrEqual(viewport.width + 0.5)
        expect(Math.abs(top.width - viewport.width)).toBeLessThanOrEqual(1)
        expect(top.radius).toBe('0px')
        expect(top.scrollWidth - top.clientWidth).toBeLessThanOrEqual(0)

        for (const control of ['#hero-video-btn', '#hero-mute-btn']) {
          const bounds = await visibleBounds(page, control)
          expect(bounds.left).toBeGreaterThanOrEqual(-0.5)
          expect(bounds.right).toBeLessThanOrEqual(viewport.width + 0.5)
          expect(bounds.top).toBeGreaterThanOrEqual(-0.5)
          expect(bounds.bottom).toBeLessThanOrEqual(viewport.height + 0.5)
        }

        await page.screenshot({
          path: `${evidenceDir}/luna-${locale.key}-${viewport.name}-top.png`,
        })

        const middle = await scrollToStageProgress(page, 0.28)
        expect(middle.radius).not.toBe('0px')
        expect(middle.width).toBeLessThan(viewport.width - 1)
        const late = await scrollToStageProgress(page, 0.55)
        const nearExit = await scrollToStageProgress(page, 0.85)
        const exit = await scrollToStageProgress(page, 1)
        const clamped = await scrollToStageProgress(page, 1.2)
        expect(late.width).toBeGreaterThan(nearExit.width + 1)
        expect(nearExit.width).toBeGreaterThan(exit.width + 1)
        expect(Math.abs(exit.width - clamped.width)).toBeLessThanOrEqual(1)
        const expectedInset = viewport.desktop
          ? Math.min(480, viewport.width * 0.28)
          : viewport.width * 0.2
        expect(Math.abs(exit.width - (viewport.width - expectedInset))).toBeLessThanOrEqual(2)
        await expect(intro).toBeVisible()
        await page.screenshot({
          path: `${evidenceDir}/luna-${locale.key}-${viewport.name}-middle.png`,
        })

        await intro.scrollIntoViewIfNeeded()
        await expect(intro.locator('h1')).toBeVisible()
        const introLayout = await intro
          .locator('.about-introduction__shell')
          .evaluate((shell: HTMLElement) => {
            const style = getComputedStyle(shell)
            const rect = shell.getBoundingClientRect()
            return {
              width: rect.width,
              maxWidth: style.maxWidth,
              paddingLeft: style.paddingLeft,
              paddingRight: style.paddingRight,
            }
          })
        const headerLayout = await intro
          .locator('.about-introduction__header')
          .evaluate((header: HTMLElement) => {
            const style = getComputedStyle(header)
            return { display: style.display, columns: style.gridTemplateColumns }
          })
        expect(introLayout.maxWidth).toBe('1200px')
        expect(introLayout.paddingLeft).toBe(viewport.desktop ? '32px' : '20px')
        expect(introLayout.paddingRight).toBe(viewport.desktop ? '32px' : '20px')
        expect(introLayout.width).toBeLessThanOrEqual(1200.5)
        if (viewport.desktop) expect(headerLayout.columns.split(' ').length).toBe(2)
        else expect(headerLayout.display).toBe('block')
        await page.screenshot({
          path: `${evidenceDir}/luna-${locale.key}-${viewport.name}-introduction.png`,
        })

        await page.evaluate(() => window.scrollTo(0, 0))
        await expect
          .poll(() => frameState(page).then((state: { radius: string }) => state.radius))
          .toBe('0px')
        const restored = await frameState(page)
        expect(Math.abs(restored.width - viewport.width)).toBeLessThanOrEqual(1)
        await page.screenshot({
          path: `${evidenceDir}/luna-${locale.key}-${viewport.name}-restored.png`,
        })
      }
    }
  })
})
