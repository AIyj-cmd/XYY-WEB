import { expect, test } from '@playwright/test'

function findFaqSchema(value: unknown): Array<{ name: string; text: string }> | undefined {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findFaqSchema(entry)
      if (found) return found
    }
    return undefined
  }
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  if (record['@type'] === 'FAQPage' && Array.isArray(record.mainEntity)) {
    const entries = record.mainEntity.filter(
      (entry): entry is Record<string, unknown> =>
        Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry)
    )
    return entries.map((entry) => ({
      name: String(entry.name),
      text: String((entry.acceptedAnswer as Record<string, unknown>)?.text),
    }))
  }
  return findFaqSchema(record['@graph'])
}

test('B2B redesign renders seven readable sections and preserves media, fees, and FAQ schema', async ({
  page,
}) => {
  test.setTimeout(45_000)
  const screenshotBase = 'output/playwright/xyy-20260916-05/luna'
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/b2b-mendian-cangpei')

  const sections = page.locator('.b2b-page > header, .b2b-page > section')
  await expect(sections).toHaveCount(7)
  const sectionOrder = await sections.evaluateAll((nodes) =>
    nodes.map((node) =>
      [
        'b2b-hero',
        'b2b-allocation',
        'b2b-replenishment',
        'b2b-system',
        'b2b-preparation',
        'b2b-faq',
        'b2b-cta',
      ].find((name) => node.classList.contains(name))
    )
  )
  expect(sectionOrder).toEqual([
    'b2b-hero',
    'b2b-allocation',
    'b2b-replenishment',
    'b2b-system',
    'b2b-preparation',
    'b2b-faq',
    'b2b-cta',
  ])
  await expect(page.locator('.b2b-page h1')).toHaveCount(1)
  await expect(page.locator('.b2b-hero h1 span')).toHaveText('B2B门店仓配')
  await expect(page.locator('.b2b-hero h1 strong')).toHaveText('按店配好货，门店好收货。')

  const video = page.locator('.b2b-hero__video')
  await expect(video).toHaveAttribute('autoplay', '')
  await expect(video).toHaveAttribute('loop', '')
  await expect(video).toHaveAttribute('muted', '')
  await expect(video).toHaveAttribute('playsinline', '')
  await expect(video).not.toHaveAttribute('controls')
  await expect(video).toHaveAttribute(
    'poster',
    '/videos/service-detail-heroes-clean-20260913/b2b-mendian-cangpei.jpg'
  )
  await expect(video.locator('source')).toHaveAttribute(
    'src',
    '/videos/service-detail-heroes-clean-20260913/b2b-mendian-cangpei.mp4'
  )
  await expect
    .poll(() => video.evaluate((node) => (node as HTMLVideoElement).currentTime), {
      timeout: 15_000,
      message: 'the original muted B2B video should advance during playback',
    })
    .toBeGreaterThan(0.5)

  await expect(page.locator('.b2b-distribution__objects > article')).toHaveCount(3)
  const featureTitles = await page.locator('.b2b-page [data-redesign-feature] b').allTextContents()
  expect(featureTitles).toEqual([
    '门店分货精准分拣',
    '货架标签 / 吊牌加工',
    '季节集中铺货保障',
    '零担 / 整车 / 快递混合发货',
    'B2C+B2B一盘货管理',
    'ERP / 进销存系统对接',
  ])
  await expect(page.locator('.b2b-distribution__accuracy')).toContainText('发货准确率')
  for (const label of ['精准分货', '合作品牌', '覆盖城市']) {
    await expect(page.locator('.b2b-page')).toContainText(label)
  }
  const fee = page.locator('.b2b-fee')
  await expect(fee).toBeVisible()
  const feeText = (await fee.innerText()).replace(/\s+/g, '')
  expect(feeText.indexOf('不收系统使用费')).toBeGreaterThanOrEqual(0)
  expect(feeText.indexOf('接口实施与定制费用按方案确认')).toBeGreaterThan(
    feeText.indexOf('不收系统使用费')
  )
  await expect(page.locator('.b2b-faq details')).toHaveCount(5)

  const faqRows = await page.locator('.b2b-faq details').evaluateAll((nodes) =>
    nodes.map((node) => ({
      name: node.querySelector('summary')?.textContent?.trim() ?? '',
      text: node.querySelector('p')?.textContent?.trim() ?? '',
    }))
  )
  const schemas: unknown[] = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
    .then((items) => items.map((item) => JSON.parse(item) as unknown))
  const faqSchema = schemas.map(findFaqSchema).find((schema) => schema !== undefined)
  expect(faqSchema).toEqual(faqRows)
  const serviceSchema = schemas
    .map((item) => {
      if (!item || typeof item !== 'object') return undefined
      return item as Record<string, unknown>
    })
    .find((item) => item?.['@type'] === 'Service')
  expect(serviceSchema?.name).toBe(await page.locator('.b2b-hero h1 span').innerText())
  expect(serviceSchema?.description).toBe(
    await page.locator('meta[name="description"]').getAttribute('content')
  )
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
  expect(new URL(canonical!).pathname).toBe('/b2b-mendian-cangpei')
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical!)

  for (const viewport of [
    { width: 1440, height: 900, name: '1440' },
    { width: 768, height: 900, name: '768' },
    { width: 390, height: 844, name: '390' },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const geometry = await page.evaluate(() => {
      const videoRect = document.querySelector('.b2b-hero__video')!.getBoundingClientRect()
      const copyRect = document.querySelector('.b2b-hero__copy')!.getBoundingClientRect()
      const videoStyle = getComputedStyle(document.querySelector('.b2b-hero__video')!)
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        video: { x: videoRect.x, y: videoRect.y, width: videoRect.width, height: videoRect.height },
        copy: { x: copyRect.x, y: copyRect.y, width: copyRect.width, height: copyRect.height },
        radius: Number.parseFloat(videoStyle.borderTopLeftRadius),
        scenariosDisplay: getComputedStyle(document.querySelector('.b2b-replenishment__scenarios')!)
          .display,
        scenarioBoxes: [...document.querySelectorAll('.b2b-replenishment__scenarios article')].map(
          (node) => {
            const rect = node.getBoundingClientRect()
            return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom }
          }
        ),
      }
    })
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width)
    expect(geometry.video.width / geometry.video.height).toBeCloseTo(16 / 9, 1)
    expect(geometry.radius).toBeGreaterThan(0)
    if (viewport.width === 1440) {
      expect(geometry.video.x + geometry.video.width).toBeLessThanOrEqual(geometry.copy.x + 1)
    } else {
      expect(geometry.copy.y + geometry.copy.height).toBeLessThanOrEqual(geometry.video.y + 1)
      expect(geometry.scenariosDisplay).toBe(viewport.width === 390 ? 'block' : 'grid')
    }
    for (let first = 0; first < geometry.scenarioBoxes.length; first += 1) {
      for (let second = first + 1; second < geometry.scenarioBoxes.length; second += 1) {
        const left = geometry.scenarioBoxes[first]
        const right = geometry.scenarioBoxes[second]
        const overlaps =
          left.x < right.right &&
          left.right > right.x &&
          left.y < right.bottom &&
          left.bottom > right.y
        expect(overlaps, `${viewport.width}px scenario cards should not overlap`).toBe(false)
      }
    }
    await expect(page.locator('.b2b-fee')).toBeVisible()
    if (test.info().project.name === 'chromium') {
      await page.screenshot({ path: `${screenshotBase}/b2b-${viewport.name}.png`, fullPage: true })
    }
  }
})

test('B2B native FAQ supports keyboard with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/b2b-mendian-cangpei')
  const firstFaq = page.locator('.b2b-faq details').first()
  const summary = firstFaq.locator('summary')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(firstFaq).toHaveAttribute('open', '')
})

test.describe('B2B redesign without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('keeps content visible and native FAQ keyboard-operable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/b2b-mendian-cangpei')
    await expect(page.locator('.b2b-page [data-redesign-feature]')).toHaveCount(6)
    await expect(page.locator('.b2b-faq details')).toHaveCount(5)
    const firstFaq = page.locator('.b2b-faq details').first()
    await firstFaq.locator('summary').focus()
    await page.keyboard.press('Space')
    await expect(firstFaq).toHaveAttribute('open', '')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })
})
