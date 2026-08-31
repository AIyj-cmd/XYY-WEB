import {
  getDirectusApiUrl,
  getDirectusContentToken,
  getDirectusNewsWriteToken,
} from '@/lib/directus'

import { areDistinctServerTokens, getConfiguredServerToken } from './auth'
import type { NewsPublishArticle } from './validation'

const DIRECTUS_NEWS_WRITE_TIMEOUT_MS = 10_000
const LOOPBACK_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

type PublishResult =
  | { success: true; articles: Array<{ id: number; slug: string }> }
  | { success: false; reason: 'configuration' | 'duplicate' | 'unavailable' }

function directusNewsUrl() {
  const rawUrl = getDirectusApiUrl()
  try {
    const url = new URL(rawUrl)
    const isExplicitLoopbackHttp =
      LOOPBACK_HTTP_HOSTS.has(url.hostname) &&
      /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?(?:\/|$)/i.test(rawUrl)
    if (
      (url.protocol !== 'https:' && (url.protocol !== 'http:' || !isExplicitLoopbackHttp)) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null
    }
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/items/news`
    return url.toString()
  } catch {
    return null
  }
}

function isDirectusDuplicate(payload: unknown) {
  if (!payload || typeof payload !== 'object') return false
  const errors = (payload as { errors?: unknown }).errors
  if (!Array.isArray(errors)) return false
  return errors.some(
    (error) =>
      typeof error === 'object' &&
      error !== null &&
      (error as { extensions?: { code?: unknown } }).extensions?.code === 'RECORD_NOT_UNIQUE'
  )
}

function createdArticles(payload: unknown, expectedSlugs: string[]) {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !Array.isArray((payload as { data?: unknown }).data)
  ) {
    return null
  }
  const records = (payload as { data: unknown[] }).data
  if (records.length !== expectedSlugs.length) return null
  const articles = records.map((record, index) => {
    if (!record || typeof record !== 'object') return null
    const id = (record as { id?: unknown }).id
    const parsedId =
      typeof id === 'number'
        ? id
        : typeof id === 'string' && /^[1-9]\d*$/.test(id)
          ? Number(id)
          : null
    return parsedId !== null &&
      Number.isSafeInteger(parsedId) &&
      parsedId > 0 &&
      expectedSlugs[index]
      ? { id: parsedId, slug: expectedSlugs[index] }
      : null
  })
  return articles.every((article) => article && Number.isFinite(article.id))
    ? (articles as Array<{ id: number; slug: string }>)
    : null
}

export async function publishNewsArticles(articles: NewsPublishArticle[]): Promise<PublishResult> {
  const writeToken = getConfiguredServerToken(getDirectusNewsWriteToken())
  const contentToken = getConfiguredServerToken(getDirectusContentToken())
  const endpoint = directusNewsUrl()
  if (
    !endpoint ||
    !writeToken ||
    !contentToken ||
    !areDistinctServerTokens([writeToken, contentToken])
  ) {
    return { success: false, reason: 'configuration' }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${writeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        articles.map((article) => ({
          ...article,
          status: 'published',
        }))
      ),
      signal: AbortSignal.timeout(DIRECTUS_NEWS_WRITE_TIMEOUT_MS),
    })

    let payload: unknown = null
    try {
      payload = await response.json()
    } catch {
      return { success: false, reason: 'unavailable' }
    }
    if (response.status === 409 || isDirectusDuplicate(payload)) {
      return { success: false, reason: 'duplicate' }
    }
    if (!response.ok) return { success: false, reason: 'unavailable' }

    const created = createdArticles(
      payload,
      articles.map((article) => article.slug)
    )
    return created
      ? { success: true, articles: created }
      : { success: false, reason: 'unavailable' }
  } catch {
    return { success: false, reason: 'unavailable' }
  }
}
