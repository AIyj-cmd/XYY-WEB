import { expect, test } from '@playwright/test'
import { REDESIGN_ROUTE_EXPECTATIONS } from './service-redesign-routes'

test('shared service landing layout renders every visual variant', async ({ page }) => {
  // The complete ten-route matrix needs a cumulative navigation budget.
  test.setTimeout(90_000)
  const serviceRoutes = [
    '/xiefu-yuncang',
    '/tuihuo-zhijian',
    '/guangzhou-xiefu-yuncang',
    '/huanan-xiefu-yuncang',
    '/huadong-xiefu-yuncang',
    '/b2b-mendian-cangpei',
    '/kuajing-yuncang',
    '/zhibo-cangpei',
    '/houzheng-xiufu',
    '/yundao-zhineng-jijian',
  ]
  const editorialRoutes = new Set([
    '/huadong-xiefu-yuncang',
    '/b2b-mendian-cangpei',
    '/zhibo-cangpei',
  ])
  const heroMedia = new Map([
    ['/tuihuo-zhijian', 'tuihuo-zhijian'],
    ['/houzheng-xiufu', 'houzheng-xiufu'],
    ['/kuajing-yuncang', 'kuajing-yuncang'],
    ['/huadong-xiefu-yuncang', 'huadong-xiefu-yuncang'],
    ['/zhibo-cangpei', 'zhibo-cangpei'],
    ['/b2b-mendian-cangpei', 'b2b-mendian-cangpei'],
    ['/guangzhou-xiefu-yuncang', 'guangzhou-xiefu-yuncang'],
    ['/yundao-zhineng-jijian', 'yundao-zhineng-jijian'],
  ])

  for (const path of serviceRoutes) {
    const response = await page.goto(path)
    expect(response?.ok(), `${path} should return a successful response`).toBe(true)
    await expect(page.locator('#lp-h1')).toHaveCount(1)
    if (path === '/xiefu-yuncang') {
      await expect(page.locator('.footwear-page')).toHaveCount(1)
      await expect(page.locator('.signature')).toHaveCount(0)
      await expect(page.locator('.service-detail')).toHaveCount(0)
      await expect(page.locator('.service-faq')).toHaveCount(0)
      await expect(page.locator('.footwear-hero__video')).toHaveCount(1)
      await expect(page.locator('#footwear-fulfillment [role="tab"]')).toHaveCount(3)
      await expect(page.locator('.footwear-faq details')).toHaveCount(5)
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }))
      expect(dimensions.content, `${path} should not overflow`).toBeLessThanOrEqual(
        dimensions.viewport + 1
      )
      continue
    }
    const redesigned = REDESIGN_ROUTE_EXPECTATIONS.get(path)
    if (redesigned) {
      await expect(page.locator(redesigned.page)).toHaveCount(1)
      await expect(
        page.locator('.service-editorial, .signature, .service-detail, .service-faq')
      ).toHaveCount(0)
      await expect(page.locator(redesigned.video)).toHaveCount(1)
      for (const [selector, count] of redesigned.required) {
        await expect(page.locator(selector)).toHaveCount(count)
      }
      await expect(page.locator(redesigned.faq)).toHaveCount(5)
      if (path === '/kuajing-yuncang' || path === '/huanan-xiefu-yuncang') {
        const mediaPath = `/videos/service-detail-heroes-clean-20260913/${path.slice(1)}`
        const heroVideo = page.locator(redesigned.video)
        await expect(heroVideo).toHaveAttribute('poster', `${mediaPath}.jpg`)
        await expect(heroVideo.locator('source')).toHaveAttribute('src', `${mediaPath}.mp4`)
      }
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        content: document.documentElement.scrollWidth,
      }))
      expect(dimensions.content, `${path} should not overflow`).toBeLessThanOrEqual(
        dimensions.viewport + 1
      )
      continue
    }
    await expect(page.locator('.signature')).toHaveCount(1)
    await expect(page.locator('.service-detail')).toHaveCount(1)
    await expect(page.locator('.service-faq')).toHaveCount(1)
    const mediaName = heroMedia.get(path)
    expect(mediaName, `${path} should have dedicated hero media`).toBeTruthy()
    const heroVideo = page.locator('[data-service-hero-media]')
    const mediaPath = `/videos/service-detail-heroes-clean-20260913/${mediaName}`
    await expect(heroVideo).toHaveCount(1)
    await expect(heroVideo).toHaveAttribute('autoplay', '')
    await expect(heroVideo).toHaveAttribute('loop', '')
    await expect(heroVideo).toHaveAttribute('muted', '')
    await expect(heroVideo).toHaveAttribute('playsinline', '')
    await expect(heroVideo).not.toHaveAttribute('controls')
    await expect(heroVideo).toHaveAttribute('poster', `${mediaPath}.jpg`)
    await expect(heroVideo.locator('source')).toHaveAttribute('src', `${mediaPath}.mp4`)
    if (editorialRoutes.has(path)) {
      await expect(page.locator('.service-editorial')).toHaveCount(1)
      await expect(heroVideo).toHaveClass(/service-editorial-hero__video/)
      expect(
        await page.locator('.service-editorial .service-detail__features li').count()
      ).toBeGreaterThan(0)
    } else {
      await expect(page.locator('.service-editorial')).toHaveCount(0)
    }
    if (path === '/yundao-zhineng-jijian') {
      const cta = page.locator('[data-conversion-cta]')
      await expect(cta).toHaveCount(1)
      await expect(page.locator('.service-cta')).toHaveCount(0)
      const contactLink = cta.locator('a[href="/contact"]')
      await expect(contactLink).toHaveCount(1)
      await cta.scrollIntoViewIfNeeded()
      await expect(contactLink).toBeVisible()
      await expect(contactLink).toHaveAccessibleName('免费获取方案')
    } else {
      await expect(page.locator('[data-conversion-cta]')).toHaveCount(1)
      await expect(page.locator('.service-cta')).toHaveCount(0)
    }
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content, `${path} should not overflow`).toBeLessThanOrEqual(
      dimensions.viewport + 1
    )
  }
})

