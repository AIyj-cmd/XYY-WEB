import { describe, expect, it, vi } from 'vitest'
import { CLAIM_TEXT } from '../../src/lib/claims'
import { APPROVED_HOMEPAGE_STATS } from '../../scripts/data/approved-homepage-stats.mjs'
import { buildPatch } from '../../scripts/lib/cms-sync-runtime.mjs'
import {
  findUniqueRecord,
  fixedCollectionMatches,
} from '../../scripts/lib/fixed-collection-sync.mjs'
import {
  syncWarehouses,
  warehousePayload,
  warehousesMatchApproved,
} from '../../scripts/lib/warehouse-sync.mjs'

const target = {
  name: '黄埔仓',
  aliases: ['黄埔仓', '旧黄埔仓'],
  city: '广州',
  sort: 1,
}

describe('CMS content sync domains', () => {
  it('keeps approved homepage scale statistics aligned with the public claim registry', () => {
    const approvedByLabel = Object.fromEntries(
      APPROVED_HOMEPAGE_STATS.map(({ value, unit, label }) => [label, `${value}${unit}`])
    )

    expect(approvedByLabel).toMatchObject({
      合作品牌: `${CLAIM_TEXT.partnerBrands}家`,
      直营仓储: CLAIM_TEXT.warehouseArea,
      覆盖城市: `${CLAIM_TEXT.coveredCities}个`,
      管理SKU: CLAIM_TEXT.managedSkus,
      服务门店: `${CLAIM_TEXT.servedStores}家`,
    })
    expect(CLAIM_TEXT.employeeCount).toBe('1500+')
  })

  it('builds patches only for changed fields', () => {
    expect(
      buildPatch({ value: '150+', label: '品牌' }, { value: '150+', label: '服务品牌' }, [
        'value',
        'label',
      ])
    ).toEqual({ label: '服务品牌' })
  })

  it('matches fixed collections by semantic keys instead of database IDs', () => {
    const records = [{ id: 81, sort: 1, value: '150+', status: 'published' }]
    const targets = [{ id: 1, sort: 1, value: '150+' }]

    expect(findUniqueRecord(records, targets[0], ['sort'], 'homepage_stats').id).toBe(81)
    expect(fixedCollectionMatches(records, targets, ['sort'], ['sort', 'value'])).toBe(true)
  })

  it('removes aliases from warehouse payloads', () => {
    expect(warehousePayload(target)).toEqual({
      name: '黄埔仓',
      city: '广州',
      sort: 1,
      status: 'published',
    })
  })

  it('updates an alias match and archives only approved legacy records', async () => {
    const runtime = {
      createWarehouse: vi.fn(),
      patchRecord: vi.fn(async (_collection, current, patch) => ({ ...current, ...patch })),
    }
    await syncWarehouses({
      records: [
        { id: 7, name: '旧黄埔仓', city: '广州', sort: 2, status: 'published' },
        { id: 8, name: '智谷仓', status: 'published' },
      ],
      targets: [target],
      legacyNames: ['智谷仓'],
      runtime,
    })

    expect(runtime.createWarehouse).not.toHaveBeenCalled()
    expect(runtime.patchRecord).toHaveBeenCalledTimes(2)
    expect(runtime.patchRecord).toHaveBeenNthCalledWith(
      2,
      'warehouses',
      expect.objectContaining({ id: 8 }),
      { status: 'archived' },
      ['status']
    )
  })

  it('verifies the complete approved warehouse set and legacy archive state', () => {
    const approvedRecord = { id: 7, ...warehousePayload(target) }
    expect(warehousesMatchApproved([approvedRecord], [target], ['智谷仓'])).toBe(true)
    expect(
      warehousesMatchApproved(
        [approvedRecord, { id: 8, name: '智谷仓', status: 'published' }],
        [target],
        ['智谷仓']
      )
    ).toBe(false)
  })
})
