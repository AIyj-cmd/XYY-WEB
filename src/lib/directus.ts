import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'

// ── Types ─────────────────────────────────────────────────────

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

type Schema = {
  homepage_stats: HomepageStat[]
  services: Service[]
  warehouses: Warehouse[]
  news: NewsArticle[]
  cases: Case[]
}

// ── Client ────────────────────────────────────────────────────

import { SITE_URL } from './site-config'

const DEFAULT_DIRECTUS_API_URL = 'http://127.0.0.1:8055'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export function getDirectusApiUrl() {
  return trimTrailingSlash(import.meta.env.DIRECTUS_URL || DEFAULT_DIRECTUS_API_URL)
}

export function getDirectusPublicUrl() {
  return trimTrailingSlash(import.meta.env.PUBLIC_DIRECTUS_URL || `${SITE_URL}/cms`)
}

export function getDirectusAssetUrl(fileId?: string | null) {
  return fileId ? `${getDirectusPublicUrl()}/assets/${fileId}` : ''
}

function getClient() {
  const token = import.meta.env.DIRECTUS_TOKEN || ''
  return createDirectus<Schema>(getDirectusApiUrl()).with(staticToken(token)).with(rest())
}

type Collection = keyof Schema
type DirectusRequester = (
  collection: Collection,
  query: Record<string, unknown>
) => Promise<unknown>

let requestOverride: DirectusRequester | null = null

export function __setDirectusRequesterForTests(requester: DirectusRequester | null) {
  requestOverride = requester
}

async function requestItems<T>(collection: Collection, query: Record<string, unknown>): Promise<T> {
  if (requestOverride) {
    return (await requestOverride(collection, query)) as T
  }

  return getClient().request(readItems(collection as any, query as any)) as Promise<T>
}

// ── Cache (in-process, 5-min TTL) ────────────────────────────

const _cache = new Map<string, { data: unknown; expires: number }>()

async function cached<T>(key: string, fetcher: () => Promise<T>, ttl = 5 * 60_000): Promise<T> {
  const hit = _cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.data as T
  const data = await fetcher()
  _cache.set(key, { data, expires: Date.now() + ttl })
  return data
}

// ── Structured data fetchers ──────────────────────────────────

export async function getHomepageStats(): Promise<HomepageStat[]> {
  return cached('homepage_stats', async () => {
    try {
      return await requestItems<HomepageStat[]>('homepage_stats', {
        filter: { status: { _eq: 'published' } },
        sort: ['sort'],
        fields: ['id', 'sort', 'value', 'label', 'unit', 'detail'],
      })
    } catch {
      return []
    }
  })
}

export async function getServices(): Promise<Service[]> {
  return cached('services', async () => {
    try {
      return await requestItems<Service[]>('services', {
        filter: { status: { _eq: 'published' } },
        sort: ['sort'],
        fields: ['id', 'sort', 'slug', 'icon', 'name', 'subtitle', 'description', 'features'],
      })
    } catch {
      return []
    }
  })
}

export async function getWarehouses(): Promise<Warehouse[]> {
  return cached('warehouses', async () => {
    try {
      return await requestItems<Warehouse[]>('warehouses', {
        filter: { status: { _eq: 'published' } },
        sort: ['sort'],
        fields: [
          'id',
          'sort',
          'name',
          'city',
          'since',
          'address',
          'park',
          'rent',
          'height',
          'highlight',
        ],
      })
    } catch {
      return []
    }
  })
}

export async function getCases(): Promise<Case[]> {
  try {
    return await requestItems<Case[]>('cases', {
      filter: { status: { _eq: 'published' } },
      sort: ['sort'],
      fields: ['id', 'category', 'label', 'metrics', 'details', 'tags', 'img'],
    })
  } catch {
    return []
  }
}

// ── News fetchers ─────────────────────────────────────────────

export async function getPublishedNews(limit = 10, page = 1): Promise<NewsArticle[]> {
  try {
    return await requestItems<NewsArticle[]>('news', {
      filter: { status: { _eq: 'published' } },
      sort: ['-published_at'],
      limit,
      offset: (page - 1) * limit,
      fields: ['id', 'title', 'slug', 'summary', 'category', 'published_at', 'cover_image'],
    })
  } catch {
    return []
  }
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | null> {
  try {
    const items = await requestItems<NewsArticle[]>('news', {
      filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
      limit: 1,
    })
    return items[0] ?? null
  } catch {
    return null
  }
}

export async function getNewsByCategory(category: string, limit = 6): Promise<NewsArticle[]> {
  try {
    return await requestItems<NewsArticle[]>('news', {
      filter: { category: { _eq: category }, status: { _eq: 'published' } },
      sort: ['-published_at'],
      limit,
      fields: ['id', 'title', 'slug', 'summary', 'category', 'published_at'],
    })
  } catch {
    return []
  }
}

// ── Utilities ─────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const NEWS_CATEGORIES = ['行业资讯', '物流干货', '政策解读', '新亦源动态'] as const
