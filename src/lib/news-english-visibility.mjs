import { sanitizeRichText } from './sanitize-core.mjs'

const invisibleOrWhitespace = /[\p{White_Space}\p{Default_Ignorable_Code_Point}]/gu

export function hasVisibleEnglishNewsText(value) {
  return typeof value === 'string' && value.replace(invisibleOrWhitespace, '').length > 0
}

export function hasEnglishNewsRawInput(value) {
  return typeof value === 'string' && value.length > 0
}

export function sanitizedEnglishNewsContent(content) {
  if (typeof content !== 'string') return null
  const sanitized = sanitizeRichText(content)
  const visible = sanitized.replace(/<[^>]*>/g, ' ').replace(/&(nbsp|#0*160|#x0*a0);/gi, ' ')
  return hasVisibleEnglishNewsText(visible) || /<img\b[^>]*\bsrc=/i.test(sanitized)
    ? sanitized
    : null
}
