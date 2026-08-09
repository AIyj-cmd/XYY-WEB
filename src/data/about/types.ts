import type { Warehouse } from '@/lib/directus'

export interface AboutHistoryItem {
  year: string
  subtitle: string
  text: string
  img: string
}

export interface AboutCaption {
  start: number
  end: number
  text: string
}

export interface WarehouseGroup {
  city: string
  cfg: { color: string; label: string }
  items: Warehouse[]
}
