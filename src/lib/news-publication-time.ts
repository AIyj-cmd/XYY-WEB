const SHANGHAI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000
const NEWS_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})([T ])(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(?:(Z)|([+-])(\d{2}):(\d{2}))?$/i

type ParsedNewsTimestamp = { timestamp: number; hasOffset: boolean; usesIsoSeparator: boolean }

function parseTimestamp(value: unknown): ParsedNewsTimestamp | null {
  if (typeof value !== 'string') return null
  const match = NEWS_TIMESTAMP.exec(value)
  if (!match) return null
  const [
    ,
    yearText,
    monthText,
    dayText,
    separator,
    hourText,
    minuteText,
    secondText = '0',
    fraction = '',
    zulu,
    offsetSign,
    offsetHoursText,
    offsetMinutesText,
  ] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const second = Number(secondText)
  const millisecond = Number(fraction.padEnd(3, '0'))
  const wallTimestamp = Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
  const wallDate = new Date(wallTimestamp)
  if (
    wallDate.getUTCFullYear() !== year ||
    wallDate.getUTCMonth() !== month - 1 ||
    wallDate.getUTCDate() !== day ||
    wallDate.getUTCHours() !== hour ||
    wallDate.getUTCMinutes() !== minute ||
    wallDate.getUTCSeconds() !== second
  ) {
    return null
  }
  if (!zulu && !offsetSign) {
    return {
      timestamp: wallTimestamp - SHANGHAI_UTC_OFFSET_MS,
      hasOffset: false,
      usesIsoSeparator: separator === 'T',
    }
  }
  if (zulu)
    return { timestamp: wallTimestamp, hasOffset: true, usesIsoSeparator: separator === 'T' }

  const offsetHours = Number(offsetHoursText)
  const offsetMinutes = Number(offsetMinutesText)
  if (offsetHours > 14 || offsetMinutes > 59 || (offsetHours === 14 && offsetMinutes !== 0)) {
    return null
  }
  const offset = (offsetHours * 60 + offsetMinutes) * 60 * 1000
  return {
    timestamp: wallTimestamp + (offsetSign === '+' ? -offset : offset),
    hasOffset: true,
    usesIsoSeparator: separator === 'T',
  }
}

/**
 * Directus timestamp columns normally return an offset, but legacy Oracle
 * adapters can return a bare local datetime. Bare values are CMS editorial
 * time in Asia/Shanghai; interpreting them as the host timezone hides a
 * newly published article for eight hours on UTC servers.
 */
export function parseNewsPublicationTime(value: unknown): number | null {
  return parseTimestamp(value)?.timestamp ?? null
}

export function normalizeNewsPublishTimestamp(value: unknown): string | null {
  const parsed = parseTimestamp(value)
  return parsed?.hasOffset && parsed.usesIsoSeparator
    ? new Date(parsed.timestamp).toISOString()
    : null
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
