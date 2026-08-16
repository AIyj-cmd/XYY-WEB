import { describe, expect, it } from 'vitest'

import {
  APPROVED_WAREHOUSES,
  LEGACY_WAREHOUSE_NAMES,
} from '../../scripts/data/approved-warehouses.mjs'
import { groupWarehouses } from '../../src/data/about/warehouses'
import { WAREHOUSES } from '../../src/data/brand/organization'

const REVIEWED_ADDRESSES = {
  兴泰仓: '广东省广州市番禺区石楼镇华山路2号',
  新塘仓: '暂不公布',
  佛山宏盛仓: '广东省佛山市三水区大塘镇大塘园区园东一路',
  昆山花桥仓: '江苏省苏州市昆山市鸡鸣塘南路936号院内A8-2F',
  合肥联亚仓: '安徽省合肥市蜀山区紫蓬路2886号',
} as const

describe('about warehouse regions', () => {
  it('keeps the three reviewed Dongguan warehouses and their addresses together', () => {
    const groups = groupWarehouses(WAREHOUSES.map((warehouse) => ({ ...warehouse })))
    const dongguan = groups.south.find(({ city }) => city === '东莞')

    expect(dongguan?.items.map(({ name }) => name)).toEqual(['智谷仓', '朗州仓', '桥头仓'])
    expect(dongguan?.items.every(({ address }) => !address.startsWith('具体地址'))).toBe(true)
  })

  it('keeps reviewed CMS seed data aligned with the public Dongguan list', () => {
    const dongguan = APPROVED_WAREHOUSES.filter(({ city }) => city === '东莞')

    expect(dongguan.map(({ name }) => name)).toEqual(['智谷仓', '朗州仓', '桥头仓'])
    expect(new Set(dongguan.map(({ content_key }) => content_key)).size).toBe(3)
    expect(LEGACY_WAREHOUSE_NAMES).toEqual(['东莞云谷仓'])
  })

  it.each(Object.entries(REVIEWED_ADDRESSES))(
    'keeps the reviewed %s address aligned between fallback and CMS seed',
    (name, address) => {
      expect(WAREHOUSES.find((warehouse) => warehouse.name === name)?.address).toBe(address)
      expect(APPROVED_WAREHOUSES.find((warehouse) => warehouse.name === name)?.address).toBe(
        address
      )
    }
  )
})
