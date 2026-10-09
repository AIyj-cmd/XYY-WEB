import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getClaimPresentation } from '@/lib/claims'
import { __setDirectusRequesterForTests, getHomepageStats } from '@/lib/directus'

const homepageRecord = {
  id: 1,
  status: 'published',
  key: 'home',
  stats: [{ claimKey: 'partnerBrands', label: '合作品牌', detail: '鞋服品牌' }],
}

function homepageFetch(record: Record<string, unknown> | null) {
  return vi.fn<typeof fetch>(async (input) => {
    const url = new URL(String(input))
    expect(url.pathname).toBe('/items/homepage_content')

    const fields = url.searchParams.get('fields')?.split(',') ?? []
    const projected =
      record === null
        ? null
        : Object.fromEntries(
            fields.flatMap((field) => (field in record ? [[field, record[field]]] : []))
          )

    return Response.json({ data: projected })
  })
}

function fallback() {
  const approved = getClaimPresentation('warehouseArea', 'home')
  return [
    {
      id: 2,
      sort: 2,
      claimKey: 'warehouseArea' as const,
      value: approved.value,
      label: '旧审核统计',
      unit: approved.unit,
      detail: '不应回退',
    },
  ]
}

describe('homepage CMS singleton status contract', () => {
  beforeEach(() => {
    __setDirectusRequesterForTests(null)
    vi.stubEnv('DIRECTUS_URL', 'https://directus.test')
    vi.stubEnv('DIRECTUS_CONTENT_TOKEN', 'homepage-contract-token')
  })

  afterEach(() => {
    __setDirectusRequesterForTests(null)
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('projects requested fields at the fetch boundary and accepts published content', async () => {
    const fetchMock = homepageFetch(homepageRecord)
    vi.stubGlobal('fetch', fetchMock)
    const approved = getClaimPresentation('partnerBrands', 'home')

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
    expect(
      new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams.get('fields')?.split(',')
    ).toEqual(expect.arrayContaining(['id', 'status', 'stats']))
  })

  it('keeps draft and successful empty singleton responses empty without falling back', async () => {
    for (const record of [
      { ...homepageRecord, status: 'draft' },
      { ...homepageRecord, stats: [] },
      null,
    ]) {
      vi.stubGlobal('fetch', homepageFetch(record))
      await expect(getHomepageStats(fallback())).resolves.toEqual([])
    }
  })

  it.each([
    ['archived', { ...homepageRecord, status: 'archived' }],
    ['missing', { id: 1, key: 'home', stats: homepageRecord.stats }],
    ['null', { ...homepageRecord, status: null }],
    ['unknown', { ...homepageRecord, status: 'review' }],
  ])('rejects %s singleton status as invalid data without falling back', async (_label, record) => {
    vi.stubGlobal('fetch', homepageFetch(record))

    await expect(getHomepageStats(fallback())).rejects.toThrow(
      /\[directus:invalid\].*homepage_content.*read_singleton.*invalid_data/i
    )
  })

  it('preserves invalid stats failures after status validation', async () => {
    vi.stubGlobal('fetch', homepageFetch({ ...homepageRecord, stats: null }))

    await expect(getHomepageStats(fallback())).rejects.toThrow(
      /\[directus:invalid\].*homepage_content.*read_singleton.*invalid_data/i
    )
  })
})
