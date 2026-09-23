import { expect, test } from '@playwright/test'

const knownFeatures = [
  '全渠道一盘货',
  'RFID智能识别',
  '弹性产能机制',
  '深度定制WMS',
  '精细库存管控',
  '全程监控追溯',
]
const viewports = [1440, 961, 960, 768, 390, 360]

test('footwear full page keeps eight zones, content, metadata and hero video', async ({ page }) => {
  await page.goto('/xiefu-yuncang')
  await expect(page.locator('.footwear-page')).toHaveCount(1)
  await expect(page.locator('.footwear-page > section')).toHaveCount(8)
  await expect(page.locator('.footwear-page > section').first()).toHaveClass(/footwear-hero/)
  await expect(page.locator('.footwear-page > .footwear-goods')).toHaveCount(1)
  await expect(page.locator('.footwear-page > .footwear-network')).toHaveCount(1)
  await expect(page.locator('.footwear-page > .footwear-fulfillment')).toHaveCount(1)
  await expect(page.locator('.footwear-page > .footwear-assurance')).toHaveCount(1)
  await expect(page.locator('.footwear-page > .footwear-returns')).toHaveCount(1)
  await expect(page.locator('.footwear-page > .footwear-faq')).toHaveCount(1)
  await expect(page.locator('.footwear-page > .footwear-cta')).toHaveCount(1)
  for (const title of knownFeatures) {
    await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(1)
  }
  await expect(page.locator('.footwear-faq details')).toHaveCount(5)
  await expect(
    page.getByText(
      '适合需要管理款色码、库存和多渠道订单的鞋服品牌。具体仓配安排、费用和服务范围按项目确认。',
      { exact: true }
    )
  ).toHaveCount(1)
  await expect(
    page.locator(
      '.footwear-page a[href="/tuihuo-zhijian"], .footwear-page a[href="/houzheng-xiufu"], .footwear-page a[href="/contact"]'
    )
  ).toHaveCount(4)

  const metadata = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => scripts.map((x) => JSON.parse(x.textContent ?? '{}')))
  const service = metadata.find((x) => x['@type'] === 'Service')
  const faq = metadata.find((x) => x['@type'] === 'FAQPage')
  expect(await page.title()).toContain('款色码管理与全渠道仓配')
  expect(service?.name).toBe(await page.locator('.footwear-hero__service').textContent())
  expect(service?.description).toBe(
    await page.locator('meta[name="description"]').getAttribute('content')
  )
  expect(faq?.mainEntity).toHaveLength(5)
  const pairs = await page
    .locator('.footwear-faq details')
    .evaluateAll((details) =>
      details.map((d) => [
        d.querySelector('summary')?.textContent,
        d.querySelector('p')?.textContent,
      ])
    )
  expect(
    faq?.mainEntity.map((x: { name: string; acceptedAnswer: { text: string } }) => [
      x.name,
      x.acceptedAnswer.text,
    ])
  ).toEqual(pairs)

  const videos = page.locator('video')
  await expect(videos).toHaveCount(1)
  await expect(videos.first()).toHaveAttribute('autoplay', '')
  await expect(videos.first()).toHaveAttribute('loop', '')
  await expect(videos.first()).toHaveAttribute('muted', '')
  await expect(videos.first()).toHaveAttribute('playsinline', '')
  await expect(videos.first()).not.toHaveAttribute('controls')
  await expect(videos.first()).toHaveAttribute(
    'poster',
    /service-detail-heroes-clean-20260913\/xiefu-yuncang\.jpg/
  )
})

test('footwear stages remain visible and correctly oriented at tablet, mobile and desktop breakpoints', async ({
  page,
}) => {
  await page.goto('/xiefu-yuncang')
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(100)
    const state = await page.locator('#footwear-fulfillment [role="tablist"]').evaluate((list) => ({
      orientation: list.getAttribute('aria-orientation'),
      clientWidth: list.clientWidth,
      scrollWidth: list.scrollWidth,
      buttons: [...list.querySelectorAll('button')].map((button) => {
        const rect = button.getBoundingClientRect()
        return { left: rect.left, right: rect.right, width: rect.width, height: rect.height }
      }),
    }))
    expect(state.orientation, `${width}px orientation`).toBe(
      width <= 960 ? 'horizontal' : 'vertical'
    )
    expect(state.scrollWidth, `${width}px tablist overflow`).toBeLessThanOrEqual(
      state.clientWidth + 1
    )
    expect(
      state.buttons.every(
        ({ left, right, width: buttonWidth, height }) =>
          buttonWidth > 0 && height > 0 && left >= -1 && right <= width + 1
      ),
      `${width}px tab visibility`
    ).toBeTruthy()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `${width}px document overflow`
    ).toBeLessThanOrEqual(width)
  }
})

test('footwear stages support mouse, keyboard, focus and reduced motion boards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/xiefu-yuncang')
  const tabs = page.locator('#footwear-fulfillment [role="tab"]')
  await tabs.nth(1).click()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#footwear-stage-orders')).toBeVisible()
  await expect(page.locator('#footwear-stage-orders .footwear-fulfillment__board')).toBeVisible()
  await expect(page.locator('#footwear-stage-orders li')).toHaveCount(2)
  await expect(page.locator('#footwear-stage-orders svg')).toHaveCount(2)
  for (const text of [
    '订单下发：',
    '多平台实时同步，波次智能拆分。',
    '拣货复核：',
    '电子标签引导，RFID防错复核。',
  ]) {
    await expect(page.locator('#footwear-stage-orders')).toContainText(text)
  }
  for (const id of ['inbound', 'orders', 'outbound']) {
    await page.locator(`#footwear-tab-${id}`).click()
    await expect(page.locator(`#footwear-stage-${id}`)).toBeVisible()
    await expect(
      page.locator(
        `#footwear-stage-${id} video, #footwear-stage-${id} source, #footwear-stage-${id} img`
      )
    ).toHaveCount(0)
  }
  await tabs.nth(1).click()
  await tabs.nth(1).press('ArrowRight')
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
  await tabs.nth(2).press('Home')
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await tabs.nth(0).press('End')
  await expect(tabs.nth(2)).toBeFocused()
  await expect(tabs.nth(2)).toHaveAttribute('tabindex', '0')
  const outline = await tabs.nth(2).evaluate((x) => getComputedStyle(x).outlineStyle)
  expect(outline).toBe('solid')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await tabs.nth(0).click()
  await expect(page.locator('#footwear-stage-inbound')).toHaveCSS('animation-name', 'none')
})

test.describe('footwear page without scripts', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps all fulfillment stages and FAQ readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/xiefu-yuncang')
    await expect(page.locator('#footwear-fulfillment [role="tablist"]')).toBeHidden()
    for (const id of ['inbound', 'orders', 'outbound']) {
      await expect(page.locator(`#footwear-stage-${id}`)).toBeVisible()
    }
    await expect(page.locator('.footwear-faq summary')).toHaveCount(5)
    await expect(page.locator('.footwear-returns a[href="/tuihuo-zhijian"]')).toBeVisible()
  })
})
