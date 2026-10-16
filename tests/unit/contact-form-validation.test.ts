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
    phone: '13800138000',
    email: '',
    message: '想了解鞋服云仓方案',
    privacyConsent: 'on',
    ...overrides,
  })

const en = (overrides: Record<string, string> = {}) =>
  data({
    name: 'Overseas buyer',
    phone: '',
    email: 'buyer@example.com',
    message: 'Need an apparel fulfilment discussion.',
    privacyConsent: 'on',
    ...overrides,
  })

describe('contact form client validation', () => {
  it.each([
    ['name', { name: '' }],
    ['phone', { phone: 'abc' }],
    ['email', { email: 'not-an-email' }],
    ['message', { message: '' }],
    ['privacyConsent', { privacyConsent: '' }],
  ])('reports the first invalid Chinese field: %s', (field, overrides) => {
    expect(validateContactForm(zh(overrides), 'zh-CN')?.field).toBe(field)
  })

  it.each([
    ['email', { email: '' }],
    ['email', { email: 'not-an-email' }],
    ['phone', { phone: '13800138000' }],
    ['phone', { phone: '+123' }],
    ['message', { message: '' }],
    ['privacyConsent', { privacyConsent: '' }],
  ])('reports the first invalid English field: %s', (field, overrides) => {
    expect(validateContactForm(en(overrides), 'en')?.field).toBe(field)
  })

  it('allows the optional contact method only when valid for the current language', () => {
    expect(validateContactForm(zh({ email: 'buyer@example.com' }), 'zh-CN')).toBeNull()
    expect(validateContactForm(en({ phone: '+44 (20) 7946-0958' }), 'en')).toBeNull()
    expect(validateContactForm(en({ phone: '13800138000' }), 'en')?.field).toBe('phone')
  })

  it('rejects overlong raw optional values before trimming', () => {
    expect(validateContactForm(zh({ email: 'a'.repeat(121) + '@x.test' }), 'zh-CN')?.field).toBe(
      'email'
    )
    expect(validateContactForm(en({ phone: '+1' + '2'.repeat(40) }), 'en')?.field).toBe('phone')
  })

  it('accepts complete bilingual payloads and exposes only stable field names', () => {
    expect(validateContactForm(zh(), 'zh-CN')).toBeNull()
    expect(validateContactForm(en(), 'en')).toBeNull()
    expect(validateContactForm(en({ name: '' }), 'en')?.field).toMatch(
      /^(name|phone|email|message|privacyConsent)$/
    )
  })
})
