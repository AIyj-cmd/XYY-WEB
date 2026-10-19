import { expect, test } from '@playwright/test'

const mobileRoutes = ['/', '/en']

async function caseState(page: import('@playwright/test').Page, index: number) {
  return page.locator('.cases-gallery').evaluate((gallery, targetIndex) => {
    const panel = gallery.querySelectorAll<HTMLElement>('.cg-panel')[targetIndex]
    const galleryRect = gallery.getBoundingClientRect()
    const target = Math.min(
      gallery.scrollWidth - gallery.clientWidth,
      panel.getBoundingClientRect().left - galleryRect.left + gallery.scrollLeft
    )
    return { scrollLeft: gallery.scrollLeft, target }
  }, index)
}

async function moveAcrossGallery(page: import('@playwright/test').Page, position: number) {
  const gallery = page.locator('.cases-gallery')
  await gallery.scrollIntoViewIfNeeded()
  const box = await gallery.boundingBox()
  if (!box) throw new Error('cases_gallery_not_visible')
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + box.width * 0.12, y)
  await page.mouse.move(box.x + box.width * position, y)
}

test('mouse movement switches mobile case panels without opening the modal', async ({ page }) => {
  for (const path of mobileRoutes) {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('.cases-gallery .cg-panel')).toHaveCount(6)

      for (const [position, index] of [
        [0.02, 0],
        [0.55, 3],
        [0.98, 5],
      ]) {
        await moveAcrossGallery(page, position)
        await expect
          .poll(() =>
            caseState(page, index).then((state) => Math.abs(state.scrollLeft - state.target))
          )
          .toBeLessThanOrEqual(1)
      }

      await expect(page.locator('#case-modal')).toBeHidden()
      await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : `${path}$`}`))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
      )
      expect(overflow).toBe(true)
    }
  }
})

test('pointer entry preserves case activation and reduced motion skips smooth scrolling', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const nativeScrollTo = Element.prototype.scrollTo
    const behaviors: string[] = []
    Object.assign(window, { casePointerScrollBehaviors: behaviors })
    Element.prototype.scrollTo = function (xOrOptions?: number | ScrollToOptions, y?: number) {
      if (this.matches('#s-cases .cases-gallery') && typeof xOrOptions === 'object') {
        behaviors.push(xOrOptions?.behavior ?? 'auto')
      }
      if (typeof xOrOptions === 'number') {
        ;(nativeScrollTo as unknown as (this: Element, x: number, y: number) => void).call(
          this,
          xOrOptions,
          y ?? 0
        )
      } else {
        ;(nativeScrollTo as unknown as (this: Element, options?: ScrollToOptions) => void).call(
          this,
          xOrOptions
        )
      }
    }
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await moveAcrossGallery(page, 0.55)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as never as { casePointerScrollBehaviors: string[] }).casePointerScrollBehaviors
      )
    )
    .toContain('auto')
  await expect
    .poll(() => caseState(page, 3).then((state) => Math.abs(state.scrollLeft - state.target)))
    .toBeLessThanOrEqual(1)

  const card = page.locator('.cases-gallery .cg-panel').nth(3)
  await card.hover()
  await card.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#case-modal')).toBeHidden()
})

test('desktop hover retains the existing non-scrolling case expansion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const gallery = page.locator('.cases-gallery')
  const panel = gallery.locator('.cg-panel').nth(2)
  const initialWidth = await panel.evaluate((element) => element.getBoundingClientRect().width)
  await expect(gallery).toHaveJSProperty('scrollLeft', 0)
  await panel.hover()
  await expect
    .poll(() => panel.evaluate((element) => element.getBoundingClientRect().width))
    .toBeGreaterThan(initialWidth * 2)
  await expect(panel.locator('.cg-detail')).toHaveCSS('opacity', '1')
  await expect(gallery).toHaveJSProperty('scrollLeft', 0)
})
