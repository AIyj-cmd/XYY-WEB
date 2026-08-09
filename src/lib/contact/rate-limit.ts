const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 5

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function getContactRequesterId(request: Request, clientAddress?: string) {
  const realIp = request.headers.get('x-real-ip')?.trim()
  const forwardedFor = request.headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1)
  return realIp || forwardedFor || clientAddress || 'unknown'
}

export function isContactRateLimited(key: string, now = Date.now()) {
  if (buckets.size > 1000) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(bucketKey)
    }
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  bucket.count += 1
  return bucket.count > MAX_REQUESTS
}

export function resetContactRateLimitForTests() {
  buckets.clear()
}
