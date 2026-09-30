export interface ContactLead {
  name: string
  phone: string
  company: string | null
  email: string | null
  service: string | null
  message: string
}

export const CONTACT_FIELD_MAX_LENGTHS = { phone: 40, email: 120 } as const

const clean = (value: unknown, maxLength = 500) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

const rawString = (value: unknown) => (typeof value === 'string' ? value : '')

export function isWithinContactFieldLength(value: string, maxLength: number) {
  return value.length <= maxLength
}

export function isValidContactEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidDomesticContactPhone(phone: string) {
  const normalized = phone.replace(/\s|-/g, '')
  return /^1[3-9]\d{9}$|^\d{3,4}-?\d{7,8}$/.test(normalized)
}

export function isValidInternationalContactPhone(phone: string) {
  const normalized = phone.replace(/[\s()-]/g, '')
  return /^\+[1-9]\d{6,14}$/.test(normalized)
}

export function maskContactPhone(phone: string) {
  return phone.length > 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '***'
}

export function validateContactBody(body: Record<string, unknown>) {
  if (clean(body.website, 200)) return { honeypot: true as const }

  const name = clean(body.name, 80)
  const rawPhone = rawString(body.phone)
  const rawEmail = rawString(body.email)
  const phone = clean(rawPhone, CONTACT_FIELD_MAX_LENGTHS.phone)
  const company = clean(body.company, 120)
  const email = clean(rawEmail, CONTACT_FIELD_MAX_LENGTHS.email)
  const service = clean(body.service, 80)
  const message = clean(body.message, 1200)
  const privacyConsent = clean(body.privacyConsent, 10)
  const isEnglish = clean(body.locale, 10) === 'en'

  if (!name || !message || (!isEnglish && !phone)) {
    return { error: '请填写姓名、电话和需求描述' }
  }
  if (privacyConsent !== 'on' && privacyConsent !== 'true') {
    return { error: '请先同意个人信息使用说明' }
  }

  if (isEnglish) {
    if (!isWithinContactFieldLength(rawEmail, CONTACT_FIELD_MAX_LENGTHS.email)) {
      return { error: '邮箱长度不能超过120个字符' }
    }
    if (!isWithinContactFieldLength(rawPhone, CONTACT_FIELD_MAX_LENGTHS.phone)) {
      return { error: '国际电话号码长度不能超过40个字符' }
    }
    if (!email || !isValidContactEmail(email)) return { error: '请输入有效的邮箱地址' }
    if (phone && !isValidInternationalContactPhone(phone)) {
      return { error: '请输入含国家/地区代码的有效国际电话号码' }
    }
  } else {
    if (!isValidDomesticContactPhone(phone)) return { error: '请输入有效的手机号或座机号' }
    if (email && !isValidContactEmail(email)) return { error: '请输入有效的邮箱地址' }
  }

  const lead: ContactLead = {
    name,
    phone,
    company: company || null,
    email: email || null,
    service: service || null,
    message,
  }
  return { lead }
}
