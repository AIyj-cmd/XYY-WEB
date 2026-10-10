import { expect, test } from '@playwright/test'

test.describe('consultation enquiry protection', () => {
  test.setTimeout(120_000)

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
        const template = rect('[data-contact-template]')
        return {
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          nameTop: name.top,
          navBottom: nav.bottom,
          templateWidth: template.width,
        }
      })
      expect(geometry.overflow, `${width}px overflow`).toBe(false)
      expect(geometry.nameTop).toBeGreaterThanOrEqual(geometry.navBottom)
      expect(geometry.templateWidth).toBeGreaterThanOrEqual(44)
    }
  })
})
