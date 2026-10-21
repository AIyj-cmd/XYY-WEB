import { sanitizeRichText as sanitize } from './sanitize-core.mjs'

export function sanitizeRichText(input: string) {
  return sanitize(input)
}
