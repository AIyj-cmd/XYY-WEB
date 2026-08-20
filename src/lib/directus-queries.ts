import { getDirectusAssetUrl, requestItems, requestSingleton } from './directus-client'
import { fallbackForUnavailable, invalidDirectusData } from './directus/request-state'
import { interpolateClaims } from './directus-interpolation'
import { resolveHomepageClaimStat } from './claims/cms'
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
      filter: { faq_page: { key: { _eq: pageKey } }, status: { _eq: 'published' } },
      sort: ['sort'],
      fields: ['id', 'sort', 'question', 'answer'],
    })
    return rows.map(({ id, question, answer }) => ({
      q: question,
      a: interpolateClaims(answer, {
        pageScope: pageKey,
        source: { collection: 'faqs', recordId: id, field: 'answer' },
      }),
    }))
  } catch (error) {
    return fallbackForUnavailable(error, fallback)
  }
}

export async function getHomepageStats(
  fallback: readonly HomepageStat[] = []
): Promise<HomepageStat[]> {
  try {
    const row = await requestSingleton<HomepageContentRecord>('homepage_content', {
      fields: ['id', 'stats'],
    })
    if (!row || row.status === 'draft') return []
    if (!Array.isArray(row.stats)) {
      throw invalidDirectusData('homepage_content', 'read_singleton', 'invalid_data')
    }
    if (row.stats.length) {
      const warned = new Set<string>()
      return row.stats.map((item, index) => resolveHomepageClaimStat(item, index, warned))
    }
  } catch (error) {
    return fallbackForUnavailable(error, [...fallback])
  }
  return []
}

export async function getServices(fallback: readonly Service[] = []): Promise<Service[]> {
  try {
    const rows = await requestItems<Service[]>('services', {
      filter: { status: { _eq: 'published' } },
      sort: ['sort'],
      fields: ['id', 'sort', 'slug', 'icon', 'name', 'subtitle', 'description', 'features'],
    })
    return rows.map((row) => {
      const text = (value: string, field: string) =>
        interpolateClaims(value, {
          pageScope: 'home',
          source: { collection: 'services', recordId: row.id, field },
        })
      return {
        ...row,
        subtitle: text(row.subtitle, 'subtitle'),
        description: text(row.description, 'description'),
        features: Array.isArray(row.features)
          ? row.features.map((feature) => text(feature, 'features'))
          : [],
      }
    })
  } catch (error) {
    return fallbackForUnavailable(error, [...fallback])
  }
}

export async function getWarehouses(fallback: readonly Warehouse[] = []): Promise<Warehouse[]> {
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
  } catch (error) {
    return fallbackForUnavailable(error, [...fallback])
  }
}

function resolveCases(cases: Case[]) {
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
  return resolvedCases
}

export type CasesResolution =
  { source: 'cms'; items: Case[] } | { source: 'fallback'; items: Case[] }

export async function getCasesResolution(fallback: readonly Case[] = []): Promise<CasesResolution> {
  try {
    const cases = await requestItems<Case[]>('cases', {
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
    return { source: 'cms', items: resolveCases(cases) }
  } catch (error) {
    return {
      source: 'fallback',
      items: fallbackForUnavailable(error, [...fallback]),
    }
  }
}

export async function getCases(fallback: readonly Case[] = []): Promise<Case[]> {
  return (await getCasesResolution(fallback)).items
}

export async function getPublishedNews(limit = 10, page = 1): Promise<NewsArticle[]> {
  try {
    const items = await requestItems<NewsArticle[]>('news', {
      filter: {
        status: { _eq: 'published' },
        published_at: { _nnull: true, _lte: '$NOW' },
      },
      sort: ['-published_at'],
      limit,
      offset: (page - 1) * limit,
      fields: ['id', 'title', 'slug', 'summary', 'category', 'published_at', 'cover_image'],
    })
    return items.filter(isPublicNewsArticle)
  } catch (error) {
    return fallbackForUnavailable(error, [])
  }
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | null> {
  if (!isCanonicalSlug(slug)) return null
  try {
    const items = await requestItems<NewsArticle[]>('news', {
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'published' },
        published_at: { _nnull: true, _lte: '$NOW' },
      },
      limit: 1,
    })
    return items[0] && isPublicNewsArticle(items[0]) ? items[0] : null
  } catch (error) {
    return fallbackForUnavailable(error, null)
  }
}

export async function getNewsByCategory(category: string, limit = 6): Promise<NewsArticle[]> {
  try {
    const items = await requestItems<NewsArticle[]>('news', {
      filter: {
        category: { _eq: category },
        status: { _eq: 'published' },
        published_at: { _nnull: true, _lte: '$NOW' },
      },
      sort: ['-published_at'],
      limit,
      fields: ['id', 'title', 'slug', 'summary', 'category', 'published_at', 'cover_image'],
    })
    return items.filter(isPublicNewsArticle)
  } catch (error) {
    return fallbackForUnavailable(error, [])
  }
}

const CANONICAL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isCanonicalSlug(value: unknown): value is string {
  return typeof value === 'string' && CANONICAL_SLUG.test(value)
}

function isPublicNewsArticle(article: NewsArticle) {
  return (
    isCanonicalSlug(article.slug) &&
    Boolean(article.published_at) &&
    !Number.isNaN(Date.parse(article.published_at))
  )
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const NEWS_CATEGORIES = ['行业资讯', '物流干货', '政策解读', '新亦源动态'] as const
