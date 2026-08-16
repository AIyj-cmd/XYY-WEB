import { expect, test } from '@playwright/test'

test('refactored about, cases, publications and Yundao modules preserve their contracts', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop interaction contract runs once')
  await page.goto('/about')
  const navigationGlass = page.locator('.site-header__glass')
  await expect(navigationGlass).toBeVisible()
  await expect
    .poll(() =>
      navigationGlass.evaluate((surface) => ({
        backdropFilter: getComputedStyle(surface).backdropFilter,
        borderRadius: getComputedStyle(surface).borderRadius,
      }))
    )
    .toMatchObject({
      backdropFilter: expect.stringContaining('blur(22px)'),
      borderRadius: '999px',
    })
  const productNavigation = page.getByRole('navigation', { name: '主导航' }).getByRole('link', {
    name: '仓配服务',
    exact: true,
  })
  await productNavigation.hover()
  const servicePopover = page.locator('.site-header__popover')
  await expect(servicePopover).toBeVisible()
  await expect
    .poll(() =>
      servicePopover.evaluate((popover) => {
        const rect = popover.getBoundingClientRect()
        return rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight
      })
    )
    .toBe(true)
  const heroHeight = await page
    .locator('#about-hero')
    .evaluate((element) => Math.round(element.getBoundingClientRect().height))
  expect(heroHeight).toBeGreaterThanOrEqual(718)
  await expect(page.locator('body > footer')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '想了解更多合作详情？' })).toHaveCount(0)
  await expect(page.locator('[data-about-explorer-open]')).toHaveCount(4)
  await expect(page.locator('.about-stage__description')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '浏览新亦源' })).toHaveCount(0)
  await expect(page.locator('.about-explorer__media')).toHaveCount(0)
  await expect(page.locator('[data-about-carousel-prev], [data-about-carousel-next]')).toHaveCount(
    0
  )
  await expect(page.getByRole('heading', { name: '关于新亦源' })).toBeVisible()
  await expect(page.locator('.about-overview p')).toBeVisible()
  const identity = page.getByRole('complementary', { name: '新亦源联系信息' })
  await expect(identity).toBeVisible()
  await expect(identity.getByRole('link', { name: '400-6865-156' })).toBeVisible()
  await expect(identity.getByText('华南总部')).toBeVisible()
  await expect(identity.getByText('广东省广州市黄埔区果园一路2号')).toBeVisible()
  await expect(page.locator('[data-about-gallery]')).toHaveCount(1)
  const aboutFooter = page.getByRole('contentinfo', { name: '关于页页脚' })
  await expect(aboutFooter).toHaveCount(1)
  await expect(aboutFooter.getByRole('complementary', { name: '新亦源联系信息' })).toBeVisible()
  await expect(page.locator('#about-hero [aria-label="新亦源联系信息"]')).toHaveCount(0)
  await expect
    .poll(() => aboutFooter.evaluate((footer) => getComputedStyle(footer).backgroundColor))
    .toBe('rgb(248, 250, 252)')
  await expect(aboutFooter.getByRole('link', { name: '返回顶部' })).toHaveAttribute(
    'href',
    '#about-hero'
  )
  await expect(page.locator('.about-gallery__frame img')).toHaveCount(157)
  await expect(page.locator('[data-about-gallery-statement]')).toHaveCount(5)
  await expect
    .poll(() =>
      page
        .locator('.about-stage__media')
        .evaluate((video) => getComputedStyle(video).objectPosition)
    )
    .toBe('50% 100%')
  await expect
    .poll(() =>
      page
        .locator('[data-about-gallery]')
        .evaluate((gallery) => getComputedStyle(gallery).backgroundColor)
    )
    .toBe('rgb(255, 255, 255)')
  const fixedGalleryOrder = await page
    .locator('.about-gallery__frame img')
    .evaluateAll((images) => images.slice(0, 12).map((image) => image.getAttribute('src')))
  const galleryImage = page.locator('[data-about-gallery-image]').nth(20)
  await galleryImage.scrollIntoViewIfNeeded()
  await expect
    .poll(() => galleryImage.evaluate((image) => getComputedStyle(image).opacity))
    .toBe('1')
  await page.evaluate(() => {
    const gallery = document.querySelector<HTMLElement>('[data-about-gallery]')
    if (gallery) window.scrollTo(0, gallery.offsetTop + gallery.offsetHeight * 0.3)
  })
  const activeGalleryCopy = page.locator('[data-about-gallery-statement][data-active="true"]')
  await expect(activeGalleryCopy).toHaveCount(1)
  await expect
    .poll(() => activeGalleryCopy.locator('h2').evaluate((copy) => getComputedStyle(copy).opacity))
    .toBe('1')
  await expect
    .poll(() => activeGalleryCopy.locator('h2').evaluate((copy) => getComputedStyle(copy).color))
    .toBe('rgb(255, 255, 255)')
  await expect
    .poll(() =>
      activeGalleryCopy
        .locator('p')
        .last()
        .evaluate((copy) => getComputedStyle(copy).color)
    )
    .toBe('rgb(255, 255, 255)')
  await page.reload()
  await expect(page.locator('.about-gallery__frame img')).toHaveCount(157)
  expect(
    await page
      .locator('.about-gallery__frame img')
      .evaluateAll((images) => images.slice(0, 12).map((image) => image.getAttribute('src')))
  ).toEqual(fixedGalleryOrder)

  const muteButton = page.locator('#hero-mute-btn')
  await expect(muteButton).toHaveAttribute('aria-label', '开启声音')
  await muteButton.click()
  await expect(muteButton).toHaveAttribute('aria-label', '静音')

  await page.getByRole('button', { name: '发展历程', exact: true }).click()
  const aboutDialog = page.getByRole('dialog', { name: '发展历程', exact: true })
  await expect(aboutDialog).toBeVisible()
  await expect
    .poll(() =>
      aboutDialog.evaluate((dialog) => {
        const rect = dialog.getBoundingClientRect()
        const horizontalOffset = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2)
        const verticalOffset = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2)
        return Math.max(horizontalOffset, verticalOffset)
      })
    )
    .toBeLessThanOrEqual(2)
  await expect(page.locator('#history-heading')).toBeVisible()
  await expect(page.locator('#history-track > div')).toHaveCount(10)
  await expect(page.locator('#history-track img[src="/logo.png"]').first()).toBeVisible()
  await page.getByRole('button', { name: '下一年' }).click()
  await expect(page.locator('[aria-label="跳到2017年"] .history-dot-circle')).toHaveClass(
    /bg-brand-orange/
  )
  const history2026 = page.getByRole('button', { name: '跳到2026年' })
  await expect(history2026).toBeVisible()
  await history2026.click()
  await expect(
    page.getByText('引入华为管理体系，全面提升公司管理水平，建立可支撑长远发展的运作体系')
  ).toBeVisible()
  await page.locator('[data-about-explorer-close]').click()
  await page.getByRole('button', { name: '仓网布局', exact: true }).click()
  await expect(page.getByRole('heading', { name: /CDC\/RDC\/FDC三级仓网/ })).toBeVisible()
  await expect(page.getByRole('dialog', { name: '仓网布局', exact: true })).toBeVisible()

  await page.goto('/cases')
  const standardFooter = page.locator('body > footer')
  await expect(standardFooter).toBeVisible()
  await expect(standardFooter).toHaveClass(/bg-slate-50/)
  await expect(page.locator('.case-brand-ring--1')).toHaveCSS(
    'animation-name',
    'brand-orbit-clockwise'
  )
  await expect(page.locator('#cases-grid')).toHaveCount(1)
  await expect(page.locator('#cases-grid .case-card')).toHaveCount(6)
  await expect(page.locator('.case-brand-ring')).toHaveCount(3)
  await expect(page.locator('[data-case-orbit-panel]:not([hidden])')).toContainText('UR')
  await expect(page.getByRole('heading', { name: '为什么品牌选择新亦源' })).toBeVisible()

  await page.goto('/senlinqikan')
  await expect(page.getByRole('heading', { level: 1, name: '森林期刊' })).toBeVisible()
  await expect(page.locator('#issues a[href$=".pdf"]')).toHaveCount(14)

  await page.goto('/yundao-zhineng-jijian')
  await expect(page.locator('.yd-interface figure')).toHaveCount(3)
  await expect(page.locator('.yd-flow li')).toHaveCount(6)
  await expect(page.locator('.yd-scenarios article')).toHaveCount(3)
})
