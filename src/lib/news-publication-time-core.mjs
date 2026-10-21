const SHANGHAI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000
const NEWS_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})([T ])(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(?:(Z)|([+-])(\d{2}):(\d{2}))?$/i

function parseTimestamp(value) {
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
  const year = Number(yearText),
    month = Number(monthText),
    day = Number(dayText)
  const hour = Number(hourText),
    minute = Number(minuteText),
    second = Number(secondText)
  const wallTimestamp = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    Number(fraction.padEnd(3, '0'))
  )
  const wallDate = new Date(wallTimestamp)
  if (
    wallDate.getUTCFullYear() !== year ||
    wallDate.getUTCMonth() !== month - 1 ||
    wallDate.getUTCDate() !== day ||
    wallDate.getUTCHours() !== hour ||
    wallDate.getUTCMinutes() !== minute ||
    wallDate.getUTCSeconds() !== second
  )
    return null
  if (!zulu && !offsetSign)
    return {
      timestamp: wallTimestamp - SHANGHAI_UTC_OFFSET_MS,
      hasOffset: false,
      usesIsoSeparator: separator === 'T',
    }
  if (zulu)
    return { timestamp: wallTimestamp, hasOffset: true, usesIsoSeparator: separator === 'T' }
  const offsetHours = Number(offsetHoursText),
    offsetMinutes = Number(offsetMinutesText)
  if (offsetHours > 14 || offsetMinutes > 59 || (offsetHours === 14 && offsetMinutes !== 0))
    return null
  const offset = (offsetHours * 60 + offsetMinutes) * 60 * 1000
  return {
    timestamp: wallTimestamp + (offsetSign === '+' ? -offset : offset),
    hasOffset: true,
    usesIsoSeparator: separator === 'T',
  }
}

export const parseNewsPublicationTime = (value) => parseTimestamp(value)?.timestamp ?? null
export function normalizeNewsPublishTimestamp(value) {
  const parsed = parseTimestamp(value)
  return parsed?.hasOffset && parsed.usesIsoSeparator
    ? new Date(parsed.timestamp).toISOString()
    : null
}
