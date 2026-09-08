import { describe, expect, it } from 'vitest'

import { sanitizeRichText } from '@/lib/sanitize'

describe('sanitizeRichText', () => {
  it('removes scripts and inline event handlers', () => {
    const html = sanitizeRichText('<p onclick="alert(1)">正文</p><script>alert(1)</script>')

    expect(html).toContain('<p>正文</p>')
    expect(html).not.toContain('onclick')
    expect(html).not.toContain('<script')
  })

  it('keeps safe links and adds rel protections', () => {
    const html = sanitizeRichText('<a href="https://example.com" target="_blank">链接</a>')

    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('rel="noopener noreferrer nofollow"')
  })

  it('keeps approved rich-text structure and safe links', () => {
    const html = sanitizeRichText(
      '<figure class="image"><img src="https://example.com/a.jpg" alt="示例"><figcaption><strong>说明</strong> <a href="mailto:test@example.com">联系</a></figcaption></figure>'
    )

    expect(html).toContain('<figure class="image">')
    expect(html).toContain('<img src="https://example.com/a.jpg" alt="示例" loading="lazy" />')
    expect(html).toContain('<figcaption><strong>说明</strong> <a href="mailto:test@example.com"')
  })

  it('removes SVG SMIL URI-list bypass content', () => {
    const html = sanitizeRichText(
      '<svg><animate attributeName="href" values="#safe;javascript:alert(1)"></animate></svg>'
    )

    expect(html).not.toContain('<svg')
    expect(html).not.toContain('<animate')
    expect(html).not.toContain('javascript:')
  })

  it('removes textarea literal-close bypass behavior while preserving only safe image markup', () => {
    const html = sanitizeRichText('<textarea></textarea/><img src=x onerror=alert(1)>')

    expect(html).not.toContain('<textarea')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('javascript:')
    expect(html).toContain('<img src="x" loading="lazy" />')
  })

  it('removes XMP script payloads', () => {
    const html = sanitizeRichText('<xmp><script>alert(1)</script></xmp>')

    expect(html).not.toContain('<xmp')
    expect(html).not.toContain('<script')
  })
})
