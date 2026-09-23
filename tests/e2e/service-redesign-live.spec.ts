import { expect, test } from '@playwright/test'

type FaqSchema = {
  '@type'?: string
  mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }>
}

test('live redesign controls, content, media, and responsive layout meet the acceptance checks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/zhibo-cangpei')
  await expect(page.locator('.live-page')).toHaveCount(1)

  for (const selector of [
    '.live-hero',
    '.live-stages',
    '.live-sync',
    '.live-returns',
    '.live-mcn',
    '.live-faq',
    '.live-cta',
  ]) {
    await expect(page.locator(selector)).toHaveCount(1)
  }

  const video = page.locator('.live-hero__video')
  await expect(video).toHaveCount(1)
  await expect(video).toHaveAttribute('autoplay', '')
  await expect(video).toHaveAttribute('loop', '')
  await expect(video).toHaveAttribute('muted', '')
  await expect(video).toHaveAttribute('playsinline', '')
  await expect(video).not.toHaveAttribute('controls')
  await expect(video).toHaveJSProperty('autoplay', true)
  await expect(video).toHaveJSProperty('loop', true)
  await expect(video).toHaveJSProperty('muted', true)
  await expect(video).toHaveJSProperty('playsInline', true)
  await expect(page.locator('.live-page [data-redesign-feature]')).toHaveCount(6)
  await expect(page.locator('.live-stat')).toHaveCount(4)

  const faqRows = page.locator('.live-faq details')
  await expect(faqRows).toHaveCount(5)
  const renderedFaq = await faqRows.evaluateAll((rows) =>
    rows.map((row) => ({
      q: (row.querySelector('summary')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      a: (row.querySelector('p')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    }))
  )
  const faqSchema = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => {
      const schemas = scripts.flatMap((script) => {
        const parsed: unknown = JSON.parse(script.textContent ?? '{}')
        return (Array.isArray(parsed) ? parsed : [parsed]).filter(
          (item): item is FaqSchema => typeof item === 'object' && item !== null
        )
      })
      const schema = schemas.find((item) => item['@type'] === 'FAQPage')
      return schema?.mainEntity?.map((item) => ({
        q: item.name,
        a: item.acceptedAnswer.text.replace(/\s+/g, ' ').trim(),
      }))
    })
  expect(faqSchema).toEqual(renderedFaq)

  const tabs = page.locator('.live-stages [role="tab"]')
  const panels = page.locator('.live-stages [data-live-stage-panel]')
  const tablist = page.locator('.live-stages [role="tablist"]')
  await expect(tabs).toHaveCount(3)
  await expect(panels).toHaveCount(3)
  await expect(tablist).toHaveAttribute('aria-orientation', 'vertical')
  await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>('[data-live-stage-panel="1"]')
    if (!panel) throw new Error('Expected the second live stage panel')
    panel.addEventListener(
      'animationstart',
      (event) => {
        const animation = event as AnimationEvent
        document.documentElement.dataset.liveStageAnimation = `${animation.animationName}:${getComputedStyle(panel).animationDuration}`
      },
      { once: true }
    )
  })
  await tabs.nth(1).click()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(panels.nth(1)).toBeVisible()
  await expect
    .poll(() => page.locator('html').getAttribute('data-live-stage-animation'))
    .toBe('live-stage-fade:0.18s')

  await tabs.nth(2).press('ArrowDown')
  await expect(tabs.nth(0)).toBeFocused()
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await tabs.nth(0).press('ArrowUp')
  await expect(tabs.nth(2)).toBeFocused()
  await tabs.nth(2).press('Home')
  await expect(tabs.nth(0)).toBeFocused()
  await tabs.nth(0).press('End')
  await expect(tabs.nth(2)).toBeFocused()

  await tabs.nth(0).focus()
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
  await tabs.nth(0).press('Enter')
  await expect(tabs.nth(0)).toBeFocused()
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await tabs.nth(1).focus()
  await tabs.nth(1).press('Space')
  await expect(tabs.nth(1)).toBeFocused()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')

  for (const { width, height } of [
    { width: 1440, height: 900 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize({ width, height })
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width)
  }

  await page.setViewportSize({ width: 768, height: 900 })
  await expect(tablist).toHaveAttribute('aria-orientation', 'vertical')
  const tabletLayout = await page.evaluate(() => {
    const style = (selector: string) => getComputedStyle(document.querySelector(selector)!)
    const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect()
    const groups = [...document.querySelectorAll('.live-mcn__groups > p')].map((group) => {
      const title = group.querySelector('b')!
      const description = group.querySelector('span')!
      return {
        titleDisplay: getComputedStyle(title).display,
        descriptionDisplay: getComputedStyle(description).display,
        titleBottom: title.getBoundingClientRect().bottom,
        descriptionTop: description.getBoundingClientRect().top,
      }
    })
    return {
      heroColumns: style('.live-hero__grid').gridTemplateColumns.split(' ').length,
      heroCopyBottom: box('.live-hero__copy').bottom,
      videoTop: box('.live-hero__video').top,
      inventoryColumns: style('.live-sync__grid').gridTemplateColumns.split(' ').length,
      inventoryHeadingBottom: box('.live-sync__grid > header').bottom,
      inventoryBlocksTop: box('.live-sync__blocks').top,
      groups,
    }
  })
  expect(tabletLayout.heroColumns).toBe(1)
  expect(tabletLayout.videoTop).toBeGreaterThan(tabletLayout.heroCopyBottom)
  expect(tabletLayout.inventoryColumns).toBe(1)
  expect(tabletLayout.inventoryBlocksTop).toBeGreaterThan(tabletLayout.inventoryHeadingBottom)
  expect(tabletLayout.groups).toHaveLength(4)
  for (const group of tabletLayout.groups) {
    expect(group.titleDisplay).toBe('block')
    expect(group.descriptionDisplay).toBe('block')
    expect(group.descriptionTop).toBeGreaterThanOrEqual(group.titleBottom)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal')
  await tabs.nth(0).focus()
  await tabs.nth(0).press('ArrowRight')
  await expect(tabs.nth(1)).toBeFocused()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await tabs.nth(1).press('ArrowLeft')
  await expect(tabs.nth(0)).toBeFocused()
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await tabs.nth(1).click()
  const reducedMotion = await panels.nth(1).evaluate((panel) => {
    const style = getComputedStyle(panel)
    return { animationName: style.animationName, transitionDuration: style.transitionDuration }
  })
  expect(reducedMotion.animationName).toBe('none')
  expect(Number.parseFloat(reducedMotion.transitionDuration)).toBeLessThanOrEqual(0.00002)
})

test.describe('live redesign without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('keeps every stage readable and hides the inert tablist', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/zhibo-cangpei')
    const panels = page.locator('.live-stages [data-live-stage-panel]')
    await expect(panels).toHaveCount(3)
    for (const label of ['开播前', '集中出单', '发货跟进']) {
      await expect(panels.filter({ hasText: label })).toBeVisible()
    }
    await expect(page.locator('.live-stages [role="tablist"]')).toBeHidden()
    await expect(page.locator('[data-redesign-feature]')).toHaveCount(6)
    await expect(page.locator('[data-redesign-faq]')).toHaveCount(5)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
  })
})
