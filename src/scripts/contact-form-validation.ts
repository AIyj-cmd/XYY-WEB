import type { SiteLocale } from '@/i18n/routes'
import { englishContactClientValidation } from '@/lib/contact/client-copy'
import {
  CONTACT_FIELD_MAX_LENGTHS,
  isValidContactEmail,
  isValidDomesticContactPhone,
  isValidInternationalContactPhone,
  isWithinContactFieldLength,
} from '@/lib/contact/validation'

export const CONTACT_FORM_FIELDS = ['name', 'phone', 'email', 'message', 'privacyConsent'] as const

export type ContactFormField = (typeof CONTACT_FORM_FIELDS)[number]

export type ContactFormValidationIssue = {
  field: ContactFormField
  message: string
}

const copy = {
  'zh-CN': {
    missingName: '请填写您的姓名。',
    missingEmail: '请输入有效的邮箱地址。',
    invalidPhone: '请填写有效的手机号或座机号。',
    invalidEmail: '请输入有效的邮箱地址。',
    missingMessage: '请填写需求描述。',
    missingPrivacy: '请先同意个人信息使用说明。',
  },
  en: {
    missingName: 'Please enter your name.',
    missingEmail: englishContactClientValidation.missingEmail,
    invalidEmail: englishContactClientValidation.invalidEmail,
    invalidPhone: englishContactClientValidation.invalidPhone,
    missingMessage: 'Please describe your requirements.',
    missingPrivacy: 'Please agree to the Privacy Notice before submitting.',
  },
} as const

const value = (formData: FormData, name: string) => {
  const item = formData.get(name)
  return typeof item === 'string' ? item : ''
}

export function isContactFormField(value: unknown): value is ContactFormField {
  return typeof value === 'string' && (CONTACT_FORM_FIELDS as readonly string[]).includes(value)
}

export function validateContactForm(
  formData: FormData,
  locale: SiteLocale
): ContactFormValidationIssue | null {
  const english = locale === 'en'
  const messages = copy[locale]
  const name = value(formData, 'name')
  const phone = value(formData, 'phone')
  const email = value(formData, 'email')
  const message = value(formData, 'message')
  const privacyConsent = value(formData, 'privacyConsent')

  if (!name.trim()) return { field: 'name', message: messages.missingName }
  if (!isWithinContactFieldLength(phone, CONTACT_FIELD_MAX_LENGTHS.phone))
    return { field: 'phone', message: messages.invalidPhone }
  if (!isWithinContactFieldLength(email, CONTACT_FIELD_MAX_LENGTHS.email))
    return { field: 'email', message: messages.invalidEmail }

  if (english) {
    if (!email.trim()) return { field: 'email', message: messages.missingEmail }
    if (!isValidContactEmail(email.trim()))
      return { field: 'email', message: messages.invalidEmail }
    if (phone.trim() && !isValidInternationalContactPhone(phone.trim()))
      return { field: 'phone', message: messages.invalidPhone }
  } else {
    if (!phone.trim() || !isValidDomesticContactPhone(phone.trim()))
      return { field: 'phone', message: messages.invalidPhone }
    if (email.trim() && !isValidContactEmail(email.trim()))
      return { field: 'email', message: messages.invalidEmail }
  }

  if (!message.trim()) return { field: 'message', message: messages.missingMessage }
  if (privacyConsent !== 'on' && privacyConsent !== 'true')
    return { field: 'privacyConsent', message: messages.missingPrivacy }

  return null
}
