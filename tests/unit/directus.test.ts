import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __setDirectusRequesterForTests,
  formatDate,
  getCases,
  getDirectusAssetUrl,
  getDirectusContentToken,
  getDirectusPublicUrl,
  getFaqs,
  getHomepageStats,
  getNewsByCategory,
  getPublishedNews,
  getServices,
  getWarehouses,
} from '@/lib/directus'
import { getClaimPresentation } from '@/lib/claims'

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

  it('uses the dedicated content token before the legacy shared token', () => {
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'content-token')
    vi.stubEnv('DIRECTUS_TOKEN', 'legacy-token')

    expect(getDirectusContentToken()).toBe('content-token')
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
    ['services', getServices],
    ['warehouses', getWarehouses],
  ] as const)('reads %s from Directus instead of local constants', async (collection, fetcher) => {
    const item =
      collection === 'services'
        ? {
            id: 1,
            sort: 1,
            slug: 'fixture-service',
            icon: 'fixture',
            name: '测试服务',
            subtitle: '测试副标题',
            description: '测试说明',
            features: ['测试能力'],
          }
        : {
            id: 1,
            sort: 1,
            name: '测试仓',
            city: '测试城市',
            since: '',
            address: '测试地址',
            park: '',
            rent: '',
            height: '',
            highlight: '测试能力',
          }
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
  it('reads the unified homepage configuration instead of scattered metric rows', async () => {
    const approved = getClaimPresentation('partnerBrands', 'home')
    const requester = vi.fn(async (collection) =>
      collection === 'homepage_content'
        ? [
            {
              id: 1,
              stats: [{ claimKey: 'partnerBrands', label: '合作品牌', detail: '鞋服品牌' }],
            },
          ]
        : []
    )
    __setDirectusRequesterForTests(requester)

    await expect(getHomepageStats()).resolves.toEqual([
      {
        id: 1,
        sort: 1,
        claimKey: 'partnerBrands',
        value: approved.value,
        label: '合作品牌',
        unit: approved.unit,
        detail: '鞋服品牌',
      },
    ])
    expect(requester).toHaveBeenCalledWith(
      'homepage_content',
      expect.objectContaining({ fields: ['id', 'stats'] })
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

  it('projects unified case fields so legacy card fields cannot stay stale', async () => {
    __setDirectusRequesterForTests(async () => [
      {
        id: 7,
        sort: 6,
        slug: 'inman',
        category: '棉麻生活服装',
        label: '茵曼（Inman）',
        name: '茵曼',
        full_name: '茵曼（Inman）',
        accent: '#B7791F',
        case_description: '后台新案例说明',
        stats: [{ label: '库存管理', value: '后台新指标', unit: '' }],
        metrics: '旧指标摘要',
        details: '旧案例说明',
        tags: ['全渠道一盘货'],
        img: '/inman.jpg',
      },
    ])

    await expect(getCases()).resolves.toEqual([
      expect.objectContaining({
        case_description: '后台新案例说明',
        details: '后台新案例说明',
        metrics: '库存管理 后台新指标',
      }),
    ])
  })

  it('reads page FAQs and resolves approved claim placeholders', async () => {
    const requester = vi.fn(async () => [
      { id: 1, sort: 1, question: '服务多少品牌？', answer: '目前服务{{partnerBrands}}品牌。' },
    ])
    __setDirectusRequesterForTests(requester)

    const result = await getFaqs('home', [])
    expect(result[0]?.q).toBe('服务多少品牌？')
    expect(result[0]?.a).not.toContain('{{partnerBrands}}')
    expect(requester).toHaveBeenCalledWith(
      'faqs',
      expect.objectContaining({
        filter: { page_key: { _eq: 'home' }, status: { _eq: 'published' } },
        sort: ['sort'],
      })
    )
  })
})
