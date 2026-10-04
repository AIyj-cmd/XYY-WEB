import { describe, expect, it, vi } from 'vitest'

import { MAX_NEWS_PUBLISH_BODY_BYTES, readNewsPublishJson } from '@/lib/news-publishing/http'

function streamRequest(stream: ReadableStream<Uint8Array>) {
  return new Request('https://56xyy.com/api/integrations/news/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: stream,
    duplex: 'half',
  } as RequestInit)
}

describe('news publishing request body reader', () => {
  it('returns 413 immediately after the chunk that crosses 1 MiB', async () => {
    const cancel = vi.fn(() => Promise.reject(new Error('cancel rejected')))
    let pulls = 0
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls += 1
        if (pulls === 1) controller.enqueue(new Uint8Array(MAX_NEWS_PUBLISH_BODY_BYTES))
        else if (pulls === 2) controller.enqueue(new Uint8Array([0x61]))
        else controller.error(new Error('reader continued after the limit'))
      },
      cancel,
    })

    const parsed = await readNewsPublishJson(streamRequest(stream))

    expect(parsed.error?.status).toBe(413)
    await expect(parsed.error?.json()).resolves.toEqual({ error: '请求内容过大' })
    expect(cancel).toHaveBeenCalledOnce()
    expect(pulls).toBe(2)
  })

  it('accepts exactly 1 MiB of JSON when a UTF-8 character crosses chunks', async () => {
    const encoder = new TextEncoder()
    const prefix = '{"message":"跨'
    const suffix = '"}'
    const message = `跨${'a'.repeat(MAX_NEWS_PUBLISH_BODY_BYTES - encoder.encode(prefix + suffix).byteLength)}`
    const payload = encoder.encode(JSON.stringify({ message }))
    const characterOffset = payload.indexOf(0xe8)
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(payload.slice(0, characterOffset + 1))
        controller.enqueue(payload.slice(characterOffset + 1))
        controller.close()
      },
    })

    const parsed = await readNewsPublishJson(streamRequest(stream))

    expect(payload.byteLength).toBe(MAX_NEWS_PUBLISH_BODY_BYTES)
    expect(parsed).toEqual({ body: { message } })
  })

  it('keeps invalid JSON on the existing 400 contract', async () => {
    const parsed = await readNewsPublishJson(
      streamRequest(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('{'))
            controller.close()
          },
        })
      )
    )

    expect(parsed.error?.status).toBe(400)
    await expect(parsed.error?.json()).resolves.toEqual({ error: '请求内容不正确' })
  })
})
