import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

type GoldenStat = {
  label: string
  labelAliases?: string[]
  value: string
  valueAliases?: string[]
  unit: string
  unitAliases?: string[]
}
type Golden = { order: string[]; stats: Record<string, GoldenStat[]> }

const golden = JSON.parse(
  readFileSync('tests/fixtures/english-case-stats.expected.json', 'utf8')
) as Golden
const fallbackInmanStats: GoldenStat[] = [
  { label: 'Inventory management', value: 'All-channel unified management', unit: '' },
  { label: 'Fulfilment capability', value: 'Synchronized multi-platform dispatch', unit: '' },
]

const viewports = [
  { width: 1440, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
] as const

const englishMockEnabled = process.env.LUNA_PUBLISHED_MOCK === '1'
const expectedOrder = englishMockEnabled ? golden.order : [...golden.order.slice(0, 5), 'inman']
const expectedStats = englishMockEnabled
  ? golden.stats
  : { ...golden.stats, inman: fallbackInmanStats }

test.describe('published English case details', () => {
  test('all six details expose the independent stats contract', async ({ page, request }) => {
    test.setTimeout(120_000)

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      for (const slug of expectedOrder) {
        const route = `/en/cases/${slug}`
        const response = await request.get(route)
        expect(response.status(), `${viewport.width}px ${slug} HTTP`).toBe(200)
        await page.goto(route, { waitUntil: 'domcontentloaded' })
        await expect(page.locator('html')).toHaveAttribute('lang', 'en')
        await expect(page.locator('main h1')).toHaveCount(1)

        const mainText = await page.locator('main').innerText()
        expect(mainText, `${slug} English content`).not.toMatch(/[\u3400-\u9fff]/)
        const cards = page.locator('section.case-detail-overview .grid-cols-2 > div')
        await expect(cards).toHaveCount(expectedStats[slug].length)
        for (const [index, stat] of expectedStats[slug].entries()) {
          const actual = await cards.nth(index).evaluate((card) => {
            const value = card.querySelector('p:first-of-type')
            return {
              value: value?.childNodes[0]?.textContent?.trim() ?? '',
              unit: value?.querySelector('span')?.textContent?.trim() ?? '',
              label: card.querySelector('p:last-of-type')?.textContent?.trim() ?? '',
            }
          })
          const labels = [stat.label, ...(stat.labelAliases ?? [])]
          const units = [stat.unit, ...(stat.unitAliases ?? [])]
          expect(labels, `${slug} stat label`).toContain(actual.label)
          expect([stat.value, ...(stat.valueAliases ?? [])]).toContain(actual.value)
          expect(units, `${slug} stat unit`).toContain(actual.unit)
        }
        expect(await page.locator('main img').count(), `${slug} detail image`).toBeGreaterThan(0)
        await expect
          .poll(() =>
            page
              .locator('main img')
              .evaluateAll((images) =>
                images.every(
                  (image) =>
                    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
                )
              )
          )
          .toBe(true)
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          viewport.width + 1
        )
        await expect(
          page.locator(`main a[href="/en/contact?case=${slug}#contact-form"]`).first()
        ).toBeVisible()
        await expect(page.locator('main a[target]')).toHaveCount(0)
      }
    }
  })

  test('modal, detail navigation, close and back work', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    const card = page.locator('#s-cases [data-case="ur"], #s-cases a[href="/en/cases/ur"]').first()
    await card.scrollIntoViewIfNeeded()
    const beforeCard = await page.evaluate(() => performance.timeOrigin)
    await card.click()
    await expect(page.locator('#case-modal')).toBeVisible()
    const afterCard = await page.evaluate(() => ({
      timeOrigin: performance.timeOrigin,
      url: location.href,
    }))
    expect(afterCard.timeOrigin).toBe(beforeCard)
    expect(afterCard.url).toMatch(/\/en\/cases\/ur$/)
    await page
      .locator('#case-modal .modal-close, #case-modal button[aria-label*="Close"]')
      .first()
      .click()
    await expect(page.locator('#case-modal')).toBeHidden()
    await expect(page).toHaveURL(/\/en$/)

    await card.click()
    await expect(page.locator('#case-modal')).toBeVisible()
    const beforeCta = await page.evaluate(() => ({ timeOrigin: performance.timeOrigin }))
    await page.locator('#modal-detail-link').click()
    await expect
      .poll(() => page.evaluate(() => performance.timeOrigin), { timeout: 30_000 })
      .not.toBe(beforeCta.timeOrigin)
    await expect(page).toHaveURL(/\/en\/cases\/ur$/)
    await expect(page.locator('main h1')).toContainText('UR')

    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await card.click()
    await expect(page.locator('#case-modal')).toBeVisible()
    await page.goBack()
    await expect(page.locator('#case-modal')).toBeHidden()
    await expect(page).toHaveURL(/\/en$/)
    await page.goto('/en/cases/ur', { waitUntil: 'domcontentloaded' })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('main h1')).toContainText('UR')
  })

  test('details support same-case language, no-JS direct access, new tabs, contact GET, and discovery', async ({
    page,
    context,
    request,
  }, testInfo) => {
    const route = '/en/cases/meiyi'
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#site-language-switch')).toHaveAttribute('href', '/cases/meiyi')
    await page.locator('#site-language-switch').click()
    await expect(page).toHaveURL(/\/cases\/meiyi$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
    await page.goto(route, { waitUntil: 'domcontentloaded' })

    const noJsContext = await context.browser()!.newContext({
      baseURL: testInfo.project.use.baseURL,
      javaScriptEnabled: false,
    })
    const noJsPage = await noJsContext.newPage()
    const noJsResponse = await noJsPage.goto(route, { waitUntil: 'domcontentloaded' })
    expect(noJsResponse?.status()).toBe(200)
    await expect(noJsPage.locator('main h1')).toHaveCount(1)
    await noJsContext.close()
    const newTab = await context.newPage()
    const newTabResponse = await newTab.goto('/en/cases/ur', { waitUntil: 'domcontentloaded' })
    expect(newTabResponse?.status()).toBe(200)
    await expect(newTab.locator('main h1')).toContainText('UR')
    await newTab.close()

    const contactNavigation = page.waitForResponse(
      (response) =>
        response.url().endsWith('/en/contact?case=meiyi') &&
        response.request().isNavigationRequest()
    )
    await page.locator('main a[href="/en/contact?case=meiyi#contact-form"]').first().click()
    const contact = await contactNavigation
    expect(contact.status()).toBe(200)
    expect(contact.request().method()).toBe('GET')
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain('/en/cases/meiyi')
    const llms = await request.get('/llms.txt')
    expect(llms.status()).toBe(200)
    expect(await llms.text()).toContain('/en/cases/meiyi')
  })

  test('long range fits cards and clipping ancestors', async ({ page }) => {
    for (const viewport of [viewports[0], viewports[2], viewports[3]]) {
      await page.setViewportSize(viewport)
      await page.goto('/en/cases/meiyi', { waitUntil: 'domcontentloaded' })
      const range = page.getByText('1,000,000–1,500,000', { exact: false }).first()
      await expect(range).toBeVisible()
      const violations = await range.evaluate((element) => {
        const card = element.closest('.grid-cols-2 > div')!
        const bounds = card.getBoundingClientRect()
        const text = document.createRange()
        text.selectNodeContents(element.childNodes[0])
        const issues: string[] = []
        for (const rect of text.getClientRects()) {
          if (rect.left < -1 || rect.right > innerWidth + 1) issues.push('viewport')
          if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) issues.push('card')
          for (
            let ancestor: Element | null = element;
            ancestor;
            ancestor = ancestor.parentElement
          ) {
            const style = getComputedStyle(ancestor)
            const clip = ancestor.getBoundingClientRect()
            if (
              /hidden|clip/.test(style.overflowX) &&
              (rect.left < clip.left - 1 || rect.right > clip.right + 1)
            )
              issues.push('clip-x')
            if (
              /hidden|clip/.test(style.overflowY) &&
              (rect.top < clip.top - 2 || rect.bottom > clip.bottom + 2)
            )
              issues.push('clip-y')
          }
        }
        return issues
      })
      expect(violations).toEqual([])
    }
  })
})
