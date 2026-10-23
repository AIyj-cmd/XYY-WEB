import { expect, test, type Page } from '@playwright/test'
import { contextOptions } from './helpers/language-suggestion'

function motionRequests(page: Page) {
  const urls: string[] = []
  page.on('request', (request) => {
    if (/\/(home-motion-loader|ScrollTrigger)[.-]/.test(new URL(request.url()).pathname)) {
      urls.push(request.url())
    }
  })
  return urls
}

test('keeps motion out of the initial load and starts it once when scrolling', async ({ page }) => {
  const requests = motionRequests(page)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.locator('#hero-heading')).toBeVisible()
  await expect(page.locator('.hero-actions a').first()).toBeVisible()
  expect(requests).toEqual([])
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/)

  await page.locator('#s-stats').scrollIntoViewIfNeeded()
  await expect(page.locator('html')).toHaveClass(/\blenis\b/)
  await expect.poll(() => requests.length).toBeGreaterThan(0)
  await expect(page.locator('.stats-tenure')).toBeVisible()
  await expect
    .poll(() =>
      page.locator('.stat-num').evaluateAll((nodes) =>
        nodes.every((node) => {
          const element = node as HTMLElement
          return element.textContent === element.dataset.raw
        })
      )
    )
    .toBe(true)

  const initialRequests = [...requests]
  await page.keyboard.press('PageDown')
  await page.mouse.wheel(0, 300)
  await expect(page.locator('html')).toHaveClass(/\blenis\b/)
  expect(requests).toEqual(initialRequests)
  expect(errors).toEqual([])
})

test('loads motion on keyboard navigation before a fast jump down the page', async ({ page }) => {
  const requests = motionRequests(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  expect(requests).toEqual([])

  await page.keyboard.press('End')
  await expect(page.locator('html')).toHaveClass(/\blenis\b/)
  await expect.poll(() => requests.length).toBeGreaterThan(0)
  await expect(page.locator('.conversion-cta')).toBeVisible()
  await page.locator('#s-stats').scrollIntoViewIfNeeded()
  await expect(page.locator('.stats-tenure')).toBeVisible()
})

test('keeps reduced-motion pages readable without fetching animation code', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const requests = motionRequests(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.locator('#s-stats').scrollIntoViewIfNeeded()
  await page.keyboard.press('End')
  await expect(page.locator('.conversion-cta')).toBeVisible()
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/)
  expect(requests).toEqual([])
})

test('keeps the hero and conversion links usable without JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    ...contextOptions(testInfo),
    javaScriptEnabled: false,
  })
  const page = await context.newPage()
  try {
    await page.goto('/')
    await expect(page.locator('#hero-heading')).toBeVisible()
    await expect(page.locator('.hero-actions a').first()).toHaveAttribute('href', '/contact')
    await page.locator('.hero-actions a').first().click()
    await expect(page).toHaveURL(/\/contact$/)
  } finally {
    await context.close()
  }
})

test('keeps the consultation label and seven process numbers above 4.5 contrast', async ({
  page,
}) => {
  await page.goto('/')
  const values = await page
    .locator('.conversion-cta__eyebrow, .fulfillment-num')
    .evaluateAll((elements) => {
      const channels = (color: string) => color.match(/[\d.]+/g)?.map(Number) ?? []
      const luminance = (rgb: number[]) =>
        rgb.slice(0, 3).reduce((sum, value, index) => {
          const channel = value / 255
          const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
          return sum + linear * [0.2126, 0.7152, 0.0722][index]
        }, 0)
      return elements.map((element) => {
        let background = channels(getComputedStyle(element).backgroundColor)
        let parent = element.parentElement
        while (background[3] === 0 && parent) {
          background = channels(getComputedStyle(parent).backgroundColor)
          parent = parent.parentElement
        }
        const foreground = luminance(channels(getComputedStyle(element).color))
        const backdrop = luminance(background)
        return {
          text: element.textContent,
          ratio: (Math.max(foreground, backdrop) + 0.05) / (Math.min(foreground, backdrop) + 0.05),
        }
      })
    })
  expect(values).toHaveLength(8)
  for (const { text, ratio } of values) expect(ratio, text ?? '').toBeGreaterThanOrEqual(4.5)
})
