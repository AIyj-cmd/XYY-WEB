import { expect, test } from '@playwright/test'
import { CLAIM_TEXT } from '@/lib/claims'

test('repair redesign keeps its six sections, source content, and links readable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 844 })
  await page.goto('/houzheng-xiufu')

  await expect(page.locator('.repair-page')).toHaveCount(1)
  await expect(page.locator('main #lp-h1')).toHaveText('服装瑕疵修复与二次上架')
  const video = page.locator('.repair-hero__video')
  await expect(video).toHaveAttribute('autoplay', '')
  await expect(video).toHaveAttribute('muted', '')
  await expect(video).toHaveAttribute('playsinline', '')
  await expect(video).not.toHaveAttribute('controls')
  await expect(page.locator('[data-redesign-feature]')).toHaveCount(6)
  await expect(page.locator('[data-feature-title]')).toHaveText([
    '清污处理',
    '面料修复',
    '缝线修复',
    '配饰修复',
    '鞋类专项修复',
    '标识与异味处理',
  ])
  await expect(page.locator('[data-repair-workshop-tab]')).toHaveCount(3)
  await expect(page.locator('[data-repair-workshop-controls]')).toHaveAttribute('role', 'tablist')
  await expect(page.locator('[data-repair-workshop-controls]')).toBeVisible()
  await expect(page.locator('.repair-workshop__zones span')).toHaveCount(9)
  await expect(page.locator('.repair-process__steps > li')).toHaveCount(4)
  await expect(page.locator('.repair-process__outcomes > div')).toHaveCount(2)
  await expect(page.locator('.repair-verification__success')).toContainText(
    CLAIM_TEXT.repairSuccessRate
  )
  await expect(page.locator('[data-redesign-faq]')).toHaveCount(5)
  const workshopTabs = page.locator('[data-repair-workshop-tab]')
  await expect(workshopTabs.nth(0)).toHaveAttribute('role', 'tab')
  await expect(workshopTabs.nth(0)).toHaveAttribute('aria-controls', 'repair-workshop-panel-0')
  await expect(page.locator('[data-repair-workshop-panel="0"]')).toHaveAttribute('role', 'tabpanel')
  await expect(page.locator('[data-repair-workshop-panel="0"]')).toHaveAttribute(
    'aria-labelledby',
    'repair-workshop-tab-0'
  )
  await workshopTabs.nth(1).click()
  await expect(workshopTabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('[data-repair-workshop-panel="1"]')).toBeVisible()
  await workshopTabs.nth(1).focus()
  await page.keyboard.press('End')
  await expect(workshopTabs.nth(2)).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Space')
  await expect(workshopTabs.nth(2)).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Home')
  await expect(workshopTabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  const scrollBeforeBoundaryHome = await page.evaluate(() => window.scrollY)
  await page.keyboard.press('Home')
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBeforeBoundaryHome)
  await expect(workshopTabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  const firstFaq = page.locator('[data-redesign-faq]').first()
  await firstFaq.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(firstFaq).toHaveAttribute('open', '')
  await expect(firstFaq).toContainText('9个专业修复专区')
  const contactLinks = page.getByRole('link', { name: '评估修复需求' })
  await expect(contactLinks).toHaveCount(2)
  await expect(contactLinks.nth(0)).toHaveAttribute('href', '/contact')
  await expect(contactLinks.nth(1)).toHaveAttribute('href', '/contact')
  await expect(page.getByRole('link', { name: '了解退货质检' })).toHaveAttribute(
    'href',
    '/tuihuo-zhijian'
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1024)
})

test.describe('repair redesign on mobile without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps all methods, workshop photos, zones, process and FAQ readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/houzheng-xiufu')

    await expect(page.locator('[data-redesign-feature]')).toHaveCount(6)
    await expect(page.locator('[data-repair-workshop-panel]')).toHaveCount(3)
    const workshopControls = page.locator('[data-repair-workshop-controls]')
    await expect(workshopControls).toBeHidden()
    await expect(workshopControls).not.toHaveAttribute('role', 'tablist')
    await expect(workshopControls.locator('button')).toHaveCount(3)
    expect(
      await workshopControls
        .locator('button')
        .evaluateAll((buttons) => buttons.every((button) => button.getClientRects().length === 0))
    ).toBeTruthy()
    await expect(page.locator('[data-repair-workshop-panel="0"]')).not.toHaveAttribute(
      'role',
      'tabpanel'
    )
    await expect(page.locator('.repair-workshop__zones span')).toHaveCount(9)
    await expect(page.locator('.repair-process__steps > li')).toHaveCount(4)
    await expect(page.locator('.repair-process__outcomes > div')).toHaveCount(2)
    await expect(page.locator('[data-redesign-faq]')).toHaveCount(5)
    await expect(page.locator('[data-repair-workshop-panel="1"]')).toContainText('缝补工位')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })
})

test('keeps workshop figures readable when the enhancement module is unavailable', async ({
  page,
}) => {
  let blockedDevelopmentModuleRequests = 0
  let removedInlineModuleScripts = 0
  await page.route('**/src/scripts/repair-workshop.ts*', async (route) => {
    blockedDevelopmentModuleRequests += 1
    await route.abort()
  })
  await page.route('**/houzheng-xiufu', async (route) => {
    const response = await route.fetch()
    const body = await response.text()
    const withoutWorkshopModule = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (script) => {
      if (!script.includes('data-repair-workshop')) return script
      removedInlineModuleScripts += 1
      return ''
    })
    await route.fulfill({ response, body: withoutWorkshopModule })
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/houzheng-xiufu')

  expect(blockedDevelopmentModuleRequests + removedInlineModuleScripts).toBe(1)
  const workshopControls = page.locator('[data-repair-workshop-controls]')
  await expect(workshopControls).toBeHidden()
  await expect(workshopControls).not.toHaveAttribute('role', 'tablist')
  const panels = page.locator('[data-repair-workshop-panel]')
  await expect(panels).toHaveCount(3)
  for (const [index, label] of ['清污工位', '缝补工位', '熨烫工位'].entries()) {
    await expect(panels.nth(index)).toBeVisible()
    await expect(panels.nth(index)).toContainText(label)
  }
})
