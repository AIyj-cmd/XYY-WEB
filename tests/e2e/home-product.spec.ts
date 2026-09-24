import { expect, test } from '@playwright/test'
import { getClaimText } from '../../src/lib/claims'

test('homepage loads the shoe-apparel fulfillment message and primary CTA', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('新亦源鞋服云仓', { exact: true }).first()).toBeVisible()
  await expect(
    page.getByRole('heading', { name: /从入库质检到退货上架，.*鞋服仓配一次解决/ })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '获取仓配方案' }).first()).toBeVisible()
  await expect(page.locator('.hero-data')).toContainText(
    `${getClaimText('warehouseArea', 'home')}直营仓储 ｜ ${getClaimText('partnerBrands', 'home')}服务品牌 ｜ ${getClaimText('servedStores', 'home')}覆盖门店 ｜ ${getClaimText('coveredCities', 'home')}覆盖城市`
  )
  await expect(page.locator('#s-stats .sr-only')).toHaveCount(0)
  await expect(page.locator('#s-cases a.case-card')).toHaveCount(6)
  await expect(page.locator('a.case-card[href="/cases/ur"]')).toHaveCount(1)
  await expect(page.locator('a.case-card[href="/cases/romi-studio"]')).toHaveCount(1)
  await expect(page.locator('a.case-card[href="/cases/inman"]')).toHaveCount(1)
  await expect(page.locator('a.case-card[href="/cases/toyouth"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /在线估算费用|仓储成本估算器/ })).toHaveCount(0)
})

test('homepage case dialogs reuse all six card covers and close with Escape', async ({ page }) => {
  await page.goto('/')

  const dialogImage = page.locator('#modal-hero-img')
  await expect(dialogImage).not.toHaveAttribute('src', /.+/)
  for (const path of ['ur', 'maxrieny', 'xingmian', 'meiyi', 'romi-studio', 'inman']) {
    const card = page.locator(`a.case-card[href="/cases/${path}"]`)
    const cardImageSrc = await card.locator('img').getAttribute('src')
    await card.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(dialogImage).toBeVisible()
    await expect(dialogImage).toHaveAttribute('src', cardImageSrc ?? '')
    await page.keyboard.press('Escape')
    await expect(page.locator('#case-modal')).toBeHidden()
  }
})

test('cases page renders the current cases in its static overview', async ({ page }) => {
  await page.goto('/cases')

  await expect(page.locator('#cases-grid .case-card')).toHaveCount(6)
  await expect(page.locator('.cases-featured')).toHaveCount(0)
  await expect(page.locator('.cases-hero + .cases-grid-section')).toHaveCount(1)
  await expect(page.locator('#cases-grid .case-card__stats')).toHaveCount(6)
  await expect(
    page.locator('.cases-logo-wall__inner > .cases-logo-wall__grid .cases-logo-wall__item')
  ).toHaveCount(12)
  await expect(page.locator('.cases-logo-wall__more .cases-logo-wall__item')).toHaveCount(66)
  await page.locator('.cases-logo-wall__more summary').click()
  await expect(page.locator('.cases-logo-wall__more')).toHaveAttribute('open', '')
  await expect(page.locator('.cases-logo-wall__item')).toHaveCount(78)
  await expect(page.getByText('初语（TOYOUTH）', { exact: true })).toHaveCount(0)
  await expect(page.locator('#cases-grid a[href="/cases/ur"]')).toHaveCount(1)
})

test('product page has no horizontal overflow at 360px', async ({ page }) => {
  const fontRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('.woff2')) fontRequests.push(request.url())
  })
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/product')
  await expect(page.locator('[data-product-video]')).toHaveCount(8)
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1)
  expect(fontRequests).toEqual([])
})

test('refactored home and product modules remain intact at desktop widths', async ({ page }) => {
  for (const width of [1366, 1440]) {
    await page.setViewportSize({ width, height: 900 })

    await page.goto('/')
    await expect(page.locator('#s-stats')).toHaveCount(1)
    // The E2E server deliberately points Directus at an unavailable local port.
    // The static digital product still proves the extracted solution component is mounted.
    await expect(page.locator('#dp-yundao-platform.s-service')).toHaveCount(1)
    let dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content, `homepage should not overflow at ${width}px`).toBeLessThanOrEqual(
      dimensions.viewport + 1
    )

    await page.goto('/product')
    await expect(page.locator('[data-product-video]')).toHaveCount(8)
    dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(
      dimensions.content,
      `product page should not overflow at ${width}px`
    ).toBeLessThanOrEqual(dimensions.viewport + 1)
  }
})
