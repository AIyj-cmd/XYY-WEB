import { expect, test } from '@playwright/test'

const routes = [
  ['/news', 'news-conversion-cta-heading'],
  ['/supply-chain-whitepapers/', 'publications-conversion-cta-heading'],
  ['/en/supply-chain-whitepapers', 'english-whitepapers-conversion-cta-heading'],
] as const

const viewports = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
]

test('content FAQs use the home accordion while preserving their data and CTAs', async ({
  page,
}) => {
  for (const [path, ctaHeadingId] of routes) {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    const faq = page.locator('#s-faq')
    const details = faq.locator('details')

    await expect(faq).toHaveAttribute('aria-labelledby', 'page-faq-heading')
    await expect(details).toHaveCount(8)
    await expect(details.first()).toHaveAttribute('open', '')
    await expect(faq.locator('details[open]')).toHaveCount(1)

    await details.nth(1).locator('summary').click()
    await expect(details.first()).not.toHaveAttribute('open', '')
    await expect(details.nth(1)).toHaveAttribute('open', '')
    await expect(faq.locator('details[open]')).toHaveCount(1)

    await details.nth(1).locator('summary').focus()
    await page.keyboard.press('Enter')
    await expect(details.nth(1)).not.toHaveAttribute('open', '')
    await page.keyboard.press('Enter')
    await expect(details.nth(1)).toHaveAttribute('open', '')
    await expect(faq.locator('details[open]')).toHaveCount(1)

    await expect(page.locator('#home-conversion-cta-heading')).toHaveCount(0)
    await expect(page.locator(`#${ctaHeadingId}`)).toHaveCount(1)

    const questions = await faq.locator('.faq-q > span:nth-child(2)').allTextContents()
    const answers = await faq.locator('.faq-a').allTextContents()
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((source) => JSON.parse(source))
      .filter((schema) => schema['@type'] === 'FAQPage')
    expect(schemas).toHaveLength(1)
    expect(schemas[0].mainEntity.map((item: { name: string }) => item.name)).toEqual(questions)
    expect(
      schemas[0].mainEntity.map((item: { acceptedAnswer: { text: string } }) =>
        item.acceptedAnswer.text.trim()
      )
    ).toEqual(answers.map((answer) => answer.trim()))
  }
})

test('content FAQs stay readable at supported desktop and mobile widths', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    for (const [path] of routes) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('#s-faq')).toBeVisible()
      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      )
      expect(pageOverflow, `${path} at ${viewport.width}px`).toBe(false)
    }
  }
})
