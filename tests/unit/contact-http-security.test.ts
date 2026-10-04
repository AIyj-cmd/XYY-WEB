import { describe, expect, it, vi } from 'vitest'

import { MAX_CONTACT_BODY_BYTES, readContactJson } from '@/lib/contact/http'

function streamRequest(stream: ReadableStream<Uint8Array>, headers?: HeadersInit) {
  return new Request('https://56xyy.com/api/contact', {
    method: 'POST',
    body: stream,
    duplex: 'half',
    headers,
  } as RequestInit)
}

describe('contact request body reader', () => {
  it('stops a chunked request at the raw 8KiB limit even if cancellation rejects', async () => {
    const cancel = vi.fn(() => Promise.reject(new Error('cancel rejected')))
    let pulls = 0
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls += 1
        if (pulls === 1) controller.enqueue(new Uint8Array(MAX_CONTACT_BODY_BYTES))
        else if (pulls === 2) controller.enqueue(new Uint8Array([0x61]))
        else controller.error(new Error('reader continued after the limit'))
      },
      cancel,
    })

    const parsed = await readContactJson(streamRequest(stream, { 'content-length': '1' }))

    expect(parsed.error?.status).toBe(413)
    await expect(parsed.error?.json()).resolves.toMatchObject({ code: 'body_too_large' })
    expect(cancel).toHaveBeenCalledOnce()
    expect(pulls).toBe(2)
  })

  it('accepts exactly 8KiB of valid JSON when a UTF-8 character crosses chunks', async () => {
    const encoder = new TextEncoder()
    const prefix = '{"message":"跨'
    const suffix = '"}'
    const message = `跨${'a'.repeat(MAX_CONTACT_BODY_BYTES - encoder.encode(prefix + suffix).byteLength)}`
    const payload = encoder.encode(JSON.stringify({ message }))
    const characterOffset = payload.indexOf(0xe8)
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(payload.slice(0, characterOffset + 1))
        controller.enqueue(payload.slice(characterOffset + 1))
        controller.close()
      },
    })

    const parsed = await readContactJson(streamRequest(stream))

    expect(payload.byteLength).toBe(MAX_CONTACT_BODY_BYTES)
    expect(parsed).toEqual({ body: { message } })
  })

  it('lets stream read errors reach the API error boundary', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new Error('stream failed'))
      },
    })

    await expect(readContactJson(streamRequest(stream))).rejects.toThrow('stream failed')
  })
})
