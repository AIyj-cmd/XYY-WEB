import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  collectNewsRichTextAssetIds,
  directusAssetIdFromNewsImageSource,
  rewriteNewsRichTextAssets,
} from '@/lib/news-rich-text'

const first = '11111111-1111-4111-8111-111111111111'
const second = '22222222-2222-4222-8222-222222222222'
const privateId = '33333333-3333-4333-8333-333333333333'
const origins = {
  siteOrigin: 'https://56xyy.com',
  directusPublicUrl: 'https://assets.example.test/cms',
}

describe('news rich text Directus assets', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('rewrites only strict same-origin Directus image sources and removes their srcset', () => {
    const content = [
      `<img src="https://56xyy.com/assets/${first}.jpeg?width=1080&amp;height=810" srcset="https://56xyy.com/assets/${first}.jpeg 1x" alt="正文图">`,
      `<img src="https://assets.example.test/cms/assets/${second}.png?height=500&width=900" alt="第二张">`,
      '<img src="https://cdn.example.test/image.png" srcset="https://cdn.example.test/image-2x.png 2x" alt="外链">',
    ].join('')

    const html = rewriteNewsRichTextAssets(content, origins)
    expect(html).toContain(`<img src="/api/cms-assets/${first}" alt="正文图" loading="lazy" />`)
    expect(html).toContain(`<img src="/api/cms-assets/${second}" alt="第二张" loading="lazy" />`)
    expect(html).toContain(
      '<img src="https://cdn.example.test/image.png" srcset="https://cdn.example.test/image-2x.png 2x" alt="外链" loading="lazy" />'
    )
    expect(html).not.toContain('width=1080')
    expect(html).not.toContain('height=500')
  })

  it('collects only actual sanitized img src values, never text, comments, or skipped tags', () => {
    const content = [
      `<img src="/assets/${first}.jpeg?width=1080&amp;height=810" alt="正文图">`,
      `<img src="https://56xyy.com/assets/${second}.png" alt="正文图">`,
      `<a href="https://56xyy.com/assets/${second}.png">下载</a>`,
      `<img src="https://56xyy.com.evil.test/assets/${second}.png">`,
      `<img src="https://56xyy.com/assets/${second}/preview.png">`,
      `<img src="https://56xyy.com/assets/${second}.png?access_token=discarded">`,
      `<!-- <img src="https://56xyy.com/assets/${privateId}.png"> -->`,
      `<script><img src="https://56xyy.com/assets/${privateId}.png"></script>`,
      `<textarea><img src="https://56xyy.com/assets/${privateId}.png"></textarea>`,
      `&lt;img src="https://56xyy.com/assets/${privateId}.png"&gt;`,
    ].join('')

    expect([...collectNewsRichTextAssetIds(content, origins)]).toEqual([first, second])
  })

  it('does not treat an alt value as an image source or turn its text into an event attribute', () => {
    const content = `<img alt="note src='/assets/${privateId}.png' onerror='alert(1)'" src="https://cdn.example.test/ok.png">`
    const html = rewriteNewsRichTextAssets(content, origins)

    expect([...collectNewsRichTextAssetIds(content, origins)]).toEqual([])
    expect(html).toContain(`alt="note src='/assets/${privateId}.png' onerror='alert(1)'"`)
    expect(html).toContain('src="https://cdn.example.test/ok.png"')
    expect(html).not.toContain(`/api/cms-assets/${privateId}`)
  })

  it('uses the first strict Directus srcset candidate when src is foreign or missing', () => {
    const content = [
      `<img src="https://cdn.example.test/fallback.png" srcset="data:image/gif;base64,AAAA 1x, https://56xyy.com/assets/${first}.png?access_token=discarded,still-hidden 2x">`,
      `<img srcset="https://cdn.example.test/fallback.png 1x, https://56xyy.com/assets/${second}.avif?token=discarded 2x">`,
    ].join('')
    const html = rewriteNewsRichTextAssets(content, origins)

    expect([...collectNewsRichTextAssetIds(content, origins)]).toEqual([first, second])
    expect(html).toContain(`<img src="/api/cms-assets/${first}" loading="lazy" />`)
    expect(html).toContain(`/api/cms-assets/${second}`)
    expect(html).not.toContain('srcset=')
    expect(html).not.toContain('access_token')
    expect(html).not.toContain('token=discarded')
  })

  it('keeps fully external responsive images and ignores pseudo srcset text', () => {
    const content = [
      '<img src="https://cdn.example.test/fallback.png" srcset="https://cdn.example.test/fallback.png 1x, https://cdn.example.test/fallback-2x.png 2x">',
      `<img alt="srcset='https://56xyy.com/assets/${privateId}.png 1x'" src="https://cdn.example.test/alt.png">`,
    ].join('')
    const html = rewriteNewsRichTextAssets(content, origins)

    expect([...collectNewsRichTextAssetIds(content, origins)]).toEqual([])
    expect(html).toContain(
      'srcset="https://cdn.example.test/fallback.png 1x, https://cdn.example.test/fallback-2x.png 2x"'
    )
    expect(html).toContain(`alt="srcset='https://56xyy.com/assets/${privateId}.png 1x'"`)
    expect(html).not.toContain(`/api/cms-assets/${privateId}`)
  })

  it.each([{}, [], 1])(
    'rejects a non-string body value instead of rendering an empty body',
    (content) => {
      expect(() => rewriteNewsRichTextAssets(content)).toThrowError(TypeError)
      expect(() => rewriteNewsRichTextAssets(content)).toThrow(
        'news rich text content must be a string'
      )
    }
  )

  it('keeps an empty string body as empty content', () => {
    expect(rewriteNewsRichTextAssets('')).toBe('')
  })

  it('accepts only exact configured origins and safe asset paths', () => {
    expect(
      directusAssetIdFromNewsImageSource(
        `https://assets.example.test/cms/assets/${first}?width=678&height=778`,
        origins
      )
    ).toBe(first)
    for (const value of [
      `https://assets.example.test/assets/${first}.jpeg`,
      `https://assets.example.test/cms/assets/${first}.svg`,
      `//56xyy.com/assets/${first}.jpeg`,
      `https://user:pass@56xyy.com/assets/${first}.jpeg`,
    ])
      expect(directusAssetIdFromNewsImageSource(value, origins)).toBeNull()

    const html = rewriteNewsRichTextAssets(
      `<img src="https://56xyy.com/assets/${first}.jpeg?access_token=discarded#fragment">`,
      origins
    )
    expect(html).toContain(`<img src="/api/cms-assets/${first}" loading="lazy" />`)
    expect(html).not.toContain('access_token')
  })

  it('keeps the canonical production asset origin available during loopback fixture runs', async () => {
    vi.stubEnv('PUBLIC_SITE_URL', 'http://127.0.0.1:4399')
    vi.stubEnv('PUBLIC_DIRECTUS_URL', 'http://127.0.0.1:8055')
    vi.resetModules()
    const {
      collectNewsRichTextAssetIds,
      directusAssetIdFromNewsImageSource,
      rewriteNewsRichTextAssets,
    } = await import('@/lib/news-rich-text')
    const content = `<img src="https://56xyy.com/assets/${first}.webp?width=1080">`

    expect([...collectNewsRichTextAssetIds(content)]).toEqual([first])
    expect(rewriteNewsRichTextAssets(content)).toContain(`/api/cms-assets/${first}`)
    expect(
      directusAssetIdFromNewsImageSource(`https://56xyy.com.evil.test/assets/${first}.webp`)
    ).toBeNull()
  })
})
