import type { APIRoute } from 'astro'

import { getDirectusContentToken, getDirectusNewsWriteToken } from '@/lib/directus'
import {
  areDistinctServerTokens,
  getConfiguredServerToken,
  hasValidNewsPublishAuthorization,
} from '@/lib/news-publishing/auth'
import {
  MAX_NEWS_PUBLISH_BODY_BYTES,
  newsPublishJson,
  readNewsPublishJson,
} from '@/lib/news-publishing/http'
import { publishNewsArticles } from '@/lib/news-publishing/storage'
import { validateNewsPublishBody } from '@/lib/news-publishing/validation'

export const POST: APIRoute = async ({ request }) => {
  const configuredToken = getConfiguredServerToken(process.env.NEWS_PUBLISH_API_TOKEN)
  const writeToken = getConfiguredServerToken(getDirectusNewsWriteToken())
  const contentToken = getConfiguredServerToken(getDirectusContentToken())
  if (
    !configuredToken ||
    !writeToken ||
    !contentToken ||
    !areDistinctServerTokens([configuredToken, writeToken, contentToken])
  ) {
    return newsPublishJson({ error: '发布服务暂不可用' }, 503)
  }
  if (!hasValidNewsPublishAuthorization(request, configuredToken)) {
    return newsPublishJson({ error: '未授权' }, 401)
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_NEWS_PUBLISH_BODY_BYTES) {
    return newsPublishJson({ error: '请求内容过大' }, 413)
  }
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()
  if (contentType !== 'application/json') {
    return newsPublishJson({ error: '请求格式不正确' }, 415)
  }

  const parsed = await readNewsPublishJson(request)
  if (parsed.error) return parsed.error
  const validated = validateNewsPublishBody(parsed.body)
  if ('error' in validated) return newsPublishJson({ error: validated.error }, 400)

  const published = await publishNewsArticles(validated.articles)
  if (!published.success) {
    if (published.reason === 'duplicate') return newsPublishJson({ error: '文章标识已存在' }, 409)
    return newsPublishJson({ error: '发布服务暂不可用' }, 502)
  }
  return newsPublishJson({ success: true, data: { articles: published.articles } }, 201)
}
