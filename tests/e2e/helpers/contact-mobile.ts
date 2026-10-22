import { expect, type Page } from '@playwright/test'

export type ContactLocale = 'zh' | 'en'

export const contactValues = {
  zh: {
    name: '测试品牌',
    countryOrRegion: '中国',
    phone: '+1 (555) 123-4567',
    email: 'buyer@example.com',
    message: '想了解鞋服云仓方案',
    company: '测试公司',
  },
  en: {
    name: 'QA apparel brand',
    countryOrRegion: 'United Kingdom',
    phone: '+1 (555) 123-4567',
    email: 'buyer@example.com',
    message: 'Need an apparel fulfilment discussion.',
    company: 'Example Apparel',
  },
} as const

export const form = (page: Page) => page.locator('#contact-form')
export const result = (page: Page) => page.locator('#form-result')
export const submit = (page: Page) => form(page).locator('button[type="submit"]')

const field = (
  page: Page,
  id: 'name' | 'countryOrRegion' | 'phone' | 'email' | 'message' | 'company'
) => page.locator(`#contact-form #${id}`)

export async function fillRequired(page: Page, locale: ContactLocale) {
  const values = contactValues[locale]
  await field(page, 'name').fill(values.name)
  await field(page, 'countryOrRegion').fill(values.countryOrRegion)
  if (locale === 'zh') await field(page, 'phone').fill(values.phone)
  else await field(page, 'email').fill(values.email)
  await page.locator('#contact-form #service').selectOption('鞋服云仓')
  await field(page, 'message').fill(values.message)
  await page.getByRole('checkbox').check()
}

export async function fillOptional(page: Page, locale: ContactLocale) {
  const values = contactValues[locale]
  await field(page, 'company').fill(values.company)
  await field(page, locale === 'zh' ? 'email' : 'phone').fill(
    locale === 'zh' ? values.email : values.phone
  )
}

export async function expectPreserved(page: Page, locale: ContactLocale) {
  const values = contactValues[locale]
  await expect(field(page, 'name')).toHaveValue(values.name)
  await expect(field(page, 'countryOrRegion')).toHaveValue(values.countryOrRegion)
  await expect(field(page, 'message')).toHaveValue(values.message)
  await expect(page.getByRole('checkbox')).toBeChecked()
  await expect(page.locator('#contact-form #service')).toHaveValue('鞋服云仓')
  await expect(field(page, locale === 'zh' ? 'phone' : 'email')).toHaveValue(
    locale === 'zh' ? values.phone : values.email
  )
  await expect(field(page, locale === 'zh' ? 'email' : 'phone')).toHaveValue(
    locale === 'zh' ? values.email : values.phone
  )
  await expect(field(page, 'company')).toHaveValue(values.company)
}

export async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  )
}

export async function eligibleVisibleFields(page: Page) {
  return page
    .locator(
      '#contact-form input:not([type="hidden"]):not([type="checkbox"]):visible, #contact-form select:visible, #contact-form textarea:visible'
    )
    .count()
}
