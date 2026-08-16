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

test('cases page exposes only the six current brands', async ({ page }, testInfo) => {
  await page.goto('/cases')

  await expect(page.locator('#cases-grid .case-card')).toHaveCount(6)
  await expect(page.locator('.case-brand-ring')).toHaveCount(3)
  await expect(page.locator('.case-orbit__case-image')).toHaveCount(6)
  const visiblePanel = page.locator('[data-case-orbit-panel]:not([hidden])')
  await expect(visiblePanel).toContainText('UR')
  await expect(visiblePanel.locator('.case-orbit__details > div')).toHaveCount(8)
  if (testInfo.project.name === 'chromium') {
    await page.locator('.case-orbit__content').hover()
    await expect(visiblePanel.locator('.case-orbit__summary')).toHaveCSS('opacity', '0')
    await expect(visiblePanel.locator('.case-orbit__details')).toHaveCSS('opacity', '1')
  } else {
    await expect(visiblePanel.locator('.case-orbit__summary')).toHaveCSS('opacity', '1')
    await expect(visiblePanel.locator('.case-orbit__details')).toHaveCSS('opacity', '0')
  }
  await page.getByRole('button', { name: '下一个案例' }).click()
  await expect(visiblePanel).toContainText('玛克茜妮')
  await expect(page.getByText('初语（TOYOUTH）', { exact: true })).toHaveCount(0)
  await expect(page.locator('#cases-grid a[aria-label="查看案例详情 →"]')).toHaveCount(1)
})

test('product page presents three service series and an accessible six-need directory', async ({
  page,
}) => {
  await page.goto('/product')

  await expect(page.getByRole('heading', { level: 1, name: '仓配服务' })).toBeVisible()
  await expect(page.locator('#service-series .series-spread')).toHaveCount(3)
  const selector = page.locator('[data-need-directory]')
  const tabs = selector.getByRole('tab')
  const panels = selector.locator('[role="tabpanel"]')
  const visiblePanel = selector.locator('[role="tabpanel"]:not([hidden])')
  await expect(tabs).toHaveCount(6)
  await expect(panels).toHaveCount(6)
  await expect(visiblePanel).toHaveCount(1)
  for (const [question, solution] of [
    ['新品到仓', '入库质检'],
    ['SKU多', '仓储管理'],
    ['订单量波动大', '订单履约'],
    ['退货到仓', '退货接收、质检分流'],
    ['已确认可售', '外观整理、信息更新、二次上架'],
    ['商品需要换标', '商品整理与增值处理'],
  ]) {
    const tab = selector.getByRole('tab', { name: new RegExp(question) })
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(visiblePanel).toContainText(solution)
  }

  await tabs.first().focus()
  await page.keyboard.press('End')
  await expect(tabs.last()).toBeFocused()
  await expect(tabs.last()).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#product-care')).toHaveCount(1)
  await expect(page.locator('#service-process')).toHaveCount(1)
  await expect(page.locator('#assurance')).toHaveCount(1)
})

test('product page has no horizontal overflow at 360px', async ({ page }) => {
  const fontRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('.woff2')) fontRequests.push(request.url())
  })
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/product')
  await expect(page.locator('[data-need-directory]')).toBeVisible()
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
    await expect(page.locator('#service-series')).toHaveCount(1)
    await expect(page.locator('#product-care')).toHaveCount(1)
    await expect(page.locator('#service-process')).toHaveCount(1)
    await expect(page.locator('#assurance')).toHaveCount(1)
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
