import { NEWS_CATEGORIES, isCanonicalSlug } from '@/lib/directus-queries'
import { normalizeNewsPublishTimestamp } from '@/lib/news-publication-time'

export const MAX_NEWS_BATCH_SIZE = 20

export interface NewsPublishArticle {
  title: string
  slug: string
  category: (typeof NEWS_CATEGORIES)[number]
  summary: string
  content: string
  cover_image: string | null
  published_at: string
}

const ALLOWED_BODY_FIELDS = new Set(['articles'])
const ALLOWED_ARTICLE_FIELDS = new Set([
  'title',
  'slug',
  'category',
  'summary',
  'content',
  'cover_image',
  'published_at',
])
const DIRECTUS_FILE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function hasOnlyAllowedFields(body: Record<string, unknown>, allowedFields: Set<string>) {
  return Object.keys(body).every((field) => allowedFields.has(field))
}

function stringField(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed && trimmed.length <= maxLength ? trimmed : null
}

function validatePublishedAt(value: unknown, now: Date) {
  if (value === undefined) return now.toISOString()
  return normalizeNewsPublishTimestamp(value)
}

function validateArticle(value: unknown, now: Date): NewsPublishArticle | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const article = value as Record<string, unknown>
  if (!hasOnlyAllowedFields(article, ALLOWED_ARTICLE_FIELDS)) return null

  const title = stringField(article.title, 200)
  const slug = stringField(article.slug, 160)
  const summary = stringField(article.summary, 4_000)
  const content = stringField(article.content, 200_000)
  const category = article.category
  const publishedAt = validatePublishedAt(article.published_at, now)
  const coverImage = article.cover_image ?? null

  if (
    !title ||
    !slug ||
    !isCanonicalSlug(slug) ||
    !summary ||
    !content ||
    !NEWS_CATEGORIES.includes(category as (typeof NEWS_CATEGORIES)[number]) ||
    !publishedAt ||
    (coverImage !== null && (typeof coverImage !== 'string' || !DIRECTUS_FILE_ID.test(coverImage)))
  ) {
    return null
  }

  return {
    title,
    slug,
    category: category as (typeof NEWS_CATEGORIES)[number],
    summary,
    content,
    cover_image: coverImage,
    published_at: publishedAt,
  }
}

export function validateNewsPublishBody(body: Record<string, unknown>, now = new Date()) {
  if (!hasOnlyAllowedFields(body, ALLOWED_BODY_FIELDS) || !Array.isArray(body.articles)) {
    return { error: '请求内容不正确' as const }
  }
  if (!body.articles.length || body.articles.length > MAX_NEWS_BATCH_SIZE) {
    return { error: `每次最多发布 ${MAX_NEWS_BATCH_SIZE} 篇文章` as const }
  }

  const articles = body.articles.map((article) => validateArticle(article, now))
  if (articles.some((article) => article === null)) {
    return { error: '文章字段不正确' as const }
  }
  const validArticles = articles as NewsPublishArticle[]
  if (new Set(validArticles.map((article) => article.slug)).size !== validArticles.length) {
    return { error: '同一批次不能包含重复文章标识' as const }
  }
  return { articles: validArticles }
}
