import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __setDirectusRequesterForTests,
  formatDate,
  getNewsArticle,
  getNewsByCategory,
  getPublishedNews,
  isPublishedAtOrBeforeNow,
  parseNewsPublicationTime,
} from '@/lib/directus'

const now = new Date('2026-08-31T06:30:00.000Z')

function article(id: number, slug: string, publishedAt: string, category = '行业资讯') {
  return {
    id,
    title: slug,
    slug,
    summary: '摘要',
    category,
    published_at: publishedAt,
  }
}

describe('News publication timestamps', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    __setDirectusRequesterForTests(null)
  })

  afterEach(() => {
    vi.useRealTimers()
    __setDirectusRequesterForTests(null)
  })

  it('interprets bare Directus timestamps as Asia/Shanghai editorial time', () => {
    expect(parseNewsPublicationTime('2026-08-31T14:30:00')).toBe(now.getTime())
    expect(isPublishedAtOrBeforeNow('2026-08-31 14:30:00')).toBe(true)
    expect(isPublishedAtOrBeforeNow('2026-08-31T14:30:01')).toBe(false)
  })

  it('keeps explicit UTC and offset timestamps absolute', () => {
    expect(parseNewsPublicationTime('2026-08-31T06:30:00.000Z')).toBe(now.getTime())
    expect(parseNewsPublicationTime('2026-08-31T14:30:00+08:00')).toBe(now.getTime())
    expect(parseNewsPublicationTime('2026-08-31T20:30:00+14:00')).toBe(now.getTime())
    expect(formatDate('2026-08-31T00:30:00Z')).toContain('2026年8月31日')
  })

  it.each([
    '2026-02-30T14:00:00',
    '2026-02-30T14:00:00Z',
    '2026-04-31T14:00:00+08:00',
    '2026-08-31T24:00:00Z',
    '2026-08-31T14:00:00+14:01',
    '2026-08-31T14:00:00+23:00',
  ])('rejects invalid calendar timestamp %s', (value) => {
    expect(parseNewsPublicationTime(value)).toBeNull()
  })

  it('filters future articles before ordering and paginating the public list', async () => {
    const rows = [
      article(1, 'future', '2026-08-31T15:00:00'),
      article(2, 'visible-now', '2026-08-31T14:30:00'),
      article(3, 'older', '2026-08-31T14:00:00'),
    ]
    const requester = vi.fn(async () => rows)
    __setDirectusRequesterForTests(requester)

    await expect(getPublishedNews(1, 1)).resolves.toEqual([rows[1]])
    await expect(getPublishedNews(1, 2)).resolves.toEqual([rows[2]])
    expect(requester).toHaveBeenLastCalledWith(
      'news',
      expect.objectContaining({
        filter: { status: { _eq: 'published' }, published_at: { _nnull: true } },
        limit: -1,
      })
    )
  })

  it('applies the same visibility rule to category and article queries', async () => {
    const visible = article(4, 'visible-category', '2026-08-31T14:30:00', '物流干货')
    const future = article(5, 'future-category', '2026-08-31T14:31:00', '物流干货')
    const requester = vi.fn(async (_collection, query) => {
      const slug = (query as { filter?: { slug?: { _eq?: string } } }).filter?.slug?._eq
      if (slug === future.slug) return [future]
      if (slug === visible.slug) return [visible]
      return [future, visible]
    })
    __setDirectusRequesterForTests(requester)

    await expect(getNewsByCategory('物流干货', 6)).resolves.toEqual([visible])
    await expect(getNewsArticle('future-category')).resolves.toBeNull()
    await expect(getNewsArticle('visible-category')).resolves.toEqual(visible)
    expect(requester).toHaveBeenNthCalledWith(
      2,
      'news',
      expect.objectContaining({
        filter: {
          slug: { _eq: 'future-category' },
          status: { _eq: 'published' },
          published_at: { _nnull: true },
        },
        limit: 1,
      })
    )
  })
})
