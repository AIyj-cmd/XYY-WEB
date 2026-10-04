export const MAX_CONTACT_BODY_BYTES = 8 * 1024

export function contactJson(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function invalidJsonResponse() {
  return contactJson({ error: '请求内容不正确', code: 'invalid_json' }, 400)
}

function bodyTooLargeResponse() {
  return contactJson({ error: '提交内容过大，请精简后再试', code: 'body_too_large' }, 413)
}

function parseContactJson(rawBody: string) {
  try {
    const value: unknown = JSON.parse(rawBody)
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { error: invalidJsonResponse() }
    }
    return { body: value as Record<string, unknown> }
  } catch {
    return { error: invalidJsonResponse() }
  }
}

export async function readContactJson(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) return parseContactJson('')

  const chunks: Uint8Array[] = []
  let byteLength = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      byteLength += value.byteLength
      if (byteLength > MAX_CONTACT_BODY_BYTES) {
        void reader.cancel().catch(() => undefined)
        return { error: bodyTooLargeResponse() }
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
  return parseContactJson(new TextDecoder().decode(body))
}
