export interface HomepageStat {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort: number
  value: string
  label: string
  unit: string
  detail: string
}

export interface Service {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort: number
  slug: string
  icon: string
  name: string
  subtitle: string
  description: string
  features: string[]
}

export interface Warehouse {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort: number
  name: string
  city: string
  since: string
  address: string
  park: string
  rent: string
  height: string
  highlight: string
}

export interface Case {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort?: number
  category: string
  label: string
  metrics: string
  details: string
  tags: string[]
  img: string
}

export interface NewsArticle {
  id: number
  status?: 'published' | 'draft' | 'archived'
  title: string
  slug: string
  summary: string
  content?: string
  cover_image?: string
  category: string
  published_at: string
  date_created?: string
  date_updated?: string | null
}

export type DirectusSchema = {
  homepage_stats: HomepageStat[]
  services: Service[]
  warehouses: Warehouse[]
  news: NewsArticle[]
  cases: Case[]
}

export type DirectusCollection = keyof DirectusSchema
