import { expect, test } from '@playwright/test'

const conversionCtaContracts = {
  '/huadong-xiefu-yuncang': {
    headingId: 'east-contact-heading',
    actionLabel: '咨询华东仓配',
    preparationLabels: ['货品类型', '订单去向', '补货节奏', '本地团队沟通'],
  },
  '/tuihuo-zhijian': {
    headingId: 'returns-contact-heading',
    actionLabel: '沟通退货质检方案',
    preparationLabels: ['商品类型', '退件规模', '品牌判定规则'],
  },
  '/houzheng-xiufu': {
    headingId: 'repair-contact-heading',
    actionLabel: '评估修复需求',
    preparationLabels: ['商品材质', '瑕疵照片', '配件情况', '品牌验收规则'],
  },
  '/kuajing-yuncang': {
    headingId: 'crossborder-contact-heading',
    actionLabel: '梳理跨境仓内方案',
    preparationLabels: ['目标平台', '商品规范', '标签与包装模板', '预计处理量', '物流交接要求'],
  },
  '/zhibo-cangpei': {
    headingId: 'live-cta-heading',
    actionLabel: '咨询直播仓配',
    preparationLabels: ['开播时间', '预计订单', '商品种类与平台'],
  },
  '/huanan-xiefu-yuncang': {
    headingId: 'south-contact-heading',
    actionLabel: '咨询华南仓配服务',
    preparationLabels: ['货源位置', '主要收货地区', '订单需求'],
  },
  '/guangzhou-xiefu-yuncang': {
    headingId: 'service-conversion-cta-heading',
    actionLabel: '获取专属方案',
    preparationLabels: ['业务现状', '商品与订单', '目标与节奏'],
  },
  '/b2b-mendian-cangpei': {
    headingId: 'b2b-cta-heading',
    actionLabel: '咨询门店仓配',
    preparationLabels: ['门店分布', '补货安排', '分货与发运需求'],
  },
  '/cases': {
    headingId: 'cases-conversion-cta-heading',
    actionLabel: '预约案例分享',
    preparationLabels: ['品牌与品类', '服务场景', '关注重点'],
  },
  '/news': {
    headingId: 'news-conversion-cta-heading',
    actionLabel: '获取物流方案',
    preparationLabels: ['商品与渠道', '业务规模', '关注方向'],
  },
  '/supply-chain-whitepapers/': {
    headingId: 'publications-conversion-cta-heading',
    actionLabel: '立即联系',
    preparationLabels: ['联系目的', '品牌与身份', '关注内容'],
  },
} as const

const productDetailRoutes = [
  '/xiefu-yuncang',
  '/tuihuo-zhijian',
  '/houzheng-xiufu',
  '/kuajing-yuncang',
  '/huanan-xiefu-yuncang',
  '/huadong-xiefu-yuncang',
  '/zhibo-cangpei',
  '/b2b-mendian-cangpei',
]

test.setTimeout(60_000)

test('target pages retain their approved conversion paths without overflow', async ({
  page,
}, testInfo) => {
  const mobile = testInfo.project.name === 'mobile'
  await page.setViewportSize({ width: mobile ? 360 : 1440, height: 900 })

  const productResponse = await page.goto('/product')
  expect(productResponse?.ok(), '/product should return a successful response').toBe(true)
  await expect(page.locator('[data-conversion-cta]')).toHaveCount(0)
  await expect(page.locator('[data-product-video]')).toHaveCount(8)
  const productLinks = page.locator('[data-product-video-slide] a[href^="/"]')
  await expect(productLinks).toHaveCount(8)
  expect(
    await productLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  ).toEqual(productDetailRoutes)
  for (const link of await productLinks.all()) await expect(link).toHaveAccessibleName(/\S+/)

  const footwearResponse = await page.goto('/xiefu-yuncang')
  expect(footwearResponse?.ok(), '/xiefu-yuncang should return a successful response').toBe(true)
  await expect(page.locator('[data-conversion-cta]')).toHaveCount(0)
  const footwearContact = page.locator('.footwear-cta a[href="/contact"]')
  await expect(footwearContact).toHaveCount(1)
  await expect(footwearContact).toHaveAccessibleName(/\S+/)

  for (const [path, contract] of Object.entries(conversionCtaContracts)) {
    const response = await page.goto(path)
    expect(response?.ok(), `${path} should return a successful response`).toBe(true)

    const cta = page.locator('[data-conversion-cta]')
    await expect(cta, `${path} should render exactly one shared conversion CTA`).toHaveCount(1)
    await cta.scrollIntoViewIfNeeded()
    await expect(cta.locator('h2')).toHaveCSS('visibility', 'visible')
    await expect(cta.locator('.conversion-cta__inner')).toHaveCount(1)
    await expect(cta.locator('.conversion-cta__message')).toHaveCount(1)
    await expect(cta.locator('aside')).toHaveCount(1)
    const preparationItems = cta.locator('ol > li')
    await expect(preparationItems).toHaveCount(contract.preparationLabels.length)
    await expect(preparationItems.locator('strong')).toHaveText(contract.preparationLabels)

    await expect(cta).toHaveAttribute('aria-labelledby', contract.headingId)
    const heading = cta.getByRole('heading', { level: 2 })
    await expect(heading).toHaveCount(1)
    await expect(heading).toHaveAttribute('id', contract.headingId)
    await expect(heading).toHaveText(/\S+/)

    const contactLink = cta.getByRole('link', { name: contract.actionLabel, exact: true })
    await expect(contactLink).toHaveCount(1)
    await expect(contactLink).toHaveAttribute('href', '/contact')

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(
      dimensions.content,
      `${path} should not overflow at the active viewport`
    ).toBeLessThanOrEqual(dimensions.viewport + 1)
  }
})
