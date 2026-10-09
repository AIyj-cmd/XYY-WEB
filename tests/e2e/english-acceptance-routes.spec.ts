import { expect, test } from '@playwright/test'

const englishRoutes = [
  ['/', '/en'],
  ['/about', '/en/about'],
  ['/product', '/en/services'],
  ['/xiefu-yuncang', '/en/apparel-fulfillment'],
  ['/tuihuo-zhijian', '/en/returns-inspection'],
  ['/houzheng-xiufu', '/en/garment-care'],
  ['/b2b-mendian-cangpei', '/en/retail-distribution'],
  ['/cases', '/en/cases'],
  ['/news', '/en/news'],
  ['/supply-chain-whitepapers/', '/en/supply-chain-whitepapers'],
  ['/contact', '/en/contact'],
  ['/privacy', '/en/privacy'],
] as const

const chinesePath = new Map(englishRoutes.map(([zh, en]) => [en, zh]))
const h1WidthsByProject = new Map([
  ['chromium', [1440, 768]],
  ['mobile', [390, 360]],
])
const readVisibleH1Ranges = () => {
  const heading = document.querySelector('h1')
  if (!heading) return { error: 'missing h1', violations: ['missing h1'] }

  const textNodes: Text[] = []
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    if (node.textContent?.trim()) textNodes.push(node)
  }

  const clips = []
  for (let element: Element | null = heading; element; element = element.parentElement) {
    const style = getComputedStyle(element)
    const clipsX = ['hidden', 'clip', 'scroll', 'auto'].includes(style.overflowX)
    const clipsY = ['hidden', 'clip', 'scroll', 'auto'].includes(style.overflowY)
    if (clipsX || clipsY) {
      const rect = element.getBoundingClientRect()
      clips.push({
        tag: element.tagName,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        clipsX,
        clipsY,
      })
    }
  }

  const rects = textNodes.flatMap((node) => {
    const range = document.createRange()
    range.selectNodeContents(node)
    return Array.from(range.getClientRects())
      .filter((rect) => rect.width > 0 && rect.height > 0)
      .map((rect) => ({
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      }))
  })

  const style = getComputedStyle(heading)
  const violations: string[] = []
  const check = (condition: boolean, message: string) => {
    if (!condition) violations.push(message)
  }
  for (const rect of rects) {
    check(rect.left >= -0.5, 'text starts left of viewport')
    check(rect.right <= innerWidth + 0.5, 'text ends right of viewport')
    check(rect.top >= -0.5, 'text starts above viewport')
    check(rect.bottom <= innerHeight + 0.5, 'text ends below viewport')
    for (const clip of clips) {
      if (clip.clipsX) {
        check(rect.left >= clip.left - 0.5, `text starts left of ${clip.tag}`)
        check(rect.right <= clip.right + 0.5, `text ends right of ${clip.tag}`)
      }
      if (clip.clipsY) {
        check(rect.top >= clip.top - 0.5, `text starts above ${clip.tag}`)
        check(rect.bottom <= clip.bottom + 0.5, `text ends below ${clip.tag}`)
      }
    }
  }

  return {
    error: '',
    text: heading.textContent?.trim() ?? '',
    visible:
      heading.getClientRects().length > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0',
    rectCount: rects.length,
    violations,
  }
}

test.describe('English acceptance route contract', () => {
  test('renders every English route with reciprocal SEO links and one H1', async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'SSR route matrix runs once')

    for (const [, path] of englishRoutes) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status(), `${path} should be a successful English page`).toBe(200)

      await page.goto(path)
      const canonical = new URL(path, testInfo.project.use.baseURL!).href
      const zhUrl = new URL(chinesePath.get(path)!, testInfo.project.use.baseURL!).href

      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page).toHaveTitle(/\S+\s+\|\s+XINYIYUAN Supply Chain/)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', canonical)
      await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute('href', zhUrl)
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', zhUrl)
    }
  })

  test('keeps English and Chinese language switching pairwise', async ({ page }) => {
    await page.goto('/en/about')
    const toChinese = page.getByRole('link', { name: '查看此页面的中文版本' })
    await expect(toChinese).toHaveAttribute('href', '/about')
    await toChinese.click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')

    const toEnglish = page.getByRole('link', { name: 'View this page in English' })
    await expect(toEnglish).toHaveAttribute('href', '/en/about')
    await toEnglish.click()
    await expect(page).toHaveURL(/\/en\/about$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('returns a true English 404 for an unknown English path', async ({ page, request }) => {
    const response = await request.get('/en/not-a-real-page', { maxRedirects: 0 })
    expect(response.status()).toBe(404)

    await page.goto('/en/not-a-real-page')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1')).toHaveText('This English page cannot be found.')
    await expect(page.getByRole('link', { name: 'English home' })).toHaveAttribute('href', '/en')
    await expect(page.locator('main a[href="/"]')).toHaveText('中文首页')
  })

  test('normalizes trailing slash before rendering the English canonical URL', async ({
    request,
  }) => {
    const response = await request.get('/en/about/', { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toBe('/en/about')
  })
  test('keeps the mobile English navigation usable with overflow menu', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 844 })
    await page.goto('/en/contact')
    const menu = page.locator('[data-header-overflow-menu]')
    const summary = menu.locator('summary')
    await expect(summary).toBeVisible()
    await expect(page.getByRole('link', { name: '中文' })).toBeVisible()
    await summary.click()
    const links = page.locator(
      '.site-header__desktop-navigation a:visible, [data-header-overflow-menu][open] [data-header-overflow-link]:visible'
    )
    await expect(links).toHaveCount(6)
    await expect(page.locator('.site-header [aria-current="page"]:visible')).toHaveCount(1)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('keeps the English shell usable at the four acceptance widths', async ({ page }) => {
    for (const width of [1440, 768, 390, 360]) {
      await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 })
      await page.goto('/en')
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.locator('h1')).toBeVisible()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(overflow, `${width}px English home should not overflow`).toBeLessThanOrEqual(0)
    }
  })
  test('keeps every English H1 text range inside visible boundaries', async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000)
    const widths = h1WidthsByProject.get(testInfo.project.name)
    expect(widths, `unexpected project ${testInfo.project.name}`).toBeDefined()

    for (const [, path] of englishRoutes) {
      for (const width of widths!) {
        await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 })
        await page.goto(path)
        await page.evaluate(async () => {
          if (document.fonts?.ready) {
            await Promise.race([
              document.fonts.ready,
              new Promise((resolve) => setTimeout(resolve, 2_000)),
            ])
          }
        })
        await expect(page.locator('h1')).toHaveCSS('opacity', '1')
        const geometry = await page.evaluate(readVisibleH1Ranges)
        expect(geometry.error, `${path} ${width}px should have an H1`).toBe('')
        expect(geometry.visible, `${path} ${width}px H1 should be visible`).toBe(true)
        expect(geometry.text, `${path} ${width}px H1 should contain text`).not.toBe('')
        expect(geometry.rectCount, `${path} ${width}px H1 should have text ranges`).toBeGreaterThan(
          0
        )
        expect(geometry.violations, `${path} ${width}px H1 range geometry`).toEqual([])
      }
    }
  })
})
