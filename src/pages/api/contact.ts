import type { APIRoute } from 'astro'

const MAX_BODY_BYTES = 8 * 1024
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5

type RateLimitBucket = { count: number; resetAt: number }

const rateLimitBuckets = new Map<string, RateLimitBucket>()

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function clean(value: unknown, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function maskPhone(phone: string): string {
  return phone.length > 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '***'
}

function getRequesterId(request: Request, clientAddress?: string) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwardedFor || clientAddress || 'unknown'
}

function isRateLimited(key: string) {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  bucket.count += 1
  return bucket.count > RATE_LIMIT_MAX
}

export function __resetContactRateLimitForTests() {
  rateLimitBuckets.clear()
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: '提交内容过大，请精简后再试' }, 413)
    }

    const contentType = request.headers.get('content-type') || ''
    if (contentType && !contentType.includes('application/json')) {
      return json({ error: '请求格式不正确' }, 415)
    }

    if (isRateLimited(getRequesterId(request, clientAddress))) {
      return json({ error: '提交过于频繁，请稍后再试' }, 429)
    }

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return json({ error: '请求内容不正确' }, 400)
    }

    const honeypot = clean(body.website, 200)
    if (honeypot) {
      return json({ success: true })
    }

    const name = clean(body.name, 80)
    const phone = clean(body.phone, 40)
    const company = clean(body.company, 120)
    const email = clean(body.email, 120)
    const service = clean(body.service, 80)
    const message = clean(body.message, 1200)

    if (!name || !phone || !message) {
      return json({ error: '请填写姓名、电话和需求描述' }, 400)
    }

    // Phone format validation
    const phoneClean = phone.replace(/\s|-/g, '')
    if (!/^1[3-9]\d{9}$|^\d{3,4}-?\d{7,8}$/.test(phoneClean)) {
      return json({ error: '请输入有效的手机号或座机号' }, 400)
    }

    // Log to Directus if available
    const directusUrl = import.meta.env.DIRECTUS_URL
    const directusToken = import.meta.env.DIRECTUS_TOKEN

    if (directusUrl && directusToken) {
      try {
        const response = await fetch(`${directusUrl.replace(/\/+$/, '')}/items/contact_leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${directusToken}`,
          },
          body: JSON.stringify({
            name,
            phone,
            company: company || null,
            email: email || null,
            service: service || null,
            message,
            source: 'website',
            status: 'new',
          }),
        })

        if (!response.ok) {
          console.error('[contact] Directus rejected lead:', {
            status: response.status,
            name,
            phone: maskPhone(phone),
            company,
          })
          return json({ error: '提交失败，请稍后重试或直接拨打客服热线' }, 503)
        }
      } catch {
        console.error('[contact] Directus unavailable, lead not saved:', { name, phone: maskPhone(phone), company })
        return json({ error: '提交失败，请稍后重试或直接拨打客服热线' }, 503)
      }
    }

    return json({ success: true })
  } catch {
    return json({ error: '服务器错误，请稍后重试' }, 500)
  }
}
