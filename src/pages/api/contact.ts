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
      return contactJson({ error: '提交内容过大，请精简后再试', code: 'body_too_large' }, 413)
    }

    const mediaType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
    if (mediaType !== 'application/json') {
      return contactJson({ error: '请求格式不正确', code: 'unsupported_content_type' }, 415)
    }

    if (isContactRateLimited(getContactRequesterId(request, clientAddress))) {
      return contactJson({ error: '提交过于频繁，请稍后再试', code: 'rate_limited' }, 429)
    }

    const parsed = await readContactJson(request)
    if (parsed.error) return parsed.error

    const validated = validateContactBody(parsed.body)
    if ('honeypot' in validated) return contactJson({ success: true })
    if ('error' in validated)
      return contactJson({ error: validated.error, code: 'validation_failed' }, 400)

    const stored = await storeContactLead(validated.lead)
    if ('error' in stored)
      return contactJson({ error: stored.error, code: 'storage_unavailable' }, 503)
    return contactJson({ success: true })
  } catch {
    return contactJson({ error: '服务器错误，请稍后重试', code: 'internal_error' }, 500)
  }
}
