import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __setDirectusRequesterForTests,
  getCases,
  getFaqs,
  getHomepageStats,
  getServices,
  getWarehouses,
} from '@/lib/directus'

describe('Directus public content resilience', () => {
  beforeEach(() => {
    __setDirectusRequesterForTests(null)
    vi.restoreAllMocks()
  })

  it('uses published CMS metric values without replacing them with static fallbacks', async () => {
    const reviewedStats = [
      {
        id: 1,
        sort: 1,
        value: '150+',
        label: '合作品牌',
        unit: '家',
        detail: '审核后的默认说明',
      },
      {
        id: 2,
        sort: 2,
        value: '54万',
        label: '直营仓储',
        unit: '㎡',
        detail: '审核后的仓储说明',
      },
    ]
    __setDirectusRequesterForTests(async (collection) =>
      collection === 'homepage_content'
        ? [
            {
              id: 1,
              stats: [
                { value: '135+', label: '合作品牌', unit: '家', detail: '后台维护的品牌说明' },
                { value: '48万', label: '直营仓储', unit: '㎡', detail: '后台维护的仓储说明' },
              ],
            },
          ]
        : []
    )

    await expect(getHomepageStats(reviewedStats)).resolves.toEqual([
      {
        id: 1,
        sort: 1,
        value: '135+',
        label: '合作品牌',
        unit: '家',
        detail: '后台维护的品牌说明',
      },
      {
        id: 2,
        sort: 2,
        value: '48万',
        label: '直营仓储',
        unit: '㎡',
        detail: '后台维护的仓储说明',
      },
    ])
  })

  it('uses reviewed fallbacks for critical collections when CMS is unavailable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const homepageFallback = [
      { id: 1, sort: 1, value: '150+', label: '合作品牌', unit: '家', detail: '鞋服品牌' },
    ]
    const serviceFallback = [
      {
        id: 1,
        sort: 1,
        slug: 'cloud-warehouse',
        icon: 'warehouse',
        name: '鞋服云仓',
        subtitle: '鞋服仓配',
        description: '仓配服务',
        features: ['库存管理'],
      },
    ]
    const warehouseFallback = [
      {
        id: 1,
        sort: 1,
        name: '黄埔仓',
        city: '广州',
        since: '',
        address: '广州市黄埔区',
        park: '',
        rent: '',
        height: '',
        highlight: '仓配服务',
      },
    ]
    const caseFallback = [
      {
        id: 1,
        sort: 1,
        slug: 'ur',
        category: '女装',
        label: 'UR',
        metrics: '库存 260万件+',
        details: '合作案例',
        tags: ['女装'],
        img: '/case.jpg',
      },
    ]
    __setDirectusRequesterForTests(async () => {
      throw new Error('CMS unavailable')
    })

    await expect(getHomepageStats(homepageFallback)).resolves.toEqual(homepageFallback)
    await expect(getServices(serviceFallback)).resolves.toEqual(serviceFallback)
    await expect(getWarehouses(warehouseFallback)).resolves.toEqual(warehouseFallback)
    await expect(getCases(caseFallback)).resolves.toEqual(caseFallback)
    expect(errorSpy).toHaveBeenCalled()
  })

  it.each([
    [
      'CMS is unavailable',
      async () => {
        throw new Error('CMS unavailable')
      },
    ],
    ['CMS returns no published rows', async () => []],
  ])('uses the reviewed FAQ fallback when %s', async (_scenario, requester) => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fallback = [{ q: '本地问题', a: '本地答案' }]
    __setDirectusRequesterForTests(requester)

    await expect(getFaqs('home', fallback)).resolves.toEqual(fallback)
    if (_scenario === 'CMS is unavailable') expect(errorSpy).toHaveBeenCalled()
  })

  it('falls back directly when the homepage singleton is unavailable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const requester = vi.fn(async (collection) => {
      if (collection === 'homepage_content') throw new Error('CMS unavailable')
      throw new Error(`legacy collection queried: ${collection}`)
    })
    const fallback = [
      { id: 1, sort: 1, value: '150+', label: '合作品牌', unit: '家', detail: '鞋服品牌' },
    ]
    __setDirectusRequesterForTests(requester)

    await expect(getHomepageStats(fallback)).resolves.toEqual(fallback)
    expect(requester).toHaveBeenCalledTimes(1)
    expect(requester).toHaveBeenCalledWith('homepage_content', expect.any(Object))
    errorSpy.mockRestore()
  })
})
