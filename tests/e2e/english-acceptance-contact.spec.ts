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
  email: 'buyer@example.com',
  phone: '+1 (555) 123-4567',
  requirements: 'Need a local fulfilment discussion.',
}
const thankYou = 'Thank you. Our business team will follow up'
const fallback =
  'We could not submit your enquiry. Please try again and keep your details in the form.'
const emailField = (page: Page) => page.getByRole('textbox', { name: 'Email', exact: true })
const requirementsField = (page: Page) =>
  page.getByRole('textbox', { name: 'Your requirements', exact: true })
const submitButton = (page: Page) => page.locator('#contact-form button[type="submit"]')

async function fillEnglishEnquiry(page: Page) {
  await page.getByLabel('Your name').fill(enquiry.name)
  await emailField(page).fill(enquiry.email)
  await page.getByLabel('Phone number (optional)').fill(enquiry.phone)
  await requirementsField(page).fill(enquiry.requirements)
  await page.getByRole('checkbox').check()
}

async function serveContact(route: Route, mode: Exclude<ContactMode, 'busy'>) {
  if (mode === 'network') return route.abort('failed')
  if (mode === 'malformed') return route.fulfill({ status: 502, body: '{' })
  if (mode === 'success') return route.fulfill({ status: 200, json: { success: true } })
  if (mode === 'malformed200-empty') return route.fulfill({ status: 200, json: {} })
  if (mode === 'malformed200-null') return route.fulfill({ status: 200, json: null })
  if (mode === 'malformed200-false') return route.fulfill({ status: 200, json: { success: false } })
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
    return route.fulfill({ status: 500, json: { error: '内部文字不应显示', code: 'constructor' } })
  }
  if (mode === 'unknown-proto') {
    return route.fulfill({ status: 500, json: { error: '内部文字不应显示', code: '__proto__' } })
  }
  return route.fulfill({ status: 500, json: { error: '内部文字不应显示', code: 'mystery' } })
}

const responseCases: Array<[Exclude<ContactMode, 'busy'>, string]> = [
  ['success', thankYou],
  ['validation', 'Please provide your name, a valid email address'],
  [
    'storage',
    'We could not save your enquiry. Please try again and keep your details in the form.',
  ],
  ['rate-limited', 'Too many submissions. Please try again later.'],
  ['unknown', fallback],
  ['unknown-toString', fallback],
  ['unknown-constructor', fallback],
  ['unknown-proto', fallback],
  ['malformed200-empty', fallback],
  ['malformed200-null', fallback],
  ['malformed200-false', fallback],
  ['malformed200-invalid-json', fallback],
  ['malformed', fallback],
  ['network', fallback],
]

async function expectSubmissionState(page: Page, mode: Exclude<ContactMode, 'busy'>) {
  const result = page.locator('#form-result')
  await expect(result).not.toContainText('提交')
  await expect(submitButton(page)).toBeEnabled()
  if (mode === 'success') {
    await expect(page.getByLabel('Your name')).toHaveValue('')
    await expect(requirementsField(page)).toHaveValue('')
    await expect(page.getByRole('checkbox')).not.toBeChecked()
    await expect(result).not.toContainText('We could not')
    return
  }
  await expect(page.getByLabel('Your name')).toHaveValue(enquiry.name)
  await expect(emailField(page)).toHaveValue(enquiry.email)
  await expect(page.getByLabel('Phone number (optional)')).toHaveValue(enquiry.phone)
  await expect(requirementsField(page)).toHaveValue(enquiry.requirements)
  await expect(page.getByRole('checkbox')).toBeChecked()
  await expect(result).not.toContainText('Thank you')
}

test('localizes busy English contact submission and clears on success', async ({ page }) => {
  let releaseBusy: (() => void) | undefined
  await page.route('**/api/contact', async (route) => {
    await new Promise<void>((resolve) => {
      releaseBusy = resolve
    })
    return route.fulfill({ status: 200, json: { success: true } })
  })
  await page.goto('/en/contact')
  await expect(emailField(page)).toHaveAttribute('required', '')
  await expect(page.getByLabel('Phone number (optional)')).not.toHaveAttribute('required', '')
  await expect(page.getByText('China domestic hotline.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'International enquiries' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'enquiry form below' })).toHaveAttribute(
    'href',
    '#contact-form'
  )
  await fillEnglishEnquiry(page)
  await submitButton(page).click()
  await expect(submitButton(page)).toBeDisabled()
  await expect(submitButton(page)).toHaveAttribute('aria-busy', 'true')
  await expect(submitButton(page)).toHaveText('Submitting…')
  releaseBusy?.()
  await expect(page.locator('#form-result')).toContainText(thankYou)
  await expectSubmissionState(page, 'success')
})

for (const [mode, expected] of responseCases) {
  test(`shows ${mode} English contact response`, async ({ page }) => {
    await page.route('**/api/contact', (route) => serveContact(route, mode))
    await page.goto('/en/contact')
    await fillEnglishEnquiry(page)
    await submitButton(page).click()
    await expect(page.locator('#form-result')).toContainText(expected)
    await expectSubmissionState(page, mode)
  })
}

test('rejects invalid English fields locally and preserves values', async ({ page }) => {
  let requests = 0
  await page.route('**/api/contact', async (route) => {
    requests += 1
    await route.fulfill({ status: 200, json: { success: true } })
  })
  await page.goto('/en/contact')
  await page.getByLabel('Your name').fill(enquiry.name)
  await requirementsField(page).fill(enquiry.requirements)
  await page.getByRole('checkbox').check()
  await submitButton(page).click()
  await expect(page.locator('#form-result')).toContainText('Please enter your email address.')
  await expect(page.getByLabel('Your name')).toHaveValue(enquiry.name)
  await emailField(page).fill(enquiry.email)
  await page.getByLabel('Phone number (optional)').fill('13800138000')
  await submitButton(page).click()
  await expect(page.locator('#form-result')).toContainText(
    'If you add a phone number, include + and the country or region code.'
  )
  await expect(page.getByLabel('Phone number (optional)')).toHaveValue('13800138000')
  expect(requests).toBe(0)
})
