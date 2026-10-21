import { requestItems } from './directus-client'
import { fallbackForUnavailable } from './directus/request-state'
import { paginateNews, parseNewsPublicationTime } from './news-publication-time'
import {
  type EnglishNewsArticle,
  type EnglishNewsCategory,
  toPublishedEnglishNewsArticle,
} from './news-english'
import type { EnglishNewsRecord } from './news-english-types'

const CANONICAL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * English records are isolated from Chinese news so editors can publish either
 * language independently. Visibility checks remain local so drafts, future
 * records, and empty content never reach public routes.
 */
export async function getPublishedEnglishNews(
  limit = 10,
  page = 1,
  category?: EnglishNewsCategory
): Promise<EnglishNewsArticle[]> {
  try {
    return paginateNews(await getVisibleEnglishNews(category), limit, page)
  } catch (error) {
    return fallbackForUnavailable(error, [])
  }
}

export async function getEnglishNewsArticle(slug: string): Promise<EnglishNewsArticle | null> {
  if (!CANONICAL_SLUG.test(slug)) return null
  try {
    const items = await requestItems<EnglishNewsRecord[]>('english_news', {
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'published' },
        published_at: { _nnull: true },
      },
      limit: 1,
      fields: ['*'],
    })
    return items[0] ? toPublishedEnglishNewsArticle(items[0]) : null
  } catch (error) {
    return fallbackForUnavailable(error, null)
  }
}

async function getVisibleEnglishNews(category?: EnglishNewsCategory) {
  const items = await requestItems<EnglishNewsRecord[]>('english_news', {
    filter: { status: { _eq: 'published' }, published_at: { _nnull: true } },
    sort: ['-published_at'],
    limit: -1,
    fields: ['*'],
  })
  return items
    .flatMap((item) => {
      const english = toPublishedEnglishNewsArticle(item)
      return english && (!category || english.categoryKey === category) ? [english] : []
    })
    .sort((left, right) => {
      const leftTime = parseNewsPublicationTime(left.published_at) ?? 0
      const rightTime = parseNewsPublicationTime(right.published_at) ?? 0
      return rightTime - leftTime
    })
}
