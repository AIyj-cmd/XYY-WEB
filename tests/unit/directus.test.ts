import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __setDirectusRequesterForTests,
  formatDate,
  getCases,
  getDirectusAssetUrl,
  getDirectusPublicUrl,
  getHomepageStats,
  getNewsByCategory,
  getPublishedNews,
  getServices,
  getWarehouses,
} from '@/lib/directus'

describe('Directus helpers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    __setDirectusRequesterForTests(null)
  })

  it('builds public asset URLs from PUBLIC_DIRECTUS_URL', () => {
    vi.stubEnv('PUBLIC_DIRECTUS_URL', 'https://example.com/cms/')

    expect(getDirectusPublicUrl()).toBe('https://example.com/cms')
    expect(getDirectusAssetUrl('abc')).toBe('https://example.com/cms/assets/abc')
  })

  it('formats Chinese dates', () => {
    expect(formatDate('2026-07-05T00:00:00.000Z')).toContain('2026')
  })

  it('returns published news from Directus', async () => {
    const article = {
      id: 1,
      title: '测试文章',
      slug: 'test-article',
      summary: '摘要',
      category: '行业资讯',
      published_at: '2026-07-05T00:00:00.000Z',
    }

    const requester = vi.fn(async () => [article])
    __setDirectusRequesterForTests(requester)

    await expect(getPublishedNews(1, 1)).resolves.toEqual([article])
    expect(requester).toHaveBeenCalledWith(
      'news',
      expect.objectContaining({
        filter: { status: { _eq: 'published' } },
        limit: 1,
        offset: 0,
      })
    )
  })

  it('filters published news by category and requests cover images', async () => {
    const requester = vi.fn(async () => [])
    __setDirectusRequesterForTests(requester)

    await expect(getNewsByCategory('行业资讯', 6)).resolves.toEqual([])
    expect(requester).toHaveBeenCalledWith(
      'news',
      expect.objectContaining({
        filter: {
          category: { _eq: '行业资讯' },
          status: { _eq: 'published' },
        },
        fields: expect.arrayContaining(['cover_image']),
        limit: 6,
      })
    )
  })

  it.each([
    ['homepage_stats', getHomepageStats],
    ['services', getServices],
    ['warehouses', getWarehouses],
  ] as const)('reads %s from Directus instead of local constants', async (collection, fetcher) => {
    const item = { id: 1, marker: collection }
    const requester = vi.fn(async () => [item])
    __setDirectusRequesterForTests(requester)

    await expect(fetcher()).resolves.toEqual([item])
    expect(requester).toHaveBeenCalledTimes(1)
    expect(requester).toHaveBeenCalledWith(
      collection,
      expect.objectContaining({
        filter: { status: { _eq: 'published' } },
        sort: ['sort'],
      })
    )
  })

  it.each([
    ['cases', () => getCases()],
    ['published news', () => getPublishedNews(1, 1)],
  ])('requests fresh %s data on every call', async (_name, fetcher) => {
    const requester = vi
      .fn()
      .mockResolvedValueOnce([{ id: 1, label: '第一次' }])
      .mockResolvedValueOnce([{ id: 2, label: '第二次' }])
    __setDirectusRequesterForTests(requester)

    await expect(fetcher()).resolves.toEqual([{ id: 1, label: '第一次' }])
    await expect(fetcher()).resolves.toEqual([{ id: 2, label: '第二次' }])
    expect(requester).toHaveBeenCalledTimes(2)
  })

  it('returns an empty list when a collection request fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    __setDirectusRequesterForTests(async () => {
      throw new Error('CMS unavailable')
    })

    await expect(getHomepageStats()).resolves.toEqual([])
    expect(errorSpy).toHaveBeenCalled()
  })
})
