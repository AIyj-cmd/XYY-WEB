import type { APIRoute } from 'astro'

import { contactJson, MAX_CONTACT_BODY_BYTES, readContactJson } from '@/lib/contact/http'
import {
  getContactRequesterId,
  isContactRateLimited,
  resetContactRateLimitForTests,
} from '@/lib/contact/rate-limit'
import { storeContactLead } from '@/lib/contact/storage'
import { validateContactBody } from '@/lib/contact/validation'

export { resetContactRateLimitForTests as __resetContactRateLimitForTests }

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_CONTACT_BODY_BYTES) {
      return contactJson({ error: '提交内容过大，请精简后再试' }, 413)
    }

    const contentType = request.headers.get('content-type') || ''
    if (contentType && !contentType.includes('application/json')) {
      return contactJson({ error: '请求格式不正确' }, 415)
    }

    if (isContactRateLimited(getContactRequesterId(request, clientAddress))) {
      return contactJson({ error: '提交过于频繁，请稍后再试' }, 429)
    }

    const parsed = await readContactJson(request)
    if (parsed.error) return parsed.error

    const validated = validateContactBody(parsed.body)
    if ('honeypot' in validated) return contactJson({ success: true })
    if ('error' in validated) return contactJson({ error: validated.error }, 400)

    const stored = await storeContactLead(validated.lead)
    if ('error' in stored) return contactJson({ error: stored.error }, 503)
    return contactJson({ success: true })
  } catch {
    return contactJson({ error: '服务器错误，请稍后重试' }, 500)
  }
}
