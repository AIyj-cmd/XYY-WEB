import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __setDirectusRequesterForTests,
  getEnglishNewsArticle,
  getPublishedEnglishNews,
} from '@/lib/directus'
import { sanitizedEnglishNewsContent } from '@/lib/news-english'

const now = new Date('2026-09-29T00:00:00.000Z')
const source = {
  id: 1,
  status: 'published' as const,
  title: '中文文章',
  slug: 'published-english',
  summary: '中文摘要',
  category: '行业资讯',
  content: '<p>中文正文</p>',
  published_at: '2026-09-28T00:00:00.000Z',
  title_en: 'Published English article',
  summary_en: 'Reviewed English summary.',
  content_en: '<p>Reviewed English body.</p>',
  english_status: 'published' as const,
  english_published_at: '2026-09-28T00:00:00.000Z',
}

describe('English news adapter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    __setDirectusRequesterForTests(null)
  })
  afterEach(() => {
    vi.useRealTimers()
    __setDirectusRequesterForTests(null)
  })

  it('keeps old CMS records without English fields out of the English list', async () => {
    const requester = vi.fn(async () => [{ ...source, title_en: undefined }])
    __setDirectusRequesterForTests(requester)

    await expect(getPublishedEnglishNews()).resolves.toEqual([])
    expect(requester).toHaveBeenCalledWith(
      'news',
      expect.objectContaining({
        fields: ['*'],
        filter: expect.not.objectContaining({ english_status: expect.anything() }),
      })
    )
  })

  it.each([
    { status: 'draft' as const },
    { status: 'archived' as const },
    { english_status: 'draft' as const },
    { english_status: 'archived' as const },
    { english_published_at: '2026-09-30T00:00:00.000Z' },
    { content_en: '<p>&nbsp; </p>' },
  ])('rejects source or English records that are not publicly complete', async (override) => {
    __setDirectusRequesterForTests(async () => [{ ...source, ...override }])

    await expect(getEnglishNewsArticle(source.slug)).resolves.toBeNull()
  })

  it.each([
    { title_en: '\u200B' },
    { summary_en: '\u200D' },
    { summary_en: '\u200C' },
    { content_en: '<p>&ZeroWidthSpace;</p>' },
    { content_en: '<p>&#8203;</p>' },
    { content_en: '<p>&shy;</p>' },
  ])('rejects invisible-only English values from the list and detail', async (override) => {
    __setDirectusRequesterForTests(async () => [{ ...source, ...override }])

    await expect(getPublishedEnglishNews()).resolves.toEqual([])
    await expect(getEnglishNewsArticle(source.slug)).resolves.toBeNull()
  })

  it('returns a localized public article only after both editions are published', async () => {
    __setDirectusRequesterForTests(async () => [source])

    await expect(getEnglishNewsArticle(source.slug)).resolves.toMatchObject({
      title: source.title_en,
      category: 'Industry news',
      published_at: source.english_published_at,
    })
  })

  it('rejects empty sanitized markup while retaining a sanitized visible body', () => {
    expect(sanitizedEnglishNewsContent('<script>alert(1)</script><p>&nbsp;</p>')).toBeNull()
    expect(sanitizedEnglishNewsContent('<img src="/relative.jpg">')).toContain(
      'src="/relative.jpg"'
    )
    expect(sanitizedEnglishNewsContent('<p>Reviewed <strong>body</strong></p>')).toBe(
      '<p>Reviewed <strong>body</strong></p>'
    )
  })

  it('preserves visible Unicode and emoji source content', async () => {
    const content = '<p>Warehouse teams 👩‍💻 coordinate returns.</p>'
    __setDirectusRequesterForTests(async () => [
      {
        ...source,
        title_en: 'Returns 👩‍💻 guide',
        summary_en: 'Teams coordinate across São Paulo.',
        content_en: content,
      },
    ])

    await expect(getEnglishNewsArticle(source.slug)).resolves.toMatchObject({
      title: 'Returns 👩‍💻 guide',
      summary: 'Teams coordinate across São Paulo.',
      content,
    })
    expect(sanitizedEnglishNewsContent(content)).toBe(content)
  })

  it('preserves literal angle brackets in English plain text', async () => {
    __setDirectusRequesterForTests(async () => [
      {
        ...source,
        title_en: '<Returns>',
        summary_en: '<guide>',
      },
    ])

    await expect(getPublishedEnglishNews()).resolves.toMatchObject([
      { title: '<Returns>', summary: '<guide>' },
    ])
    await expect(getEnglishNewsArticle(source.slug)).resolves.toMatchObject({
      title: '<Returns>',
      summary: '<guide>',
    })
  })
})
