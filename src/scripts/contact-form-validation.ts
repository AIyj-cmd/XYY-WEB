import type { SiteLocale } from '@/i18n/routes'
import { englishContactClientValidation } from '@/lib/contact/client-copy'
import {
  CONTACT_FIELD_MAX_LENGTHS,
  isValidContactEmail,
  isValidCountryOrRegion,
  isValidInternationalContactPhone,
  isWithinContactFieldLength,
} from '@/lib/contact/validation'

export const CONTACT_FORM_FIELDS = [
  'name',
  'countryOrRegion',
  'phone',
  'email',
  'message',
  'privacyConsent',
] as const

export type ContactFormField = (typeof CONTACT_FORM_FIELDS)[number]

export type ContactFormValidationIssue = {
  field: ContactFormField
  message: string
}

const copy = {
  'zh-CN': {
    missingName: '请填写您的姓名。',
    missingCountryOrRegion: '请填写国家或地区。',
    invalidCountryOrRegion: '国家或地区应为不超过80个字符的单行文字。',
    missingEmail: '请输入有效的邮箱地址。',
    invalidPhone: '请填写含国家或地区区号的有效国际电话号码。',
    invalidEmail: '请输入有效的邮箱地址。',
    missingMessage: '请填写需求描述。',
    messageTooLong: `需求描述不能超过${CONTACT_FIELD_MAX_LENGTHS.message}个字符。`,
    missingPrivacy: '请先同意个人信息使用说明。',
  },
  en: {
    missingName: 'Please enter your name.',
    missingCountryOrRegion: 'Please enter your country or region.',
    invalidCountryOrRegion: 'Enter a single-line country or region of up to 80 characters.',
    missingEmail: englishContactClientValidation.missingEmail,
    invalidEmail: englishContactClientValidation.invalidEmail,
    invalidPhone: englishContactClientValidation.invalidPhone,
    missingMessage: 'Please describe your requirements.',
    messageTooLong: `Keep your requirements within ${CONTACT_FIELD_MAX_LENGTHS.message} characters.`,
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
  const countryOrRegion = value(formData, 'countryOrRegion')
  const phone = value(formData, 'phone')
  const email = value(formData, 'email')
  const message = value(formData, 'message')
  const privacyConsent = value(formData, 'privacyConsent')

  if (!name.trim()) return { field: 'name', message: messages.missingName }
  if (!countryOrRegion.trim()) {
    return { field: 'countryOrRegion', message: messages.missingCountryOrRegion }
  }
  if (!isValidCountryOrRegion(countryOrRegion)) {
    return { field: 'countryOrRegion', message: messages.invalidCountryOrRegion }
  }
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
    if (!phone.trim() || !isValidInternationalContactPhone(phone.trim()))
      return { field: 'phone', message: messages.invalidPhone }
    if (email.trim() && !isValidContactEmail(email.trim()))
      return { field: 'email', message: messages.invalidEmail }
  }

  if (!message.trim()) return { field: 'message', message: messages.missingMessage }
  if (!isWithinContactFieldLength(message, CONTACT_FIELD_MAX_LENGTHS.message)) {
    return { field: 'message', message: messages.messageTooLong }
  }
  if (privacyConsent !== 'on' && privacyConsent !== 'true')
    return { field: 'privacyConsent', message: messages.missingPrivacy }

  return null
}
