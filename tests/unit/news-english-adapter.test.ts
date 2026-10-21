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
  slug: 'published-english',
  category: 'industry-news',
  content: '<p>Reviewed English body.</p>',
  published_at: '2026-09-28T00:00:00.000Z',
  title: 'Published English article',
  summary: 'Reviewed English summary.',
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

  it('keeps empty independent records out of the English list', async () => {
    const requester = vi.fn(async () => [{ ...source, title: undefined }])
    __setDirectusRequesterForTests(requester)

    await expect(getPublishedEnglishNews()).resolves.toEqual([])
    expect(requester).toHaveBeenCalledWith(
      'english_news',
      expect.objectContaining({
        fields: ['*'],
        filter: expect.objectContaining({ status: { _eq: 'published' } }),
      })
    )
  })

  it.each([
    { status: 'draft' as const },
    { status: 'archived' as const },
    { published_at: '2026-09-30T00:00:00.000Z' },
    { content: '<p>&nbsp; </p>' },
  ])('rejects source or English records that are not publicly complete', async (override) => {
    __setDirectusRequesterForTests(async () => [{ ...source, ...override }])

    await expect(getEnglishNewsArticle(source.slug)).resolves.toBeNull()
  })

  it.each([
    { title: '\u200B' },
    { summary: '\u200D' },
    { summary: '\u200C' },
    { content: '<p>&ZeroWidthSpace;</p>' },
    { content: '<p>&#8203;</p>' },
    { content: '<p>&shy;</p>' },
  ])('rejects invisible-only English values from the list and detail', async (override) => {
    __setDirectusRequesterForTests(async () => [{ ...source, ...override }])

    await expect(getPublishedEnglishNews()).resolves.toEqual([])
    await expect(getEnglishNewsArticle(source.slug)).resolves.toBeNull()
  })

  it('returns an independent public article when its own record is published', async () => {
    __setDirectusRequesterForTests(async () => [source])

    await expect(getEnglishNewsArticle(source.slug)).resolves.toMatchObject({
      title: source.title,
      category: 'Industry news',
      published_at: source.published_at,
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
        title: 'Returns 👩‍💻 guide',
        summary: 'Teams coordinate across São Paulo.',
        content,
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
        title: '<Returns>',
        summary: '<guide>',
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
