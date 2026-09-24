import { expect, test } from '@playwright/test'

const videoSourceStates = () =>
  Array.from(document.querySelectorAll<HTMLVideoElement>('[data-product-video]')).map((video) => ({
    id: video.id,
    paused: video.paused,
    source: video.querySelector('source')?.getAttribute('src'),
  }))

const attachedIds = (states: ReturnType<typeof videoSourceStates>) =>
  states.filter((state) => state.source).map((state) => state.id)

test('product only requests the active video and prepares one next video', async ({ page }) => {
  const requestedVideos: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/videos/') && request.url().endsWith('.mp4')) {
      requestedVideos.push(new URL(request.url()).pathname)
    }
  })
  await page.goto('/product')

  const scrollContainer = page.locator('[data-product-video-scroll]')
  const forbiddenInitialRequests = [
    '05-refurbishment.mp4',
    'outbound-loading.mp4',
    '02-storage.mp4',
    '03-picking.mp4',
    '06-packing.mp4',
    'order-distribution.mp4',
  ]
  await expect
    .poll(() => page.evaluate(videoSourceStates).then(attachedIds))
    .toEqual(['01-overview', '02-returns'])
  expect(
    requestedVideos.filter((request) =>
      forbiddenInitialRequests.some((filename) => request.includes(filename))
    )
  ).toEqual([])

  const sixthOffset = await page
    .locator('[data-product-video-slide]')
    .nth(5)
    .evaluate((slide) => {
      return (slide as HTMLElement).offsetTop
    })
  await scrollContainer.evaluate((container, offset) => {
    container.scrollTop = offset
  }, sixthOffset)
  await expect
    .poll(() => page.evaluate(videoSourceStates).then(attachedIds))
    .toEqual(['06-east-china', '07-live-commerce'])
  await expect
    .poll(() =>
      page.locator('[id="06-east-china"]').evaluate((video) => {
        const element = video as HTMLVideoElement
        return !element.paused && element.currentTime > 0
      })
    )
    .toBe(true)

  const secondOffset = await page
    .locator('[data-product-video-slide]')
    .nth(1)
    .evaluate((slide) => {
      return (slide as HTMLElement).offsetTop
    })
  await scrollContainer.evaluate((container, offset) => {
    container.scrollTop = offset
  }, secondOffset)
  await expect
    .poll(() => page.evaluate(videoSourceStates).then(attachedIds))
    .toEqual(['02-returns', '03-refurbishment'])
  await expect(page.locator('[id="06-east-china"] source')).not.toHaveAttribute('src', /.*/)

  await page.getByRole('button', { name: '下一个区域' }).click()
  await expect
    .poll(() => page.evaluate(videoSourceStates).then(attachedIds))
    .toEqual(['03-refurbishment', '04-cross-border'])

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect
    .poll(() =>
      page.evaluate(videoSourceStates).then((states) => states.filter((video) => !video.paused))
    )
    .toEqual([])
  await expect.poll(() => page.evaluate(videoSourceStates).then(attachedIds)).toEqual([])
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect
    .poll(() => page.evaluate(videoSourceStates).then(attachedIds))
    .toEqual(['03-refurbishment', '04-cross-border'])
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide'))
  })
  await expect.poll(() => page.evaluate(videoSourceStates).then(attachedIds)).toEqual([])
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pageshow'))
  })
  await expect
    .poll(() => page.evaluate(videoSourceStates).then(attachedIds))
    .toEqual(['03-refurbishment', '04-cross-border'])

  await scrollContainer.evaluate((container) => {
    container.scrollTop = container.scrollHeight - container.clientHeight
  })
  await expect.poll(() => page.evaluate(videoSourceStates).then(attachedIds)).toEqual([])
})

test.describe('product video media without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps the native first autoplay source and poster/text fallback for later slides', async ({
    page,
  }) => {
    await page.goto('/product')

    const videos = page.locator('[data-product-video]')
    await expect(videos).toHaveCount(8)
    await expect(videos.first()).toHaveAttribute('autoplay', '')
    await expect(videos.first()).toHaveAttribute('preload', 'auto')
    await expect(videos.first().locator('source')).toHaveAttribute(
      'src',
      /01-overview-clean-20260921\.mp4$/
    )
    const laterVideos = (await videos.all()).slice(1)
    for (const video of laterVideos) {
      await expect(video).not.toHaveAttribute('autoplay', '')
      await expect(video).toHaveAttribute('preload', 'none')
      await expect(video.locator('source')).not.toHaveAttribute('src', /.*/)
      await expect(video.locator('source')).toHaveAttribute('data-src', /\.mp4$/)
      await expect(video).toHaveAttribute('poster', /\.jpg$/)
    }
    await expect(page.locator('[data-product-video-copy]')).toHaveCount(8)
    await expect(page.locator('#assurance')).toContainText(
      '让服务可以被看见、被复核，也被持续改进。'
    )
  })
})

test('product releases all video sources in the static section across viewport shapes', async ({
  page,
}) => {
  const viewports = [
    { width: 360, height: 640 },
    { width: 844, height: 390 },
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.goto('/product')

    const scrollContainer = page.locator('[data-product-video-scroll]')
    await scrollContainer.evaluate((container) => {
      container.scrollTop = container.scrollHeight - container.clientHeight
    })
    await expect.poll(() => page.evaluate(videoSourceStates).then(attachedIds)).toEqual([])

    const eighthOffset = await page
      .locator('[data-product-video-slide]')
      .nth(7)
      .evaluate((slide) => {
        return (slide as HTMLElement).offsetTop
      })
    await scrollContainer.evaluate((container, offset) => {
      container.scrollTop = offset
    }, eighthOffset)
    await expect
      .poll(() => page.evaluate(videoSourceStates).then(attachedIds))
      .toEqual(['08-b2b-stores'])
    await expect
      .poll(() =>
        page
          .locator('[id="08-b2b-stores"]')
          .evaluate((video) => !(video as HTMLVideoElement).paused)
      )
      .toBe(true)
  }
})
