import type { Warehouse } from '@/lib/directus'
import type { WarehouseGroup } from './types'

export const ABOUT_WAREHOUSE_TIERS = [
  {
    abbr: 'CDC',
    name: '中心仓',
    accent: '#B94116',
    desc: '华南总部，一仓发全国，支持全渠道大规模库存管理与智能分波次发货',
    locationKey: 'south',
    tags: ['总仓调拨', '全渠道发货', '智能分波'],
  },
  {
    abbr: 'RDC',
    name: '区域仓',
    accent: '#3B6FCC',
    desc: '布局华东区域节点，支持区域补铺与就近发货，帮助优化跨区域干线运输成本和到达时效',
    location: '昆山 · 上海 · 合肥，其中上海仓位于上海市青浦区白鹤镇外青松公路3939号B-3-3',
    tags: ['区域补货', '就近发货', '降低损耗'],
  },
  {
    abbr: 'FDC',
    name: '产地仓',
    accent: '#047857',
    desc: '直接对接生产端，产地直发，压缩仓储成本，加快新货上架时效',
    location: '湖北监利仓点，具体地址与启用范围按项目核验',
    tags: ['产地直发', '快速上架', '弹性配置'],
  },
]

const CITY_CONFIG: Record<string, { color: string; label: string }> = {
  广州: { color: '#B94718', label: '广州' },
  东莞: { color: '#3B6FCC', label: '东莞' },
  佛山: { color: '#7C3AED', label: '佛山' },
  肇庆: { color: '#047857', label: '肇庆' },
  昆山: { color: '#0E7490', label: '昆山' },
  上海: { color: '#DC2626', label: '上海' },
  合肥: { color: '#92400E', label: '合肥' },
}

export function groupWarehouses(warehouses: Warehouse[]) {
  const build = (cities: string[]) =>
    cities
      .map((city) => ({
        city,
        cfg: CITY_CONFIG[city],
        items: warehouses.filter((w) => w.city === city),
      }))
      .filter((group) => group.items.length > 0) as WarehouseGroup[]

  return {
    south: build(['广州', '东莞', '佛山', '肇庆']),
    east: build(['昆山', '上海', '合肥']),
  }
}
