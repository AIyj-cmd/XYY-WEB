import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __setDirectusRequesterForTests,
  __setDirectusTimeoutForTests,
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

  afterEach(() => {
    __setDirectusRequesterForTests(null)
    __setDirectusTimeoutForTests()
    vi.unstubAllGlobals()
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
                {
                  value: '135+',
                  label: '合作品牌',
                  unit: '家',
                  detail: '后台维护的品牌说明',
                },
                {
                  value: '48万',
                  label: '直营仓储',
                  unit: '㎡',
                  detail: '后台维护的仓储说明',
                },
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

  it('uses reviewed fallbacks and logs the collection when the CMS network is unavailable', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
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
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('[directus:fallback] collection=homepage_content')
    )
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('reason=network'))
  })

  it('keeps a successful empty FAQ response empty instead of restoring old FAQs', async () => {
    const fallback = [{ q: '本地问题', a: '本地答案' }]
    __setDirectusRequesterForTests(async () => [])

    await expect(getFaqs('home', fallback)).resolves.toEqual([])
  })

  it('keeps successful empty service and case collections empty', async () => {
    __setDirectusRequesterForTests(async () => [])

    await expect(
      getServices([
        {
          id: 1,
          sort: 1,
          slug: 'old-service',
          icon: 'warehouse',
          name: '旧服务',
          subtitle: '旧副标题',
          description: '旧说明',
          features: [],
        },
      ])
    ).resolves.toEqual([])
    await expect(
      getCases([
        {
          id: 1,
          slug: 'old-case',
          category: '旧分类',
          label: '旧案例',
          metrics: '旧数据',
          details: '旧说明',
          tags: [],
          img: '/old.webp',
        },
      ])
    ).resolves.toEqual([])
  })

  it('falls back directly when the homepage singleton is unavailable', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
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
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('[directus:fallback] collection=homepage_content')
    )
  })
})
