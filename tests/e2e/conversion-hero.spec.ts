import { expect, test } from '@playwright/test'

const heroCases = [
  {
    name: 'crossborder',
    source: '/kuajing-yuncang',
    href: '/contact?from=%2Fkuajing-yuncang&entry=hero#contact-form',
  },
  {
    name: 'south',
    source: '/huanan-xiefu-yuncang',
    href: '/contact?from=%2Fhuanan-xiefu-yuncang&entry=hero#contact-form',
  },
] as const

for (const heroCase of heroCases) {
  test(`${heroCase.name} hero contact is visible, source-aware, and lands on the preselected form`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(String(error)))
    await page.goto(heroCase.source)
    const heroLink = page.locator(`a[href="${heroCase.href}"]`)
    const statisticRequests: string[] = []
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/conversion-events')
        statisticRequests.push(request.url())
    })
    await expect(heroLink).toBeVisible()
    await expect(heroLink).toHaveAttribute('href', heroCase.href)
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    await expect
      .poll(() =>
        page
          .locator(`.${heroCase.name}-hero h1, .${heroCase.name}-hero p`)
          .evaluateAll((elements) =>
            elements.every((element) => {
              for (
                let ancestor: Element | null = element;
                ancestor;
                ancestor = ancestor.parentElement
              ) {
                if (getComputedStyle(ancestor).opacity !== '1') return false
              }
              return element.getAnimations({ subtree: true }).length === 0
            })
          )
      )
      .toBe(true)
    await page.screenshot({
      path: `output/removal/xyy-20261001-06/luna/hero-${heroCase.name}-${testInfo.project.name}-stable.png`,
      fullPage: false,
    })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true)
    await heroLink.click()
    await expect(page).toHaveURL(
      new RegExp(`${heroCase.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    )
    await expect(page.locator('select[name="service"]')).toHaveValue('cloud-warehouse')
    expect(statisticRequests).toEqual([])
    expect(errors).toEqual([])
  })
}
