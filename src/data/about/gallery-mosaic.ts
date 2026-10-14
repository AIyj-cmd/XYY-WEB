import { galleryCatalog, type GalleryImageId } from '@/data/about/gallery-catalog'
import { galleryWordmarkPositions } from '@/data/about/gallery-wordmark'

const preferredOrder: GalleryImageId[] = [
  'gallery-128',
  'gallery-144',
  'gallery-093',
  'gallery-037',
  'gallery-140',
  'gallery-129',
  'gallery-012',
  'gallery-021',
  'gallery-022',
  'gallery-141',
  'gallery-145',
  'gallery-023',
  'gallery-025',
  'gallery-026',
  'gallery-142',
  'gallery-146',
  'gallery-027',
  'gallery-038',
  'gallery-039',
  'gallery-143',
  'gallery-126',
  'gallery-040',
  'gallery-041',
  'gallery-042',
  'gallery-134',
  'gallery-127',
  'gallery-043',
  'gallery-044',
  'gallery-045',
  'gallery-135',
  'gallery-132',
  'gallery-046',
  'gallery-048',
  'gallery-063',
  'gallery-136',
  'gallery-086',
  'gallery-064',
  'gallery-066',
  'gallery-067',
  'gallery-137',
  'gallery-110',
  'gallery-071',
  'gallery-075',
  'gallery-076',
  'gallery-138',
  'gallery-083',
  'gallery-077',
  'gallery-079',
  'gallery-080',
  'gallery-139',
  'gallery-107',
  'gallery-085',
  'gallery-092',
  'gallery-097',
  'gallery-153',
  'gallery-087',
  'gallery-101',
  'gallery-102',
  'gallery-103',
  'gallery-148',
  'gallery-109',
  'gallery-105',
  'gallery-106',
  'gallery-111',
  'gallery-011',
  'gallery-117',
  'gallery-115',
  'gallery-118',
  'gallery-119',
  'gallery-017',
  'gallery-130',
  'gallery-120',
  'gallery-121',
  'gallery-122',
  'gallery-018',
  'gallery-131',
  'gallery-123',
  'gallery-133',
  'gallery-147',
  'gallery-020',
  'gallery-156',
  'gallery-035',
]

// Preferences only affect order; every image in the full catalog is always included.
const preferredPositions = new Map(preferredOrder.map((id, index) => [id, index]))
export const galleryImageOrder = [...galleryCatalog]
  .sort(
    (a, b) =>
      (preferredPositions.get(a.id) ?? preferredOrder.length) -
      (preferredPositions.get(b.id) ?? preferredOrder.length)
  )
  .map((image) => image.id)
// Every original keeps its order; only its SSR position changes between breakpoints.
const positions = galleryWordmarkPositions(galleryImageOrder.length)

export function galleryPositionStyle(index: number): string {
  return Object.entries(positions[index])
    .map(
      ([name, { column, row, width, height }]) =>
        `--gallery-column-${name}: ${column + 1} / span ${width};` +
        `--gallery-row-${name}: ${row + 1} / span ${height};`
    )
    .join(' ')
}
