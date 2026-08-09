import { expect, test } from '@playwright/test'

test('core pages render without horizontal overflow at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  for (const path of ['/', '/product', '/cases', '/about', '/contact']) {
    const response = await page.goto(path)
    expect(response?.ok(), `${path} should return a successful response`).toBe(true)
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(
      dimensions.content,
      `${path} should not overflow a ${dimensions.viewport}px viewport`
    ).toBeLessThanOrEqual(dimensions.viewport + 1)
  }
})

test('core pages remain stable at intermediate responsive breakpoints', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Explicit viewport matrix only needs one browser run'
  )
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  for (const width of [390, 430, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/', '/product', '/cases', '/about', '/contact']) {
      const response = await page.goto(path)
      expect(response?.ok(), `${path} should load at ${width}px`).toBe(true)
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }))
      expect(dimensions.content, `${path} should not overflow at ${width}px`).toBeLessThanOrEqual(
        dimensions.viewport + 1
      )
    }
  }

  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})
