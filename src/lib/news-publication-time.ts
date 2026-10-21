import {
  normalizeNewsPublishTimestamp as normalize,
  parseNewsPublicationTime as parse,
} from './news-publication-time-core.mjs'

/**
 * Directus timestamp columns normally return an offset, but legacy adapters
 * can return a bare local datetime. Bare values are CMS editorial
 * time in Asia/Shanghai; interpreting them as the host timezone hides a
 * newly published article for eight hours on UTC servers.
 */
export function parseNewsPublicationTime(value: unknown): number | null {
  return parse(value)
}

export function normalizeNewsPublishTimestamp(value: unknown): string | null {
  return normalize(value)
}

export function isPublishedAtOrBeforeNow(value: unknown, now = Date.now()) {
  const publicationTime = parseNewsPublicationTime(value)
  return publicationTime !== null && publicationTime <= now
}

export function paginateNews<T>(items: T[], limit: number, page: number) {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(page) || page < 1) return []
  const offset = (page - 1) * limit
  return items.slice(offset, offset + limit)
}
