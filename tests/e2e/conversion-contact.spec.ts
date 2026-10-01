import { expect, test } from '@playwright/test'

const serviceRoutes = [
  '/xiefu-yuncang',
  '/huadong-xiefu-yuncang',
  '/kuajing-yuncang',
  '/huanan-xiefu-yuncang',
  '/zhibo-cangpei',
  '/b2b-mendian-cangpei',
  '/tuihuo-zhijian',
  '/houzheng-xiufu',
  '/wuliu-shuzihua',
  '/yundao-zhineng-jijian',
  '/en/apparel-fulfillment',
  '/en/returns-inspection',
  '/en/garment-care',
  '/en/retail-distribution',
  '/en/digital-operations',
  '/en/smart-shipping',
] as const

const requiredEntries = ['hero', 'bottom', 'floating'] as const

function expectedContactPath(route: string) {
  return route.startsWith('/en/') ? '/en/contact' : '/contact'
}

test.describe('contact conversion source links', () => {
  for (const route of serviceRoutes) {
    test(`${route} exposes source-aware contact links`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
      const expectedPath = expectedContactPath(route)
      const source = encodeURIComponent(route)
      for (const entry of requiredEntries) {
        await expect(
          page.locator(`a[href="${expectedPath}?from=${source}&entry=${entry}#contact-form"]`),
          `${route} must expose exactly one ${entry} CTA`
        ).toHaveCount(1)
      }
    })
  }
})

test('SSR selection, language preservation, and customer reselection work without client initialization', async ({
  page,
}) => {
  await page.goto('/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form')
  const service = page.locator('select[name="service"]')
  await expect(service).toHaveValue('cloud-warehouse')
  await service.selectOption('other')
  await page.reload()
  await expect(service).toHaveValue('cloud-warehouse')

  const switchLink = page.locator('#site-language-switch')
  await expect(switchLink).toHaveAttribute(
    'href',
    '/en/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form'
  )
  await switchLink.click()
  await expect(page).toHaveURL(/\/en\/contact\?from=%2Fxiefu-yuncang&entry=hero#contact-form$/)
  await expect(page.locator('select[name="service"]')).toHaveValue('cloud-warehouse')

  await page.goto('/contact?from=constructor&entry=hero#contact-form')
  await expect(page.locator('select[name="service"]')).toHaveValue('')
  await page.goto('/contact#contact-form')
  await expect(page.locator('select[name="service"]')).toHaveValue('')
})

test('no-JS keeps source links and SSR service preselection usable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/xiefu-yuncang')
  await expect(
    page.locator('a[href="/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form"]')
  ).toHaveCount(1)
  await page.goto('/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form')
  await expect(page.locator('select[name="service"]')).toHaveValue('cloud-warehouse')
  await expect(page.locator('#contact-form')).toBeVisible()
  await context.close()
})

test('Chinese hash entry leaves the first field below the fixed header', async ({
  page,
}, testInfo) => {
  await page.goto('/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form')
  await page.waitForTimeout(700)
  const geometry = await page.evaluate(() => {
    const header = document.querySelector('header')?.getBoundingClientRect()
    const field = document
      .querySelector('#contact-form input[name="name"]')
      ?.getBoundingClientRect()
    return { headerBottom: header?.bottom ?? null, fieldTop: field?.top ?? null }
  })
  await page.screenshot({
    path: `output/removal/xyy-20261001-06/luna/contact-hash-${testInfo.project.name}.png`,
    fullPage: false,
  })
  expect(geometry.headerBottom).not.toBeNull()
  expect(geometry.fieldTop).not.toBeNull()
  expect(geometry.fieldTop!).toBeGreaterThanOrEqual(geometry.headerBottom! + 4)
})

test('click, form completion, and successful submission do not send statistics', async ({
  page,
}) => {
  const statisticRequests: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/conversion-events')
      statisticRequests.push(request.url())
  })
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({ status: 200, json: { success: true } })
  })
  await page.goto('/xiefu-yuncang')
  await page.locator('a[href="/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form"]').click()
  await expect(page).toHaveURL(/\/contact\?from=%2Fxiefu-yuncang&entry=hero#contact-form$/)
  await page.locator('input[name="name"]').fill('QA')
  await page.locator('input[name="name"]').fill('QA again')
  await page.locator('input[name="phone"]').fill('13800138000')
  await page.locator('textarea[name="message"]').fill('Need fulfilment.')
  await page.locator('input[name="privacyConsent"]').check()
  await page.locator('#submit-btn').click()
  await expect(page.locator('#form-result')).toContainText('提交成功')
  expect(statisticRequests).toEqual([])
})

test('failed contact responses and honeypot submissions keep contact feedback without statistics', async ({
  page,
}) => {
  const statisticRequests: string[] = []
  let contactMode: 'failure' | 'success' = 'failure'
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/conversion-events')
      statisticRequests.push(request.url())
  })
  await page.route('**/api/contact', async (route) => {
    if (contactMode === 'failure') {
      await route.fulfill({ status: 503, json: { success: false } })
    } else {
      await route.fulfill({ status: 200, json: { success: true } })
    }
  })
  await page.goto('/xiefu-yuncang')
  await page.locator('a[href="/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form"]').click()
  await expect(page).toHaveURL(/\/contact\?from=%2Fxiefu-yuncang&entry=hero#contact-form$/)
  await page.locator('input[name="name"]').fill('QA')
  await page.locator('input[name="phone"]').fill('13800138000')
  await page.locator('textarea[name="message"]').fill('Need fulfilment.')
  await page.locator('input[name="privacyConsent"]').check()
  await page.locator('#submit-btn').click()
  await expect(page.locator('#form-result')).toContainText('提交失败')
  expect(statisticRequests).toEqual([])

  contactMode = 'success'
  await page.locator('#website').evaluate((element) => {
    ;(element as HTMLInputElement).value = 'bot'
  })
  await page.locator('#submit-btn').click()
  await expect(page.locator('#form-result')).toContainText('提交成功')
  expect(statisticRequests).toEqual([])
})
