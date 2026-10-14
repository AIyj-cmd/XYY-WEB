import { galleryImageById } from '@/data/about/gallery-catalog'
import { galleryImageOrder, galleryPositionStyle } from '@/data/about/gallery-mosaic'

export const aboutGalleryImages = galleryImageOrder.map((id, index) => ({
  ...galleryImageById[id],
  positionStyle: galleryPositionStyle(index),
}))