test('mobile navigation and honors dialog remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/about')

  const mobileNavigation = page.getByRole('navigation', { name: '移动端导航' })
  await expect(mobileNavigation.getByRole('link')).toHaveCount(7)
  await expect(mobileNavigation.getByRole('link', { name: '首页', exact: true })).toBeVisible()

  await page.getByRole('button', { name: '资质与荣誉', exact: true }).click()
  const explorer = page.getByRole('dialog', { name: '资质与荣誉', exact: true })
  await expect(explorer).toBeVisible()

  await page.locator('.honor-card').first().click()
  const honorDialog = page.getByRole('dialog', { name: '证书大图' })
  await expect(honorDialog).toBeVisible()
  await expect(honorDialog.locator('img')).toHaveAttribute('src', /.+/)
  await page.keyboard.press('Escape')
  await expect(honorDialog).toBeHidden()
  await expect(explorer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(explorer).toBeHidden()

  await page.goto('/supply-chain-whitepapers/')
  const mobileWhitepapersLink = page
    .getByRole('navigation', { name: '移动端导航' })
    .getByRole('link', { name: '供应链白皮书', exact: true })
  await expect(mobileWhitepapersLink).toHaveAttribute('href', '/supply-chain-whitepapers/')
  await expect(mobileWhitepapersLink).toHaveClass(/bg-white\/15/)
  await mobileWhitepapersLink.click()
  await expect(page).toHaveURL(/\/supply-chain-whitepapers\/$/)

  await page.goto('/cases')
  await expect(page.locator('#cases-grid .case-card')).toHaveCount(6)
  const mobileCasesWidth = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(mobileCasesWidth.content).toBeLessThanOrEqual(mobileCasesWidth.viewport + 1)
})

test('news page keeps category filters in content and supports CMS publishing', async ({
  page,
}) => {
  await page.goto('/news')

  await expect(page.getByRole('heading', { name: '鞋服物流知识库' })).toBeVisible()
  await expect(page.getByRole('group', { name: '文章分类筛选' })).toBeVisible()
  const whitepapersLink = page.locator('main a[href="/supply-chain-whitepapers/"]').first()
  await expect(whitepapersLink).toBeVisible()
  await expect(page.getByRole('heading', { name: '当前暂无已发布文章' })).toBeVisible()
  await expect(page.getByText('审核通过的文章会在这里自动发布')).toBeVisible()
  await expect(page.getByRole('heading', { name: '行业内容使用与更新说明' })).toBeVisible()
  await expect(page.locator('article')).toHaveCount(0)
  await whitepapersLink.click()
  await expect(page).toHaveURL(/\/supply-chain-whitepapers\/$/)
  await expect(page.getByRole('heading', { level: 1, name: '供应链白皮书' })).toBeVisible()
})
