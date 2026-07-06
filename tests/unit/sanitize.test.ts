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
})
