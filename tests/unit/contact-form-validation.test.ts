import { describe, expect, it } from 'vitest'

import { validateContactForm } from '@/scripts/contact-form-validation'

const data = (values: Record<string, string>) => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) formData.append(key, value)
  return formData
}

const zh = (overrides: Record<string, string> = {}) =>
  data({
    name: '张三',
    countryOrRegion: '中国',
    phone: '+1 (555) 123-4567',
    email: '',
    message: '想了解鞋服云仓方案',
    privacyConsent: 'on',
    ...overrides,
  })

const en = (overrides: Record<string, string> = {}) =>
  data({
    name: 'Overseas buyer',
    countryOrRegion: 'United Kingdom',
    phone: '',
    email: 'buyer@example.com',
    message: 'Need an apparel fulfilment discussion.',
    privacyConsent: 'on',
    ...overrides,
  })

describe('contact form client validation', () => {
  it.each([
    ['name', { name: '' }],
    ['countryOrRegion', { countryOrRegion: '' }],
    ['phone', { phone: 'abc' }],
    ['phone', { phone: '13800138000' }],
    ['email', { email: 'not-an-email' }],
    ['message', { message: '' }],
    ['privacyConsent', { privacyConsent: '' }],
  ])('reports the first invalid Chinese field: %s', (field, overrides) => {
    expect(validateContactForm(zh(overrides), 'zh-CN')?.field).toBe(field)
  })

  it.each([
    ['email', { email: '' }],
    ['countryOrRegion', { countryOrRegion: '' }],
    ['email', { email: 'not-an-email' }],
    ['phone', { phone: '13800138000' }],
    ['phone', { phone: '+123' }],
    ['message', { message: '' }],
    ['privacyConsent', { privacyConsent: '' }],
  ])('reports the first invalid English field: %s', (field, overrides) => {
    expect(validateContactForm(en(overrides), 'en')?.field).toBe(field)
  })

  it('accepts international phone numbers in both languages and keeps English phone optional', () => {
    expect(validateContactForm(zh({ email: 'buyer@example.com' }), 'zh-CN')).toBeNull()
    expect(validateContactForm(zh({ phone: '+44 (20) 7946-0958' }), 'zh-CN')).toBeNull()
    expect(validateContactForm(en({ phone: '+44 (20) 7946-0958' }), 'en')).toBeNull()
    expect(validateContactForm(en({ phone: '13800138000' }), 'en')?.field).toBe('phone')
  })

  it('rejects overlong raw contact values before trimming', () => {
    expect(validateContactForm(zh({ email: 'a'.repeat(121) + '@x.test' }), 'zh-CN')?.field).toBe(
      'email'
    )
    expect(validateContactForm(zh({ phone: '+1' + '2'.repeat(40) }), 'zh-CN')?.field).toBe('phone')
    expect(validateContactForm(en({ phone: '+1' + '2'.repeat(40) }), 'en')?.field).toBe('phone')
  })

  it.each([
    ['line break', '中国\n香港'],
    ['overlong', 'a'.repeat(81)],
  ])('rejects a %s country or region', (_label, countryOrRegion) => {
    expect(validateContactForm(zh({ countryOrRegion }), 'zh-CN')?.field).toBe('countryOrRegion')
  })

  it('trims Unicode whitespace without changing a valid country or region', () => {
    expect(
      validateContactForm(en({ countryOrRegion: '\u3000United Kingdom\u3000' }), 'en')
    ).toBeNull()
  })

  it.each([
    ['zh-CN', zh({ message: 'x'.repeat(1101) }), 'message'],
    ['en', en({ message: 'x'.repeat(1101) }), 'message'],
  ] as const)('rejects an overlong message in %s', (locale, formData, field) => {
    expect(validateContactForm(formData, locale)?.field).toBe(field)
  })

  it('accepts complete bilingual payloads and exposes only stable field names', () => {
    expect(validateContactForm(zh(), 'zh-CN')).toBeNull()
    expect(validateContactForm(en(), 'en')).toBeNull()
    expect(validateContactForm(en({ name: '' }), 'en')?.field).toMatch(
      /^(name|countryOrRegion|phone|email|message|privacyConsent)$/
    )
  })
})
