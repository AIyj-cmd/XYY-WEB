export const MAX_NEWS_PUBLISH_BODY_BYTES = 1024 * 1024

export function newsPublishJson(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export async function readNewsPublishJson(request: Request) {
  const rawBody = await request.text()
  if (new TextEncoder().encode(rawBody).byteLength > MAX_NEWS_PUBLISH_BODY_BYTES) {
    return { error: newsPublishJson({ error: '请求内容过大' }, 413) }
  }

  try {
    const value: unknown = JSON.parse(rawBody)
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { error: newsPublishJson({ error: '请求内容不正确' }, 400) }
    }
    return { body: value as Record<string, unknown> }
  } catch {
    return { error: newsPublishJson({ error: '请求内容不正确' }, 400) }
  }
}
