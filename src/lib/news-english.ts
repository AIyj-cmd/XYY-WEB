import { parseNewsPublicationTime } from './news-publication-time'
import {
  hasVisibleEnglishNewsText,
  sanitizedEnglishNewsContent as sanitizeEnglishNewsContent,
} from './news-english-visibility.mjs'
import type { EnglishNewsRecord } from './news-english-types'

export const ENGLISH_NEWS_CATEGORIES = {
  'industry-news': { source: '行业资讯', label: 'Industry news' },
  'logistics-guides': { source: '物流干货', label: 'Logistics guides' },
  'policy-updates': { source: '政策解读', label: 'Policy updates' },
  'xinyiyuan-news': { source: '新亦源动态', label: 'XINYIYUAN news' },
} as const

export type EnglishNewsCategory = keyof typeof ENGLISH_NEWS_CATEGORIES

export type EnglishNewsArticle = Omit<
  EnglishNewsRecord,
  'content' | 'published_at' | 'category'
> & {
  content: string
  published_at: string
  category: string
  categoryKey: EnglishNewsCategory
}

const categoryFor = (category: unknown): EnglishNewsCategory | undefined =>
  typeof category === 'string' && Object.hasOwn(ENGLISH_NEWS_CATEGORIES, category)
    ? (category as EnglishNewsCategory)
    : undefined

export function sanitizedEnglishNewsContent(content: unknown): string | null {
  return sanitizeEnglishNewsContent(content)
}

export function isPublishedEnglishNewsRecord(article: EnglishNewsRecord, now = Date.now()) {
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
  article: EnglishNewsRecord,
  now = Date.now()
): EnglishNewsArticle | null {
  const categoryKey = categoryFor(article.category)
  const content = sanitizedEnglishNewsContent(article.content)
  if (
    !isPublishedEnglishNewsRecord(article, now) ||
    article.status !== 'published' ||
    typeof article.published_at !== 'string' ||
    parseNewsPublicationTime(article.published_at) === null ||
    parseNewsPublicationTime(article.published_at)! > now ||
    typeof article.title !== 'string' ||
    !hasVisibleEnglishNewsText(article.title) ||
    typeof article.summary !== 'string' ||
    !hasVisibleEnglishNewsText(article.summary) ||
    !content ||
    !categoryKey
  ) {
    return null
  }
  return {
    ...article,
    title: article.title.trim(),
    summary: article.summary.trim(),
    content,
    category: ENGLISH_NEWS_CATEGORIES[categoryKey].label,
    categoryKey,
    published_at: article.published_at,
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
