import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getClaimPresentation } from '@/lib/claims'
import { __setDirectusRequesterForTests, getHomepageStats } from '@/lib/directus'

describe('homepage CMS claim references', () => {
  beforeEach(() => {
    __setDirectusRequesterForTests(null)
    vi.restoreAllMocks()
  })

  afterEach(() => {
    __setDirectusRequesterForTests(null)
    vi.restoreAllMocks()
  })

  it('uses the reviewed claim when CMS supplies a valid claimKey and conflicting text', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const approved = getClaimPresentation('partnerBrands', 'home')
    __setDirectusRequesterForTests(async () => [
      {
        id: 1,
        stats: [
          {
            claimKey: 'partnerBrands',
            value: 'CMS冲突值',
            unit: 'CMS冲突单位',
            label: '合作品牌',
            detail: '后台说明',
          },
        ],
      },
    ])

    const [stat] = await getHomepageStats()
    expect(stat).toMatchObject({
      claimKey: 'partnerBrands',
      value: approved.value,
      unit: approved.unit,
      label: '合作品牌',
      detail: '后台说明',
    })
    expect(JSON.stringify(stat)).not.toContain('CMS冲突值')
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('[claims:conflict]'))
  })

  it('rejects an unknown claimKey instead of trusting CMS text', async () => {
    __setDirectusRequesterForTests(async () => [
      {
        id: 1,
        stats: [
          {
            claimKey: 'unknownClaim',
            value: '任意值',
            unit: '',
            label: '未知',
            detail: '',
          },
        ],
      },
    ])

    await expect(getHomepageStats()).rejects.toThrow(/unknown_claim.*unknownClaim/i)
  })

  it('resolves legacy homepage records only through the explicit stable-id mapping', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const approved = getClaimPresentation('partnerBrands', 'home')
    __setDirectusRequesterForTests(async () => [
      {
        id: 1,
        stats: [
          {
            id: 1,
            value: '旧值',
            unit: '家',
            label: '合作品牌',
            detail: '鞋服及相关细分行业',
          },
        ],
      },
    ])

    const [stat] = await getHomepageStats()
    expect(stat).toMatchObject({
      claimKey: 'partnerBrands',
      value: approved.value,
      unit: approved.unit,
    })
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('[claims:legacy]'))
  })

  it('rejects matching legacy display text when no stable id is present', async () => {
    __setDirectusRequesterForTests(async () => [
      {
        id: 1,
        stats: [
          {
            value: '旧值',
            unit: '家',
            label: '合作品牌',
            detail: '鞋服及相关细分行业',
          },
        ],
      },
    ])

    await expect(getHomepageStats()).rejects.toThrow(/legacy_mapping_missing.*missing_id/i)
  })

  it('does not infer a claimKey from a CMS value when legacy mapping misses', async () => {
    const approved = getClaimPresentation('partnerBrands', 'home')
    __setDirectusRequesterForTests(async () => [
      {
        id: 1,
        stats: [
          {
            id: 999,
            value: approved.text,
            unit: '',
            label: '看似匹配但无稳定标识',
            detail: '',
          },
        ],
      },
    ])

    await expect(getHomepageStats()).rejects.toThrow(/legacy_mapping_missing.*999/i)
  })
})
