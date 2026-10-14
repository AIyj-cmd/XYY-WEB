export type GalleryImageScene =
  | 'activity'
  | 'archive'
  | 'awards'
  | 'building'
  | 'cake'
  | 'event-speaker'
  | 'food'
  | 'garment-care'
  | 'garments'
  | 'lounge'
  | 'meal'
  | 'meeting'
  | 'outdoor-team'
  | 'outdoors'
  | 'sewing'
  | 'team'
  | 'team-work'
  | 'training'
  | 'warehouse'
  | 'warehouse-team'
  | 'warehouse-work'
  | 'workshop'
  | 'workshop-training'

export interface GalleryImage {
  id: string
  src: string
  width: number
  height: number
  scene: GalleryImageScene
}

export const gallery = (
  id: number,
  width: number,
  height: number,
  scene: GalleryImageScene
): GalleryImage => ({
  id: `gallery-${String(id).padStart(3, '0')}`,
  src: `/about/gallery/gallery-${String(id).padStart(3, '0')}.webp`,
  width,
  height,
  scene,
})
