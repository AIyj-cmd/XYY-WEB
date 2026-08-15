import type { DirectusCollection } from '../directus-types'

export type DirectusFailureKind = 'unavailable' | 'unauthorized' | 'invalid'
export type DirectusUnavailableReason = 'network' | 'timeout' | 'server_error'
export type DirectusInvalidReason = 'http_error' | 'invalid_json' | 'missing_data' | 'invalid_data'
export type DirectusFailureReason = DirectusUnavailableReason | DirectusInvalidReason

const FALLBACK_LOG_DEDUPE_MS = 5000
const fallbackLogTimes = new Map<string, number>()

export class DirectusRequestError extends Error {
  readonly kind: DirectusFailureKind
  readonly collection: DirectusCollection
  readonly operation: string
  readonly reason: DirectusFailureReason
  readonly status?: number

  constructor(options: {
    kind: DirectusFailureKind
    collection: DirectusCollection
    operation: string
    reason: DirectusFailureReason
    status?: number
    cause?: unknown
  }) {
    const prefix = options.kind === 'unavailable' ? 'request' : options.kind
    const status = options.status === undefined ? '' : ` status=${options.status}`
    super(
      `[directus:${prefix}] collection=${options.collection} operation=${options.operation} reason=${options.reason}${status}`,
      { cause: options.cause }
    )
    this.name = 'DirectusRequestError'
    this.kind = options.kind
    this.collection = options.collection
    this.operation = options.operation
    this.reason = options.reason
    this.status = options.status
  }
}

function statusFrom(error: unknown) {
  if (!error || typeof error !== 'object') return undefined
  if ('status' in error && typeof error.status === 'number') return error.status
  if ('response' in error && error.response && typeof error.response === 'object') {
    const response = error.response
    if ('status' in response && typeof response.status === 'number') return response.status
  }
  return undefined
}

export function classifyDirectusError(
  error: unknown,
  collection: DirectusCollection,
  operation: string
): DirectusRequestError {
  if (error instanceof DirectusRequestError) return error

  const status = statusFrom(error)
  if (status === 401 || status === 403) {
    return new DirectusRequestError({
      kind: 'unauthorized',
      collection,
      operation,
      reason: 'http_error',
      status,
      cause: error,
    })
  }
  if (status !== undefined && status >= 500 && status <= 599) {
    return new DirectusRequestError({
      kind: 'unavailable',
      collection,
      operation,
      reason: 'server_error',
      status,
      cause: error,
    })
  }
  if (status !== undefined) {
    return new DirectusRequestError({
      kind: 'invalid',
      collection,
      operation,
      reason: 'http_error',
      status,
      cause: error,
    })
  }
  if (error instanceof SyntaxError) {
    return new DirectusRequestError({
      kind: 'invalid',
      collection,
      operation,
      reason: 'invalid_json',
      cause: error,
    })
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new DirectusRequestError({
      kind: 'unavailable',
      collection,
      operation,
      reason: 'timeout',
      cause: error,
    })
  }
  return new DirectusRequestError({
    kind: 'unavailable',
    collection,
    operation,
    reason: 'network',
    cause: error,
  })
}

export function invalidDirectusData(
  collection: DirectusCollection,
  operation: string,
  reason: DirectusInvalidReason,
  cause?: unknown
) {
  return new DirectusRequestError({ kind: 'invalid', collection, operation, reason, cause })
}

export function resetDirectusFallbackLogForTests() {
  fallbackLogTimes.clear()
}

export function fallbackForUnavailable<T>(error: unknown, fallback: T): T {
  if (!(error instanceof DirectusRequestError) || error.kind !== 'unavailable') throw error
  const status = error.status === undefined ? '' : ` status=${error.status}`
  const key = `${error.collection}:${error.operation}:${error.reason}:${error.status ?? ''}`
  const now = Date.now()
  const lastLoggedAt = fallbackLogTimes.get(key)
  if (lastLoggedAt !== undefined && now - lastLoggedAt < FALLBACK_LOG_DEDUPE_MS) return fallback
  fallbackLogTimes.set(key, now)
  console.warn(
    `[directus:fallback] collection=${error.collection} operation=${error.operation} reason=${error.reason}${status}`
  )
  return fallback
}
