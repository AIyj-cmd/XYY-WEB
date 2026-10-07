import { CLAIM_TEXT } from '@/lib/claims'

const CLAIM_PATTERN = /\{\{([A-Za-z][A-Za-z0-9]*)\}\}/g

export const resolveServicePageClaims = <T>(value: T): T => {
  if (typeof value === 'string')
    return value.replace(
      CLAIM_PATTERN,
      (_match, key) => CLAIM_TEXT[key as keyof typeof CLAIM_TEXT] ?? _match
    ) as T
  if (Array.isArray(value)) return value.map(resolveServicePageClaims) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveServicePageClaims(item)])
    ) as T
  return value
}
