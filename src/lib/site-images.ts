import manifest from '@/data/site-images.json'
import { BRAND } from '@/lib/brand'
import type { SiteLocale } from '@/i18n/routes'

type ImageEntry = (typeof manifest.images)[keyof typeof manifest.images]
const images: Record<string, ImageEntry> = manifest.images

/** Only replace reviewed local assets; CMS and external images keep their original URL. */
export function siteImage(source: string, sizes: string) {
  const image = Object.hasOwn(images, source) ? images[source] : undefined
  if (!image) return { src: source }
  return {
    src: image.variants.at(-1)!.src,
    srcset: image.variants.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
    sizes,
    width: image.width,
    height: image.height,
  }
}

export function caseImage(source: string) {
  const image = Object.hasOwn(images, source) ? images[source] : undefined
  if (!image) return { src: source }
  // object-fit: cover also needs enough pixels for the card's fixed height.
  const ratio = image.width / image.height
  return siteImage(
    source,
    `(max-width: 768px) max(calc(100vw - 3rem), ${Math.ceil(448 * ratio)}px), ` +
      `(max-width: 900px) ${Math.ceil(448 * ratio)}px, max(50vw, ${Math.ceil(544 * ratio)}px)`
  )
}

export function shareImage(source: string | undefined, locale: SiteLocale) {
  if (source) return { src: source, width: undefined, height: undefined }
  const card = manifest.shareCards[locale]
  return { src: new URL(card.src, BRAND.url).href, width: card.width, height: card.height }
}
