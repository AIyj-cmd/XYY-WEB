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
  const reader = request.body?.getReader()
  if (!reader) return parseNewsPublishJson('')

  const chunks: Uint8Array[] = []
  let byteLength = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      byteLength += value.byteLength
      if (byteLength > MAX_NEWS_PUBLISH_BODY_BYTES) {
        void reader.cancel().catch(() => undefined)
        return { error: newsPublishJson({ error: '请求内容过大' }, 413) }
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(byteLength)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return parseNewsPublishJson(new TextDecoder().decode(body))
}

function parseNewsPublishJson(rawBody: string) {
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
