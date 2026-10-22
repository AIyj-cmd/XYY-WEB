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
  '/en/cross-border-fulfillment',
  '/en/south-china-fulfillment',
  '/en/east-china-fulfillment',
  '/en/livestream-fulfillment',
  '/en/returns-inspection',
  '/en/garment-care',
  '/en/retail-distribution',
  '/en/digital-operations',
  '/en/smart-shipping',
] as const

const serviceOptions = [
  ['鞋服云仓', 'Apparel fulfilment'],
  ['退货质检', 'Returns inspection'],
  ['后整修复', 'Garment care and repair'],
  ['跨境云仓', 'Cross-border fulfilment'],
  ['华南鞋服云仓', 'South China fulfilment'],
  ['华东鞋服云仓', 'East China fulfilment'],
  ['直播电商仓配', 'Livestream fulfilment'],
  ['B2B门店仓配', 'Retail distribution'],
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
  await expect(service).toHaveValue('鞋服云仓')
  await service.selectOption('退货质检')
  await page.reload()
  await expect(service).toHaveValue('鞋服云仓')

  const switchLink = page.locator('#site-language-switch')
  await expect(switchLink).toHaveAttribute(
    'href',
    '/en/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form'
  )
  await switchLink.click()
  await expect(page).toHaveURL(/\/en\/contact\?from=%2Fxiefu-yuncang&entry=hero#contact-form$/)
  await expect(page.locator('select[name="service"]')).toHaveValue('鞋服云仓')

  await page.goto('/contact?from=constructor&entry=hero#contact-form')
  await expect(page.locator('select[name="service"]')).toHaveValue('')
  await page.goto('/contact#contact-form')
  await expect(page.locator('select[name="service"]')).toHaveValue('')

  await page.goto('/contact?from=%2Fwuliu-shuzihua&entry=hero#contact-form')
  await expect(page.locator('select[name="service"]')).toHaveValue('')
  await page.goto(
    '/contact?from=%2Ftuihuo-zhijian&entry=hero&need=ecommerce-fulfilment&region=any#contact-form'
  )
  await expect(page.locator('select[name="service"]')).toHaveValue('')
})

test('renders exactly eight page-name options in both languages and preserves Chinese submission values', async ({
  page,
}) => {
  for (const [path, labels] of [
    ['/contact', serviceOptions.map(([zh]) => zh)],
    ['/en/contact', serviceOptions.map(([, en]) => en)],
  ] as const) {
    await page.goto(path)
    const options = page.locator('select[name="service"] option')
    await expect(options).toHaveCount(9)
    await expect(options).toHaveText([
      path.startsWith('/en/') ? 'Select a service' : '请选择您感兴趣的服务',
      ...labels,
    ])
    expect(
      await options.evaluateAll((items) =>
        items.slice(1).map((item) => (item as HTMLOptionElement).value)
      )
    ).toEqual(serviceOptions.map(([zh]) => zh))
    for (const [value] of serviceOptions) {
      await page.locator('select[name="service"]').selectOption(value)
      await expect(page.locator('select[name="service"]')).toHaveValue(value)
    }
  }
})

test('no-JS keeps source links and SSR service preselection usable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/xiefu-yuncang')
  await expect(
    page.locator('a[href="/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form"]')
  ).toHaveCount(1)
  await page.goto('/contact?from=%2Fxiefu-yuncang&entry=hero#contact-form')
  await expect(page.locator('select[name="service"]')).toHaveValue('鞋服云仓')
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
  await page.locator('input[name="countryOrRegion"]').fill('中国')
  await page.locator('input[name="phone"]').fill('+1 (555) 123-4567')
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
  await page.locator('input[name="countryOrRegion"]').fill('中国')
  await page.locator('input[name="phone"]').fill('+1 (555) 123-4567')
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
