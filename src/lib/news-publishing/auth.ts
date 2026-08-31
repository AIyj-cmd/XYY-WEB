import { createHash, timingSafeEqual } from 'node:crypto'

export const MIN_NEWS_PUBLISH_TOKEN_BYTES = 32

function byteLength(value: string) {
  return new TextEncoder().encode(value).byteLength
}

function digest(value: string) {
  return createHash('sha256').update(value).digest()
}

export function getConfiguredServerToken(rawToken: string | undefined) {
  const token = rawToken?.trim()
  return token && byteLength(token) >= MIN_NEWS_PUBLISH_TOKEN_BYTES ? token : null
}

export const getConfiguredNewsPublishToken = getConfiguredServerToken

export function areDistinctServerTokens(tokens: Array<string | null>) {
  return tokens.every((token) => token !== null) && new Set(tokens).size === tokens.length
}

export function hasValidNewsPublishAuthorization(request: Request, expectedToken: string) {
  const authorization = request.headers.get('authorization')
  const match = authorization?.match(/^Bearer ([^\s]+)$/)
  if (!match) return false
  return timingSafeEqual(digest(match[1]), digest(expectedToken))
}
