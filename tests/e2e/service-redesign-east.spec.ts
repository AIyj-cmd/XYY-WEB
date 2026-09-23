import { expect, test } from '@playwright/test'

const addressTexts = [
  '上海市青浦区白鹤镇外青松公路3939号B-3-3',
  '江苏省苏州市昆山市鸡鸣塘南路936号院内A8-2F',
  '安徽省合肥市蜀山区紫蓬路2886号',
]
const bannedCopy = /核心节点|仓点索引|线路核验|适用口径|商务BD|实际启用|仓容|SLA|OMS/
const viewports = [
  { width: 1440, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
]

async function readSchemas(page: import('@playwright/test').Page) {
  return page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.flatMap((script) => {
      try {
        return [JSON.parse(script.textContent ?? '')]
      } catch {
        return []
      }
    })
  )
}

test('east inventory redesign renders seven areas, three warehouses, and public content', async ({
  page,
}) => {
  test.setTimeout(120_000)
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    const response = await page.goto('/huadong-xiefu-yuncang')
    expect(response?.ok(), `${viewport.width}px route response`).toBe(true)

    await expect(page.locator('.east-page')).toHaveCount(1)
    await expect(page.locator('.east-hero__video')).toHaveCount(1)
    await expect(page.locator('.east-warehouses article')).toHaveCount(3)
    await expect(page.locator('.east-business__service')).toHaveCount(3)
    await expect(page.locator('.east-collaboration__items article')).toHaveCount(3)
    await expect(page.locator('.east-service-info__grid article')).toHaveCount(2)
    await expect(page.locator('.east-faq details')).toHaveCount(5)
    await expect(page.locator('.east-page [data-redesign-feature]')).toHaveCount(6)

    await expect(page.locator('#lp-h1')).toContainText('华东鞋服云仓')
    await expect(page.locator('.east-warehouses address')).toHaveText(addressTexts)
    const contactCta = page.locator('.east-contact[data-conversion-cta]')
    await expect(contactCta).toHaveCount(1)
    const contactLink = contactCta.locator('a[href="/contact"]')
    await expect(contactLink).toHaveCount(1)
    await expect(contactLink).toHaveAccessibleName(/咨询华东仓配/)
    await expect(page.locator('.east-page')).not.toContainText(bannedCopy)

    const facts = await page.locator('.east-page').evaluate((root) => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('*'))
      const borders = nodes.filter((node) => {
        const style = getComputedStyle(node)
        return [
          style.borderTopWidth,
          style.borderRightWidth,
          style.borderBottomWidth,
          style.borderLeftWidth,
        ].some((width) => width !== '0px')
      })
      const addresses = Array.from(
        root.querySelectorAll<HTMLElement>('.east-warehouses address')
      ).map((node) => node.getBoundingClientRect())
      const overlaps = addresses.some((a, index) =>
        addresses
          .slice(index + 1)
          .some((b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)
      )
      return {
        borders: borders.length,
        overlaps,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }
    })
    expect(facts.borders).toBe(0)
    expect(facts.overlaps).toBe(false)
    expect(facts.scrollWidth).toBeLessThanOrEqual(facts.viewportWidth + 1)

    const schemas = await readSchemas(page)
    const service = schemas.find((schema) => schema['@type'] === 'Service')
    const faq = schemas.find((schema) => schema['@type'] === 'FAQPage')
    expect(service?.description).toBe(
      await page.locator('meta[name="description"]').getAttribute('content')
    )
    expect(faq?.mainEntity).toHaveLength(5)
    const visibleFaq = await page.locator('.east-faq details').evaluateAll((details) =>
      details.map((detail) => ({
        q: detail.querySelector('summary')?.textContent?.trim(),
        a: detail.querySelector('p')?.textContent?.trim(),
      }))
    )
    expect(
      faq?.mainEntity.map((item: { name: string; acceptedAnswer: { text: string } }) => ({
        q: item.name,
        a: item.acceptedAnswer.text,
      }))
    ).toEqual(visibleFaq)

    const video = page.locator('.east-hero__video')
    await expect(video).toHaveAttribute('autoplay', '')
    await expect(video).toHaveAttribute('loop', '')
    await expect(video).toHaveAttribute('muted', '')
    await expect(video).toHaveAttribute('playsinline', '')
    await expect(video).not.toHaveAttribute('controls')
    await expect(video).toHaveAttribute('poster', /huadong-xiefu-yuncang\.jpg$/)
    await expect(video.locator('source')).toHaveAttribute('src', /huadong-xiefu-yuncang\.mp4$/)
    const before = await video.evaluate((node) => (node as HTMLVideoElement).currentTime)
    await page.waitForTimeout(300)
    const after = await video.evaluate((node) => {
      const element = node as HTMLVideoElement
      return { currentTime: element.currentTime, paused: element.paused, muted: element.muted }
    })
    expect(after.currentTime).toBeGreaterThan(before)
    expect(after.paused).toBe(false)
    expect(after.muted).toBe(true)

    const summary = page.locator('.east-faq details summary').first()
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(summary.locator('..')).toHaveAttribute('open', '')
  }
})

test.describe('east inventory redesign without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps warehouses, all features, FAQ, and CTA readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/huadong-xiefu-yuncang')
    await expect(page.locator('.east-warehouses article')).toHaveCount(3)
    await expect(page.locator('.east-warehouses address')).toHaveText(addressTexts)
    await expect(page.locator('.east-page [data-redesign-feature]')).toHaveCount(6)
    await expect(page.locator('[data-redesign-faq]')).toHaveCount(5)
    const contactCta = page.locator('.east-contact[data-conversion-cta]')
    await expect(contactCta).toHaveCount(1)
    const contactLink = contactCta.locator('a[href="/contact"]')
    await expect(contactLink).toHaveCount(1)
    await expect(contactLink).toHaveAccessibleName(/咨询华东仓配/)
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1)
  })
})
