import { expect, test, type Page, type Route } from '@playwright/test'

type ContactMode =
  | 'busy'
  | 'success'
  | 'validation'
  | 'storage'
  | 'rate-limited'
  | 'unknown'
  | 'unknown-toString'
  | 'unknown-constructor'
  | 'unknown-proto'
  | 'malformed200-empty'
  | 'malformed200-null'
  | 'malformed200-false'
  | 'malformed200-invalid-json'
  | 'malformed'
  | 'network'

const enquiry = {
  name: 'QA apparel brand',
  phone: '13800138000',
  requirements: 'Need a local fulfilment discussion.',
}

async function fillEnglishEnquiry(page: Page) {
  await page.getByLabel('Your name').fill(enquiry.name)
  await page.getByLabel('China mobile or landline').fill(enquiry.phone)
  await page.getByLabel('Your requirements').fill(enquiry.requirements)
  await page.getByRole('checkbox').check()
}

async function serveContact(route: Route, mode: Exclude<ContactMode, 'busy'>) {
  if (mode === 'network') return route.abort('failed')
  if (mode === 'malformed') return route.fulfill({ status: 502, body: '{' })
  if (mode === 'success') return route.fulfill({ status: 200, json: { success: true } })
  if (mode === 'malformed200-empty') return route.fulfill({ status: 200, json: {} })
  if (mode === 'malformed200-null') return route.fulfill({ status: 200, json: null })
  if (mode === 'malformed200-false') {
    return route.fulfill({ status: 200, json: { success: false } })
  }
  if (mode === 'malformed200-invalid-json') {
    return route.fulfill({
      status: 200,
      body: '{',
      headers: { 'content-type': 'application/json' },
    })
  }
  if (mode === 'validation') {
    return route.fulfill({
      status: 400,
      json: { error: '请输入有效的手机号或座机号', code: 'validation_failed' },
    })
  }
  if (mode === 'storage') {
    return route.fulfill({
      status: 503,
      json: { error: '提交失败，请稍后重试', code: 'storage_unavailable' },
    })
  }
  if (mode === 'rate-limited') {
    return route.fulfill({
      status: 429,
      json: { error: '提交过于频繁，请稍后再试', code: 'rate_limited' },
    })
  }
  if (mode === 'unknown-toString') {
    return route.fulfill({ status: 500, json: { error: '内部文字不应显示', code: 'toString' } })
  }
  if (mode === 'unknown-constructor') {
    return route.fulfill({
      status: 500,
      json: { error: '内部文字不应显示', code: 'constructor' },
    })
  }
  if (mode === 'unknown-proto') {
    return route.fulfill({ status: 500, json: { error: '内部文字不应显示', code: '__proto__' } })
  }
  return route.fulfill({ status: 500, json: { error: '内部文字不应显示', code: 'mystery' } })
}

test('localizes contact busy, success, coded, unknown, malformed and network states', async ({
  page,
}) => {
  let mode: ContactMode = 'busy'
  let releaseBusy: (() => void) | undefined
  await page.route('**/api/contact', async (route) => {
    if (mode === 'busy') {
      await new Promise<void>((resolve) => {
        releaseBusy = resolve
      })
      return route.fulfill({ status: 200, json: { success: true } })
    }
    return serveContact(route, mode)
  })

  await page.goto('/en/contact')
  const button = page.locator('button[type="submit"]')
  const result = page.locator('#form-result')

  await fillEnglishEnquiry(page)
  await button.click()
  await expect(button).toBeDisabled()
  await expect(button).toHaveAttribute('aria-busy', 'true')
  await expect(button).toHaveText('Submitting…')
  releaseBusy?.()
  await expect(result).toContainText('Thank you. Our business team will follow up')
  await expect(button).toBeEnabled()
  await expect(page.getByLabel('Your name')).toHaveValue('')
  await expect(page.getByLabel('Your requirements')).toHaveValue('')
  await expect(page.getByRole('checkbox')).not.toBeChecked()

  const cases: Array<[Exclude<ContactMode, 'busy'>, string]> = [
    ['success', 'Thank you. Our business team will follow up'],
    ['validation', 'Please complete the required fields using a valid domestic contact number.'],
    ['storage', 'We could not save your enquiry. Please call 400-6865-156.'],
    ['rate-limited', 'Too many submissions. Please try again later.'],
    ['unknown', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['unknown-toString', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['unknown-constructor', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['unknown-proto', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['malformed200-empty', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['malformed200-null', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['malformed200-false', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['malformed200-invalid-json', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['malformed', 'We could not submit your enquiry. Please call 400-6865-156.'],
    ['network', 'We could not submit your enquiry. Please call 400-6865-156.'],
  ]
  for (const [nextMode, expected] of cases) {
    mode = nextMode
    await page.reload()
    await fillEnglishEnquiry(page)
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('#form-result')).toContainText(expected)
    await expect(page.locator('#form-result')).not.toContainText('提交')
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
    if (nextMode === 'success') {
      await expect(page.getByLabel('Your name')).toHaveValue('')
      await expect(page.getByLabel('Your requirements')).toHaveValue('')
      await expect(page.getByRole('checkbox')).not.toBeChecked()
      await expect(page.locator('#form-result')).not.toContainText('We could not')
    } else {
      await expect(page.getByLabel('Your name')).toHaveValue(enquiry.name)
      await expect(page.getByLabel('China mobile or landline')).toHaveValue(enquiry.phone)
      await expect(page.getByLabel('Your requirements')).toHaveValue(enquiry.requirements)
      await expect(page.getByRole('checkbox')).toBeChecked()
      await expect(page.locator('#form-result')).not.toContainText('Thank you')
    }
  }
})
