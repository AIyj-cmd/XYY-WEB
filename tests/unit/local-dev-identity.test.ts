import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { verifyLocalDevIdentity } from '../../scripts/lib/local-dev-identity.mjs'

const root = resolve(import.meta.dirname, '../..')
const logo = readFile(resolve(root, 'public/logo.png'))

function html(language: string, title: string, heading: string, extra = '') {
  return `<html lang="${language}"><head><title>${title}</title></head><body>${extra}<h1>${heading}</h1></body></html>`
}

function mockIdentity({ chinese, english }: { chinese?: string; english?: string } = {}) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input)
    const body = url.endsWith('/en')
      ? (english ?? html('en', 'XINYIYUAN', 'English heading'))
      : url.endsWith('/@vite/client')
        ? 'const hot = createHotContext(); vite:beforeUpdate'
        : url.endsWith('/logo.png')
          ? await logo
          : (chinese ?? html('zh-Hans', '新亦源', '中文标题'))
    const type = url.endsWith('/@vite/client')
      ? 'text/javascript'
      : url.endsWith('/logo.png')
        ? 'image/png'
        : 'text/html'
    return new Response(body, { status: 200, headers: { 'content-type': type } })
  })
}

afterEach(() => vi.restoreAllMocks())

describe('local development identity', () => {
  it('requires the brand in the title instead of accepting body-only brand text', async () => {
    mockIdentity({
      chinese: html('zh-Hans', 'Wrong title', '中文标题', '<p>新亦源正文品牌</p>'),
    })

    await expect(
      verifyLocalDevIdentity({ projectRoot: root, port: 45089, timeoutMs: 1000 })
    ).rejects.toThrow('local_dev_identity_/_title')
  })

  it('rejects redirects, wrong language, and invalid Vite or logo responses', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    fetch.mockResolvedValueOnce(
      new Response('', { status: 308, headers: { location: 'https://outside.example/' } })
    )
    fetch.mockResolvedValue(new Response('', { status: 500 }))
    await expect(
      verifyLocalDevIdentity({ projectRoot: root, port: 45089, timeoutMs: 1000 })
    ).rejects.toThrow('local_dev_identity_/_status:308')

    mockIdentity({ chinese: html('en', '新亦源', 'wrong language') })
    await expect(
      verifyLocalDevIdentity({ projectRoot: root, port: 45089, timeoutMs: 1000 })
    ).rejects.toThrow('local_dev_identity_/_language')
  })
})
