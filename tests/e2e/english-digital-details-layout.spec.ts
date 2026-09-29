import { expect, test, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

test.use({ channel: 'chrome', locale: 'zh-CN' })
const evidence = 'output/english/xyy-20260927-08/implementation/luna/independent'
const routes = ['digital-operations', 'smart-shipping']

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
  await page.waitForTimeout(1_300)
}

function audit() {
  const failures: string[] = []
  const boxes: Array<{ text: string; rect: DOMRect; group: Element; area: string }> = []
  const headingRects: DOMRect[] = []
  for (const root of document.querySelectorAll('main, .site-header')) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      const el = node.parentElement!
      const text = node.textContent?.replace(/\s+/g, ' ').trim()
      if (!text || el.closest('script,style,[aria-hidden="true"],.sr-only')) continue
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue
      const group = el.closest('h1,h2,h3,h4,p,a,button,dt,dd,figcaption') ?? el
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        if (rect.width < 0.5 || rect.height < 0.5) continue
        boxes.push({ text, rect, group, area: root.tagName })
        if (el.closest('h1')) headingRects.push(rect)
        if (rect.left < -0.75 || rect.right > innerWidth + 0.75)
          failures.push(`viewport-x:${text}:${rect.left}:${rect.right}`)
        for (let ancestor: Element | null = el; ancestor; ancestor = ancestor.parentElement) {
          const css = getComputedStyle(ancestor)
          const clip = ancestor.getBoundingClientRect()
          const clips = (value: string) => ['hidden', 'clip', 'auto', 'scroll'].includes(value)
          if (
            clips(css.overflowX) &&
            (rect.left < clip.left - 0.75 || rect.right > clip.right + 0.75)
          )
            failures.push(`clip-x:${ancestor.className}:${text}`)
          if (
            clips(css.overflowY) &&
            (rect.top < clip.top - 0.75 || rect.bottom > clip.bottom + 0.75)
          )
            failures.push(`clip-y:${ancestor.className}:${text}`)
        }
      }
    }
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i],
        b = boxes[j]
      if (a.group === b.group || a.area !== b.area) continue
      const x = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left)
      const y = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top)
      if (x > 1 && y > 1) failures.push(`neighbor-overlap:${a.text} / ${b.text} (${x},${y})`)
    }
  }
  const header = document.querySelector('.site-header')!.getBoundingClientRect()
  if (scrollY === 0 && headingRects.some((rect) => rect.top < header.bottom - 0.75))
    failures.push('initial-h1-under-fixed-header')
  const navigation = Array.from(document.querySelectorAll('.site-header a')).filter((el) =>
    el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
  )
  for (let i = 0; i < navigation.length; i++) {
    const a = navigation[i].getBoundingClientRect()
    if (
      a.left < -0.75 ||
      a.right > innerWidth + 0.75 ||
      a.top < header.top - 0.75 ||
      a.bottom > header.bottom + 0.75
    )
      failures.push(`navigation-bounds:${navigation[i].textContent}`)
    for (const item of navigation.slice(i + 1)) {
      const b = item.getBoundingClientRect()
      if (
        Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
        Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
      )
        failures.push(`navigation-overlap:${navigation[i].textContent}/${item.textContent}`)
    }
  }
  return {
    failures: [...new Set(failures)],
    rangeCount: boxes.length,
    mainRangeCount: boxes.filter(({ area }) => area === 'MAIN').length,
    headingRangeCount: headingRects.length,
    navigationRangeCount: boxes.filter(({ area }) => area === 'HEADER').length,
    scrollY,
    documentOverflow: document.documentElement.scrollWidth - innerWidth,
    h1: headingRects.map(({ x, y, width, height }) => ({ x, y, width, height })),
    header: { top: header.top, bottom: header.bottom },
    fontStatus: document.fonts.status,
  }
}

for (const route of routes) {
  test(`${route} has usable media and uncropped text in four layouts`, async ({ page }, info) => {
    test.setTimeout(180_000)
    const widths = info.project.name === 'chromium' ? [1440, 768] : [390, 360]
    const records = []
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`page:${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console:${message.text()}`)
    })
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`http:${response.status()}:${response.url()}`)
    })
    await mkdir(`${evidence}/screenshots`, { recursive: true })
    for (const width of widths) {
      await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 })
      await page.goto(`/en/${route}`, { waitUntil: 'domcontentloaded' })
      await settle(page)
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      const initial = await page.evaluate(audit)
      await page.screenshot({ path: `${evidence}/screenshots/${route}-${width}-hero.png` })
      const sections =
        route === 'digital-operations'
          ? ['.digital-modules', '.digital-chain', '.conversion-cta']
          : [
              '.signature',
              '.yd-interface',
              '.yd-flow',
              '.yd-scenarios',
              '.service-detail',
              '.service-faq',
              '.conversion-cta',
            ]
      const sectionRecords = []
      for (const selector of sections) {
        const section = page.locator(selector).first()
        await section.evaluate((el) =>
          scrollTo({ top: el.getBoundingClientRect().top + scrollY - 125, behavior: 'instant' })
        )
        await settle(page)
        await expect(section).toBeVisible()
        sectionRecords.push({ selector, ...(await page.evaluate(audit)) })
        if (width === 1440 || width === 390)
          await page.screenshot({
            path: `${evidence}/screenshots/${route}-${width}-${selector.slice(1)}.png`,
          })
      }
      const media = page.locator('main img, main video')
      for (const item of await media.all()) {
        await item.scrollIntoViewIfNeeded()
        await expect
          .poll(() =>
            item.evaluate((el) =>
              el instanceof HTMLVideoElement
                ? el.readyState > 0 && el.videoWidth > 0
                : el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0
            )
          )
          .toBe(true)
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      await settle(page)
      const final = await page.evaluate(audit)
      records.push({
        route,
        width,
        initial,
        sectionRecords,
        final,
        mediaCount: await media.count(),
      })
    }
    await writeFile(
      `${evidence}/${route}-${info.project.name}-layout.json`,
      JSON.stringify(
        { browser: await page.evaluate(() => navigator.userAgent), records, errors },
        null,
        2
      )
    )
    for (const record of records) {
      for (const sample of [record.initial, ...record.sectionRecords, record.final]) {
        expect.soft(sample.mainRangeCount).toBeGreaterThan(0)
        expect.soft(sample.headingRangeCount).toBeGreaterThan(0)
        expect.soft(sample.navigationRangeCount).toBeGreaterThan(0)
        expect.soft(sample.failures, `${route} ${record.width} y=${sample.scrollY}`).toEqual([])
        expect.soft(sample.documentOverflow).toBeLessThanOrEqual(0)
        expect.soft(sample.fontStatus).toBe('loaded')
      }
    }
    expect(errors).toEqual([])
  })
}
