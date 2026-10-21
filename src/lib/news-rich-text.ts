import { getDirectusPublicUrl } from './directus-client'
import parseSrcset from 'parse-srcset'
import { sanitizeRichText } from './sanitize-core.mjs'
import { SITE_URL } from './site-config'
import { DEFAULT_PUBLIC_SITE_ORIGIN } from '../../config/public-site.mjs'

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'
const imagePath = new RegExp(`^${UUID}(?:\\.(?:avif|gif|jpe?g|png|webp))?$`, 'i')

export type NewsRichTextOrigins = {
  siteOrigin?: string
  directusPublicUrl?: string
}

type ImageSources = { src?: string; srcset?: string }

function bases(origins: NewsRichTextOrigins = {}) {
  const unique = new Map<string, { origin: string; prefix: string }>()
  for (const value of [
    origins.siteOrigin ?? SITE_URL,
    origins.directusPublicUrl ?? getDirectusPublicUrl(),
    DEFAULT_PUBLIC_SITE_ORIGIN,
  ]) {
    const url = new URL(value)
    const base = { origin: url.origin, prefix: `${url.pathname.replace(/\/+$/, '')}/assets/` }
    unique.set(`${base.origin}${base.prefix}`, base)
  }
  return [...unique.values()]
}

export function directusAssetIdFromNewsImageSource(source: unknown, origins?: NewsRichTextOrigins) {
  if (typeof source !== 'string' || !source) return null
  const trimmed = source.trim()
  if (
    trimmed.startsWith('//') ||
    (!/^[a-z][a-z\d+.-]*:/i.test(trimmed) && !trimmed.startsWith('/assets/'))
  )
    return null

  let url: URL
  try {
    url = new URL(trimmed, origins?.siteOrigin ?? SITE_URL)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null

  for (const base of bases(origins)) {
    if (url.origin !== base.origin || !url.pathname.startsWith(base.prefix)) continue
    const match = url.pathname.slice(base.prefix.length).match(imagePath)
    if (match) return match[0].slice(0, 36).toLowerCase()
  }
  return null
}

function selectedDirectusImageAssetId(image: ImageSources, origins?: NewsRichTextOrigins) {
  const sourceId = directusAssetIdFromNewsImageSource(image.src, origins)
  if (sourceId) return sourceId
  if (!image.srcset) return null
  try {
    for (const candidate of parseSrcset(image.srcset)) {
      const candidateId = directusAssetIdFromNewsImageSource(candidate.url, origins)
      if (candidateId) return candidateId
    }
  } catch {
    return null
  }
  return null
}

export function collectNewsRichTextAssetIds(content: unknown, origins?: NewsRichTextOrigins) {
  const ids = new Set<string>()
  if (typeof content !== 'string') return ids
  sanitizeRichText(content, {
    onImage: (image: ImageSources) => {
      const id = selectedDirectusImageAssetId(image, origins)
      if (id) ids.add(id)
    },
  })
  return ids
}

export function rewriteNewsRichTextAssets(content: unknown, origins?: NewsRichTextOrigins) {
  if (typeof content !== 'string') {
    throw new TypeError('news rich text content must be a string')
  }
  return sanitizeRichText(content, {
    rewriteImage: (image: ImageSources) => {
      const id = selectedDirectusImageAssetId(image, origins)
      return id ? `/api/cms-assets/${id}` : undefined
    },
  })
}
