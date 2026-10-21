export interface EnglishNewsFields {
  title_en?: string | null
  summary_en?: string | null
  content_en?: string | null
  english_status?: 'published' | 'draft' | 'archived' | null
  english_published_at?: string | null
}

export interface EnglishNewsRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  title: string
  slug: string
  summary: string
  content?: string
  cover_image?: string | null
  category: string
  published_at?: string | null
  legacy_news_id?: number | null
  date_created?: string
  date_updated?: string | null
}
