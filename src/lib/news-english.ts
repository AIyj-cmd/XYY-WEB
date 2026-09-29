import { parseNewsPublicationTime } from './news-publication-time'
import { sanitizeRichText } from './sanitize'
import type { NewsArticle } from './directus-types'

export const ENGLISH_NEWS_CATEGORIES = {
  'industry-news': { source: '行业资讯', label: 'Industry news' },
  'logistics-guides': { source: '物流干货', label: 'Logistics guides' },
  'policy-updates': { source: '政策解读', label: 'Policy updates' },
  'xinyiyuan-news': { source: '新亦源动态', label: 'XINYIYUAN news' },
} as const

export type EnglishNewsCategory = keyof typeof ENGLISH_NEWS_CATEGORIES

export type EnglishNewsArticle = Omit<NewsArticle, 'title' | 'summary' | 'content' | 'category'> & {
  title: string
  summary: string
  content: string
  category: string
  categoryKey: EnglishNewsCategory
}

const categoryFor = (category: unknown): EnglishNewsCategory | undefined =>
  (Object.keys(ENGLISH_NEWS_CATEGORIES) as EnglishNewsCategory[]).find(
    (key) => ENGLISH_NEWS_CATEGORIES[key].source === category
  )

const invisibleOrWhitespace = /[\p{White_Space}\p{Default_Ignorable_Code_Point}]/gu

const hasVisibleText = (value: string) => value.replace(invisibleOrWhitespace, '').length > 0

const hasVisibleRichText = (html: string) =>
  hasVisibleText(html.replace(/<[^>]*>/g, ' ').replace(/&(nbsp|#0*160|#x0*a0);/gi, ' '))

export function sanitizedEnglishNewsContent(content: unknown): string | null {
  if (typeof content !== 'string') return null
  const sanitized = sanitizeRichText(content)
  return hasVisibleRichText(sanitized) || /<img\b[^>]*\bsrc=/i.test(sanitized) ? sanitized : null
}

export function isPublishedNewsSource(article: NewsArticle, now = Date.now()) {
  return (
    (article.status === undefined || article.status === 'published') &&
    typeof article.slug === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) &&
    typeof article.published_at === 'string' &&
    parseNewsPublicationTime(article.published_at) !== null &&
    parseNewsPublicationTime(article.published_at)! <= now
  )
}

export function toPublishedEnglishNewsArticle(
  article: NewsArticle,
  now = Date.now()
): EnglishNewsArticle | null {
  const categoryKey = categoryFor(article.category)
  const content = sanitizedEnglishNewsContent(article.content_en)
  if (
    !isPublishedNewsSource(article, now) ||
    article.status !== 'published' ||
    article.english_status !== 'published' ||
    typeof article.english_published_at !== 'string' ||
    parseNewsPublicationTime(article.english_published_at) === null ||
    parseNewsPublicationTime(article.english_published_at)! > now ||
    typeof article.title_en !== 'string' ||
    !hasVisibleText(article.title_en) ||
    typeof article.summary_en !== 'string' ||
    !hasVisibleText(article.summary_en) ||
    !content ||
    !categoryKey
  ) {
    return null
  }
  return {
    ...article,
    title: article.title_en.trim(),
    summary: article.summary_en.trim(),
    content,
    category: ENGLISH_NEWS_CATEGORIES[categoryKey].label,
    categoryKey,
    published_at: article.english_published_at,
  }
}

export function formatEnglishNewsDate(value: string | null | undefined) {
  const timestamp = parseNewsPublicationTime(value)
  if (timestamp === null) return ''
  return new Date(timestamp).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  })
}
