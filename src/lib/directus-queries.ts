import { freshItems, getDirectusAssetUrl, requestItems, requestSingleton } from './directus-client'
import { interpolateClaims } from './directus-interpolation'
import type {
  Case,
  FaqItem,
  FaqRecord,
  HomepageStat,
  HomepageContentRecord,
  NewsArticle,
  Service,
  Warehouse,
} from './directus-types'

export async function getFaqs(pageKey: string, fallback: FaqItem[]): Promise<FaqItem[]> {
  try {
    const rows = await requestItems<FaqRecord[]>('faqs', {
      filter: { page_key: { _eq: pageKey }, status: { _eq: 'published' } },
      sort: ['sort'],
      fields: ['id', 'sort', 'question', 'answer'],
    })
    if (!rows.length) return fallback
    return rows.map(({ question, answer }) => ({ q: question, a: interpolateClaims(answer) }))
  } catch (error) {
    console.error(
      '[directus] FAQ fetch failed for',
      pageKey,
      error instanceof Error ? error.message : String(error)
    )
    return fallback
  }
}

export async function getHomepageStats(
  fallback: readonly HomepageStat[] = []
): Promise<HomepageStat[]> {
  try {
    const row = await requestSingleton<HomepageContentRecord>('homepage_content', {
      fields: ['id', 'stats'],
    })
    if (row?.status !== 'draft' && row?.stats?.length) {
      return row.stats.map((item, index) => ({
        id: index + 1,
        sort: index + 1,
        ...item,
      }))
    }
  } catch {
    return [...fallback]
  }
  return [...fallback]
}

export async function getServices(fallback: readonly Service[] = []): Promise<Service[]> {
  const services = await freshItems<Service>('services', {
    filter: { status: { _eq: 'published' } },
    sort: ['sort'],
    fields: ['id', 'sort', 'slug', 'icon', 'name', 'subtitle', 'description', 'features'],
  })
  return services.length ? services : [...fallback]
}

export async function getWarehouses(fallback: readonly Warehouse[] = []): Promise<Warehouse[]> {
  const warehouses = await freshItems<Warehouse>('warehouses', {
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
  return warehouses.length ? warehouses : [...fallback]
}

export async function getCases(fallback: readonly Case[] = []): Promise<Case[]> {
  const cases = await freshItems<Case>('cases', {
    filter: { status: { _eq: 'published' } },
    sort: ['sort'],
    fields: [
      'id',
      'slug',
      'category',
      'label',
      'name',
      'full_name',
      'accent',
      'case_description',
      'stats',
      'metrics',
      'details',
      'tags',
      'img',
      'image_file',
    ],
  })
  const resolvedCases = cases.map((item) => {
    const description = item.case_description ?? item.details
    const metrics = Array.isArray(item.stats)
      ? item.stats
          .slice(0, 3)
          .map(({ label, value, unit }) => `${label} ${value}${unit}`)
          .join(' · ')
      : item.metrics

    return {
      ...item,
      case_description: description,
      details: description,
      metrics,
      img: getDirectusAssetUrl(item.image_file) || item.img,
    }
  })
  return resolvedCases.length ? resolvedCases : [...fallback]
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
