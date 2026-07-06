import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __setDirectusRequesterForTests,
  formatDate,
  getDirectusAssetUrl,
  getDirectusPublicUrl,
  getPublishedNews,
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
})
