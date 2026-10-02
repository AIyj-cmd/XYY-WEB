import { expect, test } from '@playwright/test'

const needs = [
  ['ecommerce-fulfilment', 'cloud-warehouse'],
  ['store-replenishment', 'cloud-warehouse'],
  ['returns-inspection', 'quality-inspection'],
  ['garment-care', 'quality-inspection'],
  ['livestream-fulfilment', 'cloud-warehouse'],
] as const
const regions = ['any', 'east-china', 'south-china'] as const
test.describe('consultation service finder and enquiry protection', () => {
  test.setTimeout(120_000)

  test('renders 15 stable service results', async ({ page }) => {
    for (const [need] of needs) {
      for (const region of regions) {
        await page.goto(`/contact?need=${need}&region=${region}`, {
          waitUntil: 'domcontentloaded',
        })
        const finder = page.locator('#service-finder')
        await expect(finder.locator('select[name="need"]')).toHaveValue(need)
        await expect(finder.locator('select[name="region"]')).toHaveValue(region)
        await expect(finder.locator('.service-finder__result')).toBeVisible()
        await expect(finder.locator('a[href="#contact-form"]')).toBeVisible()
        await expect(
          finder.locator('a').filter({ hasText: /服务详情|service details/i })
        ).toHaveAttribute('href', /^\/(en\/)?[a-z0-9-]+(?:#[-a-z0-9]+)?$/)
        await expect(
          finder.locator('a').filter({ hasText: /合作案例|Explore cases/i })
        ).toHaveAttribute('href', /^\/(en\/)?cases$/)
      }
    }
  })

  test('native GET rejects ambiguous parameters', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/contact#service-finder', { waitUntil: 'domcontentloaded' })
    await page.locator('#service-finder summary').click()
    await page.locator('select[name="need"]').selectOption('returns-inspection')
    await page.locator('select[name="region"]').selectOption('south-china')
    await page
      .getByRole('button', { name: '查看服务建议', exact: true })
      .click({ noWaitAfter: true })
    await expect(page).toHaveURL(
      /\/contact\?need=returns-inspection&region=south-china#service-finder$/
    )
    await expect(page.locator('.service-finder__result')).toBeVisible()
    await context.close()
    const invalidPage = await browser.newPage()
    for (const query of [
      'need=ecommerce-fulfilment&need=garment-care&region=any',
      'need=constructor&region=any',
      'need=ecommerce-fulfilment&region=%3Cscript%3Ealert(1)%3C%2Fscript%3E',
    ]) {
      await invalidPage.goto(`/contact?${query}`, { waitUntil: 'domcontentloaded' })
      await expect(invalidPage.locator('.service-finder__result')).toHaveCount(0)
      await expect(invalidPage.locator('#service-finder select[name="need"]')).toHaveValue('')
      await expect(invalidPage.locator('body')).not.toContainText('<script>')
    }
    await invalidPage.close()
  })

  test('case links keep bilingual context', async ({ page }) => {
    await page.goto('/cases/ur')
    await expect(page.locator('main a[href="/contact?case=ur#contact-form"]')).toHaveCount(1)
    await page.goto('/en/cases/meiyi')
    await expect(page.locator('main a[href="/en/contact?case=meiyi#contact-form"]')).toHaveCount(1)
    await page.goto('/contact?case=ur')
    await expect(page.locator('.contact-case-context')).toContainText('UR')
    await expect(page.locator('#site-language-switch')).toHaveAttribute(
      'href',
      '/en/contact?case=ur#contact-form'
    )
    await page.goto('/en/contact?case=meiyi')
    await expect(page.locator('.contact-case-context')).toContainText('Case context')

    await page.goto('/contact')
    await expect(page.locator('.contact-case-context')).toHaveCount(0)
    await expect(page.locator('form#contact-form')).not.toHaveAttribute(
      'data-enquiry-context',
      /案例|Case/
    )
  })

  test('template preserves text and the 1200-char limit', async ({ page }) => {
    await page.goto('/contact?need=returns-inspection&region=any&case=ur#contact-form')
    const message = page.locator('textarea[name="message"]')
    const template = page.locator('[data-contact-template]')
    const original = '已有需求说明：请保留这段文字。\n品类：已填写'
    await message.fill(original)
    await expect(message).toHaveValue(original)
    await template.focus()
    await page.keyboard.press('Enter')
    const inserted = await message.inputValue()
    expect(inserted).toContain(original)
    expect(inserted.match(/品类：/g)?.length).toBe(1)
    expect(inserted.match(/SKU\/订单规模：/g)?.length).toBe(1)
    expect(inserted.match(/案例：\s*UR/g)?.length).toBe(1)
    expect(inserted.match(/业务需求：\s*退货质检/g)?.length).toBe(1)
    const afterFirstClick = inserted
    await template.click()
    await expect(message).toHaveValue(afterFirstClick)
    const nearLimit = 'x'.repeat(1195)
    await message.fill(nearLimit)
    await template.click()
    await expect(message).toHaveValue(nearLimit)
    await expect(page.locator('#contact-template-status')).toContainText('超过1200字限制')
    expect((await message.inputValue()).length).toBe(1195)
  })

  test('failed submission keeps fields and retries', async ({ page }) => {
    const payloads: Record<string, unknown>[] = []
    let mode: 'failure' | 'success' = 'failure'
    await page.route('**/api/contact', async (route) => {
      payloads.push(JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>)
      if (mode === 'failure') {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: '{"success":false}',
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{"success":true}',
        })
      }
    })
    await page.goto('/contact?need=returns-inspection&region=any#contact-form')
    await page.locator('input[name="name"]').fill('QA 保留输入')
    await page.locator('input[name="phone"]').fill('13800138000')
    await page.locator('textarea[name="message"]').fill('原始需求')
    await page.locator('input[name="privacyConsent"]').check()
    await page.locator('#submit-btn').click()
    await expect(page.locator('#form-result')).toContainText('提交失败')
    await expect(page.locator('input[name="name"]')).toHaveValue('QA 保留输入')
    await expect(page.locator('textarea[name="message"]')).toHaveValue('原始需求')

    mode = 'success'
    await page.locator('#submit-btn').click()
    await expect(page.locator('#form-result')).toContainText('提交成功')
    expect(payloads).toHaveLength(2)
    expect(payloads[0]).toMatchObject({
      name: 'QA 保留输入',
      phone: '13800138000',
      message: '原始需求',
      service: 'quality-inspection',
      privacyConsent: 'on',
    })
    expect(payloads[0]).not.toHaveProperty('locale')
    expect(payloads[1]).toEqual(payloads[0])
  })

  test('home and product finder entries are clickable in both languages', async ({ page }) => {
    for (const [home, product, contact] of [
      ['/', '/product', '/contact#service-finder'],
      ['/en', '/en/services', '/en/contact#service-finder'],
    ] as const) {
      await page.goto(home, { waitUntil: 'domcontentloaded' })
      const homeLink = page
        .getByRole('link', { name: /按需求选择服务|Find a service for your requirements/ })
        .first()
      await homeLink.scrollIntoViewIfNeeded()
      await homeLink.click({ noWaitAfter: true })
      await expect(page).toHaveURL(new RegExp(contact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'))
      await page.goto(product, { waitUntil: 'domcontentloaded' })
      const productLink = page.locator('.product-video-sequence__finder-link')
      await productLink.scrollIntoViewIfNeeded()
      await productLink.click({ noWaitAfter: true })
      await expect(page).toHaveURL(new RegExp(contact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'))
    }
  })

  test('contact form geometry works at four widths', async ({ page }) => {
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/contact?need=returns-inspection&region=any#contact-form', {
        waitUntil: 'domcontentloaded',
      })
      await page.waitForLoadState('load')
      await page.waitForTimeout(700)
      const geometry = await page.evaluate(() => {
        const rect = (selector: string) =>
          document.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
        const nav = rect('header')
        const name = rect('input[name="name"]')
        const finderButton = rect('#service-finder button')
        const template = rect('[data-contact-template]')
        const reset = rect('.service-finder__reset')
        return {
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          nameTop: name.top,
          navBottom: nav.bottom,
          finderButtonWidth: finderButton.width,
          templateWidth: template.width,
          resetWidth: reset.width,
          resetHeight: reset.height,
          summaryTransition: getComputedStyle(
            document.querySelector('.service-finder__summary-icon')!
          ).transitionDuration,
        }
      })
      expect(geometry.overflow, `${width}px overflow`).toBe(false)
      expect(geometry.nameTop).toBeGreaterThanOrEqual(geometry.navBottom)
      expect(
        Math.min(
          geometry.finderButtonWidth,
          geometry.templateWidth,
          geometry.resetWidth,
          geometry.resetHeight
        )
      ).toBeGreaterThanOrEqual(44)
      expect(geometry.summaryTransition).toBe('0s')
    }
  })
})
