import { expect, test } from '@playwright/test'

const viewports = [
  { width: 1440, height: 900, columns: 3 },
  { width: 768, height: 1024, columns: 2 },
  { width: 390, height: 844, columns: 1 },
  { width: 360, height: 800, columns: 1 },
]

const overlaps = (first: DOMRect, second: DOMRect) =>
  first.left < second.right &&
  first.right > second.left &&
  first.top < second.bottom &&
  first.bottom > second.top

test('cases overview keeps its responsive content, links, and controls usable', async ({
  page,
}) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    const response = await page.goto('/cases', { waitUntil: 'domcontentloaded' })
    expect(response?.ok(), `${viewport.width}px cases response`).toBe(true)
    await page.evaluate(() => document.fonts?.ready)

    await expect(page.getByRole('heading', { level: 1, name: '鞋服仓配合作案例' })).toBeVisible()
    await expect(page.getByText('仓配、质检与退货处理实践', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /浏览合作案例/ })).toHaveAttribute(
      'href',
      '#cases-grid'
    )
    await expect(page.locator('.cases-hero__secondary')).toHaveAttribute('href', '/contact')
    await expect(
      page.locator('[aria-label="主导航"]:visible, [aria-label="移动端导航"]:visible').first()
    ).toBeVisible()

    const geometry = await page.evaluate(() => {
      const heading = document.querySelector<HTMLElement>('#cases-hero-heading')
      const nav = [
        ...document.querySelectorAll<HTMLElement>(
          '[aria-label="主导航"], [aria-label="移动端导航"]'
        ),
      ].find((element) => {
        const style = getComputedStyle(element)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
      return {
        pageOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
          document.body.scrollWidth > document.body.clientWidth + 1,
        heroImage:
          document.querySelector<HTMLImageElement>('.cases-hero__image')?.naturalWidth ?? 0,
        heroShade: getComputedStyle(document.querySelector('.cases-hero__shade')!).backgroundImage,
        headingRect: heading?.getBoundingClientRect().toJSON(),
        navRect: nav?.getBoundingClientRect().toJSON(),
      }
    })
    expect(geometry.pageOverflow, `${viewport.width}px page overflow`).toBe(false)
    expect(geometry.heroImage, `${viewport.width}px hero image`).toBeGreaterThan(0)
    expect(geometry.heroShade).toContain('gradient')
    expect(
      geometry.headingRect && geometry.navRect && !overlaps(geometry.headingRect, geometry.navRect)
    ).toBe(true)

    const cardLefts = await page
      .locator('#cases-grid .case-card')
      .evaluateAll((cards) => [
        ...new Set(cards.map((card) => Math.round(card.getBoundingClientRect().left))),
      ])
    expect(cardLefts, `${viewport.width}px grid columns`).toHaveLength(viewport.columns)
    await expect(page.locator('#cases-grid .case-card')).toHaveCount(6)
    await expect(page.locator('.cases-featured')).toHaveCount(0)
    await expect(page.locator('.cases-hero + .cases-grid-section')).toHaveCount(1)
    for (const card of await page.locator('#cases-grid .case-card').all()) {
      await card.scrollIntoViewIfNeeded()
      await expect(card.locator('img')).toHaveAttribute('src', /.+/)
      const stats = card.locator('.case-card__stats > div')
      expect(await stats.count()).toBeLessThanOrEqual(3)
      if ((await card.locator('a').count()) > 0) {
        await expect(card.locator('a')).toHaveAttribute('href', /^\/cases\/[a-z0-9-]+$/)
      }
    }
  }
})

test('cases overview supports anchor, native logo expansion, FAQ keyboard use, and reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/cases', { waitUntil: 'domcontentloaded' })

  await page.getByRole('link', { name: /浏览合作案例/ }).click()
  await expect(page).toHaveURL(/\/cases#cases-grid$/)
  await expect(page.locator('#cases-grid')).toBeVisible()

  const visibleLogos = page.locator(
    '.cases-logo-wall__inner > .cases-logo-wall__grid .cases-logo-wall__item'
  )
  const moreLogos = page.locator('.cases-logo-wall__more .cases-logo-wall__item')
  await expect(visibleLogos).toHaveCount(12)
  await expect(moreLogos).toHaveCount(66)
  const more = page.locator('.cases-logo-wall__more')
  await expect(more).not.toHaveAttribute('open', '')
  await more.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(more).toHaveAttribute('open', '')
  const logoImages = more.locator('img')
  for (const image of await logoImages.all()) await image.scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      logoImages.evaluateAll(
        (images) =>
          images.filter(
            (image): image is HTMLImageElement =>
              image instanceof HTMLImageElement && image.naturalWidth > 0
          ).length
      )
    )
    .toBe(66)

  const faq = page.locator('section[aria-labelledby="page-faq-heading"] details').first()
  await faq.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(faq).toHaveAttribute('open', '')

  const motion = await page
    .locator('.case-card__surface > img')
    .first()
    .evaluate((image) => ({
      transitionDuration: getComputedStyle(image).transitionDuration,
    }))
  expect(motion.transitionDuration).toBe('0s')
})
