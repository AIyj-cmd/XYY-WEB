import { expect, test } from '@playwright/test'

test('product page autoplays videos and keeps navigation synced with one scroll container', async ({
  page,
}, testInfo) => {
  const width = testInfo.project.name === 'mobile' ? 430 : 1440
  await page.setViewportSize({ width, height: 900 })
  await page.goto('/product')

  const videos = page.locator('[data-product-video]')
  const scrollContainer = page.locator('[data-product-video-scroll]')
  const previous = page.getByRole('button', { name: '上一个区域' })
  const next = page.getByRole('button', { name: '下一个区域' })
  const status = page.locator('[data-product-video-status]')
  await expect(videos).toHaveCount(8)
  await expect(scrollContainer).toHaveCount(1)
  await expect(page.locator('[data-product-video-slide]')).toHaveCount(9)
  await expect(previous).toBeDisabled()
  await expect(status).toHaveText('01 / 09')

  for (const [index, video] of (await videos.all()).entries()) {
    await expect(video).toHaveAttribute('loop', '')
    await expect(video).toHaveAttribute('muted', '')
    await expect(video).toHaveAttribute('playsinline', '')
    await expect(video).not.toHaveAttribute('controls')
    await expect(video).toHaveJSProperty('muted', true)
    if (index === 0) {
      await expect(video).toHaveAttribute('autoplay', '')
      await expect(video).toHaveAttribute('preload', 'auto')
    }
  }

  const firstVideo = videos.first()
  await expect(firstVideo).toHaveJSProperty('paused', false)
  await expect
    .poll(() => firstVideo.evaluate((video) => (video as HTMLVideoElement).currentTime), {
      timeout: 8_000,
    })
    .toBeGreaterThan(0.1)

  await next.focus()
  await page.keyboard.press('Enter')
  await expect(status).toHaveText('02 / 09')
  const secondOffset = await page
    .locator('[data-product-video-slide]')
    .nth(1)
    .evaluate((element) => {
      return (element as HTMLElement).offsetTop
    })
  await expect
    .poll(
      () =>
        scrollContainer.evaluate(
          (element, offset) => Math.abs(element.scrollTop - offset),
          secondOffset
        ),
      { timeout: 4_000 }
    )
    .toBeLessThanOrEqual(1)
  await expect(previous).toBeEnabled()

  const eighthOffset = await page
    .locator('[data-product-video-slide]')
    .nth(7)
    .evaluate((element) => {
      return (element as HTMLElement).offsetTop
    })
  await scrollContainer.evaluate((element, offset) => {
    element.scrollTop = offset
  }, eighthOffset)
  await expect(status).toHaveText('08 / 09')
  await next.click()
  await expect(status).toHaveText('09 / 09')
  await expect(next).toBeDisabled()
  const lastMechanism = page.locator('#assurance .assurance-mechanisms__list article').last()
  await lastMechanism.scrollIntoViewIfNeeded()
  await expect(lastMechanism).toBeInViewport()
  await previous.click()
  await expect(status).toHaveText('08 / 09')
  await expect
    .poll(
      () =>
        scrollContainer.evaluate(
          (element, offset) => Math.abs(element.scrollTop - offset),
          eighthOffset
        ),
      { timeout: 4_000 }
    )
    .toBeLessThanOrEqual(1)
  await expect(next).toBeEnabled()
  await scrollContainer.evaluate((element) => {
    element.scrollTop = element.scrollHeight - element.clientHeight
  })
  await expect(status).toHaveText('09 / 09')
  await expect(next).toBeDisabled()
})

test('product video navigation uses immediate scrolling when motion is reduced', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/product')

  const scrollContainer = page.locator('[data-product-video-scroll]')
  const secondOffset = await page
    .locator('[data-product-video-slide]')
    .nth(1)
    .evaluate((element) => {
      return (element as HTMLElement).offsetTop
    })
  await expect(scrollContainer).toHaveCSS('scroll-behavior', 'auto')
  await page.getByRole('button', { name: '下一个区域' }).click()

  await expect(page.locator('[data-product-video-status]')).toHaveText('02 / 09')
  expect(
    Math.abs((await scrollContainer.evaluate((element) => element.scrollTop)) - secondOffset)
  ).toBeLessThanOrEqual(1)
})
