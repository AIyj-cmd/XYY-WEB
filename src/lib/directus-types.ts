export interface HomepageStat {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort: number
  value: string
  label: string
  unit: string
  detail: string
}

export interface HomepageContentRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  key: string
  stats: Array<Omit<HomepageStat, 'id' | 'sort' | 'status'>>
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
  slug?: string
  category: string
  label: string
  name?: string | null
  full_name?: string | null
  accent?: string | null
  case_description?: string | null
  stats?: Array<{ label: string; value: string; unit: string }> | null
  metrics: string
  details: string
  tags: string[]
  img: string
  image_file?: string | null
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

export interface ContactLeadRecord {
  id: number
  status: 'new' | 'contacted' | 'closed' | 'invalid'
  name: string
  phone: string
  company?: string | null
  email?: string | null
  service?: string | null
  message: string
  source: 'website'
  date_created?: string
  date_updated?: string | null
}

export interface FaqRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  page_key: string
  sort: number
  question: string
  answer: string
  faq_page?: number | null
  date_created?: string
  date_updated?: string | null
}

export interface FaqPageRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort: number
  key: string
  name: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface CaseDetailRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  label: string
  slug: string
  name: string
  full_name: string
  accent: string
  description: string
}

export interface CaseStatRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  case_slug: string
  sort: number
  label: string
  value: string
  unit: string
}

export interface PublicationRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort: number
  issue: number
  title: string
  season: string
  summary: string
  cover: string
  pdf: string
  cover_file?: string | null
  pdf_file?: string | null
  date: string
  is_latest: boolean
}

export interface ServicePageRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  slug: string
  title: string
  description: string
  breadcrumb_label: string
  eyebrow: string
  h1: string
  h1sub: string
  hero_desc: string
  img_src: string
  hero_image?: string | null
  img_alt: string
  content_desc: string
  features_label: string
  stats?: Array<{ stat: string; label: string; sub: string }> | null
  features?: Array<{ title: string; desc: string }> | null
}

export interface ServiceStatRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  service_slug: string
  sort: number
  stat: string
  label: string
  sub: string
}

export interface ServiceFeatureRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  service_slug: string
  sort: number
  title: string
  desc: string
}

export interface AboutContentRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  key: string
  overview: string
  hero_description: string
}

export interface AboutHistoryRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort: number
  year: string
  subtitle: string
  text: string
  img: string
  image_file?: string | null
}

export interface AboutHonorRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  sort: number
  title: string
  image: string
  image_file?: string | null
}

export interface SiteSettingsRecord {
  id: number
  status?: 'published' | 'draft' | 'archived'
  key: string
  phone: string
  headquarters_label: string
  headquarters_address: string
  icp: string
  footer_description: string
}

export type DirectusSchema = {
  homepage_content: HomepageContentRecord[]
  homepage_stats: HomepageStat[]
  services: Service[]
  warehouses: Warehouse[]
  news: NewsArticle[]
  cases: Case[]
  faqs: FaqRecord[]
  faq_pages: FaqPageRecord[]
  case_details: CaseDetailRecord[]
  case_stats: CaseStatRecord[]
  publications: PublicationRecord[]
  service_pages: ServicePageRecord[]
  service_stats: ServiceStatRecord[]
  service_features: ServiceFeatureRecord[]
  about_content: AboutContentRecord[]
  about_history: AboutHistoryRecord[]
  about_honors: AboutHonorRecord[]
  site_settings: SiteSettingsRecord[]
  contact_leads: ContactLeadRecord[]
}

export type DirectusCollection = keyof DirectusSchema
