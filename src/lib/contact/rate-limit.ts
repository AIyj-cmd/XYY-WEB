const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 5
const MAX_BUCKETS = 1_000

type Bucket = { count: number; resetAt: number }
type ExpiryEntry = { key: string; resetAt: number }

const buckets = new Map<string, Bucket>()
const expiryQueue: ExpiryEntry[] = []

function pushExpiry(entry: ExpiryEntry) {
  expiryQueue.push(entry)
  let index = expiryQueue.length - 1
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2)
    if (expiryQueue[parent].resetAt <= entry.resetAt) break
    expiryQueue[index] = expiryQueue[parent]
    index = parent
  }
  expiryQueue[index] = entry
}

function popExpiry() {
  const first = expiryQueue[0]
  const last = expiryQueue.pop()
  if (!first || !last || expiryQueue.length === 0) return first

  let index = 0
  while (true) {
    const left = index * 2 + 1
    const right = left + 1
    let child = left
    if (right < expiryQueue.length && expiryQueue[right].resetAt < expiryQueue[left].resetAt) {
      child = right
    }
    if (child >= expiryQueue.length || expiryQueue[child].resetAt >= last.resetAt) break
    expiryQueue[index] = expiryQueue[child]
    index = child
  }
  expiryQueue[index] = last
  return first
}

function discardExpiredBuckets(now: number) {
  while (expiryQueue[0]?.resetAt <= now) {
    const entry = popExpiry()
    if (entry && buckets.get(entry.key)?.resetAt === entry.resetAt) buckets.delete(entry.key)
  }
}

function evictEarliestBucket() {
  while (expiryQueue.length) {
    const entry = popExpiry()
    if (entry && buckets.get(entry.key)?.resetAt === entry.resetAt) {
      buckets.delete(entry.key)
      return
    }
  }
}

export function getContactRequesterId(requesterIp?: string) {
  return requesterIp || 'unknown'
}

export function isContactRateLimited(key: string, now = Date.now()) {
  discardExpiredBuckets(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    if (bucket) buckets.delete(key)
    if (buckets.size >= MAX_BUCKETS) evictEarliestBucket()
    const resetAt = now + WINDOW_MS
    buckets.set(key, { count: 1, resetAt })
    pushExpiry({ key, resetAt })
    return false
  }

  bucket.count += 1
  return bucket.count > MAX_REQUESTS
}

export function resetContactRateLimitForTests() {
  buckets.clear()
  expiryQueue.length = 0
}
