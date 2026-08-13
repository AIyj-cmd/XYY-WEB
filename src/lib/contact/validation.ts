export interface ContactLead {
  name: string
  phone: string
  company: string | null
  email: string | null
  service: string | null
  message: string
}

const clean = (value: unknown, maxLength = 500) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

export function maskContactPhone(phone: string) {
  return phone.length > 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '***'
}

export function validateContactBody(body: Record<string, unknown>) {
  if (clean(body.website, 200)) return { honeypot: true as const }

  const name = clean(body.name, 80)
  const phone = clean(body.phone, 40)
  const company = clean(body.company, 120)
  const email = clean(body.email, 120)
  const service = clean(body.service, 80)
  const message = clean(body.message, 1200)
  const privacyConsent = clean(body.privacyConsent, 10)

  if (!name || !phone || !message) return { error: '请填写姓名、电话和需求描述' }
  if (privacyConsent !== 'on' && privacyConsent !== 'true') {
    return { error: '请先同意个人信息使用说明' }
  }

  const phoneClean = phone.replace(/\s|-/g, '')
  if (!/^1[3-9]\d{9}$|^\d{3,4}-?\d{7,8}$/.test(phoneClean)) {
    return { error: '请输入有效的手机号或座机号' }
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: '请输入有效的邮箱地址' }
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
