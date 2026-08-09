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

export async function readContactJson(request: Request) {
  const rawBody = await request.text()
  if (new TextEncoder().encode(rawBody).byteLength > MAX_CONTACT_BODY_BYTES) {
    return { error: contactJson({ error: '提交内容过大，请精简后再试' }, 413) }
  }

  try {
    const value: unknown = JSON.parse(rawBody)
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { error: contactJson({ error: '请求内容不正确' }, 400) }
    }
    return { body: value as Record<string, unknown> }
  } catch {
    return { error: contactJson({ error: '请求内容不正确' }, 400) }
  }
}
