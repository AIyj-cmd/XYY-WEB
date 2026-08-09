import { freshItems, requestItems } from './directus-client'
import type { Case, HomepageStat, NewsArticle, Service, Warehouse } from './directus-types'

export async function getHomepageStats(): Promise<HomepageStat[]> {
  return freshItems<HomepageStat>('homepage_stats', {
    filter: { status: { _eq: 'published' } },
    sort: ['sort'],
    fields: ['id', 'sort', 'value', 'label', 'unit', 'detail'],
  })
}

export async function getServices(): Promise<Service[]> {
  return freshItems<Service>('services', {
    filter: { status: { _eq: 'published' } },
    sort: ['sort'],
    fields: ['id', 'sort', 'slug', 'icon', 'name', 'subtitle', 'description', 'features'],
  })
}

export async function getWarehouses(): Promise<Warehouse[]> {
  return freshItems<Warehouse>('warehouses', {
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
}

export async function getCases(): Promise<Case[]> {
  return freshItems<Case>('cases', {
    filter: { status: { _eq: 'published' } },
    sort: ['sort'],
    fields: ['id', 'category', 'label', 'metrics', 'details', 'tags', 'img'],
  })
}

export async function getPublishedNews(limit = 10, page = 1): Promise<NewsArticle[]> {
  return freshItems<NewsArticle>('news', {
    filter: { status: { _eq: 'published' } },
    sort: ['-published_at'],
    limit,
    offset: (page - 1) * limit,
    fields: ['id', 'title', 'slug', 'summary', 'category', 'published_at', 'cover_image'],
  })
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
  return freshItems<NewsArticle>('news', {
    filter: { category: { _eq: category }, status: { _eq: 'published' } },
    sort: ['-published_at'],
    limit,
    fields: ['id', 'title', 'slug', 'summary', 'category', 'published_at', 'cover_image'],
  })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const NEWS_CATEGORIES = ['行业资讯', '物流干货', '政策解读', '新亦源动态'] as const
