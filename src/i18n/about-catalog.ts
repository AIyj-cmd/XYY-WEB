import { WAREHOUSES } from '@/lib/brand'
import type { Warehouse } from '@/lib/directus'

const catalog: Record<number, Pick<Warehouse, 'name' | 'city' | 'address' | 'highlight'>> = {
  1: {
    name: 'Huangpu Warehouse',
    city: 'Guangzhou',
    address: '2 Guoyuan 1st Road, Huangpu District, Guangzhou, Guangdong',
    highlight:
      'Warehouse capacity, operating scope and available services are confirmed in the agreed project plan.',
  },
  2: {
    name: 'Xingtai Warehouse',
    city: 'Guangzhou',
    address: '2 Huashan Road, Shilou Town, Panyu District, Guangzhou, Guangdong',
    highlight:
      'Warehouse capacity, operating scope and available services are confirmed in the agreed project plan.',
  },
  3: {
    name: 'Xintang Warehouse',
    city: 'Guangzhou',
    address: 'Address not published',
    highlight:
      'Warehouse capacity, operating scope and available services are confirmed in the agreed project plan.',
  },
  4: {
    name: 'Zhigu Warehouse',
    city: 'Dongguan',
    address: 'Changping Zhigu, 2 Duobao Road, Changping Town, Dongguan',
    highlight:
      'Near the expressway, with a high-clearance ground floor, loading platforms and freight-lift access.',
  },
  5: {
    name: 'Langzhou Warehouse',
    city: 'Dongguan',
    address: 'Hongtengyuan Industrial Park, Langzhou Village, Changping Town, Dongguan',
    highlight:
      'Dedicated e-commerce freight lifts and transfer space support efficient inbound and outbound handling.',
  },
  6: {
    name: 'Qiaotou Warehouse',
    city: 'Dongguan',
    address: 'Changping Qiaotou, 2 Duobao Road, Qiaotou Town, Dongguan',
    highlight:
      'Near the Dongbu Expressway, with an open floor plate, efficient flow and flexible capacity expansion.',
  },
  7: {
    name: 'Dongguan Yungu Warehouse',
    city: 'Dongguan',
    address: 'Address not published',
    highlight:
      'Warehouse capacity, operating scope and available services are confirmed in the agreed project plan.',
  },
  8: {
    name: 'Hongsheng Warehouse',
    city: 'Foshan',
    address: 'Yuan East 1st Road, Datang Industrial Park, Sanshui District, Foshan, Guangdong',
    highlight:
      'Warehouse capacity, operating scope and available services are confirmed in the agreed project plan.',
  },
  9: {
    name: 'Zhaoqing Warehouse',
    city: 'Zhaoqing',
    address: 'Warehouse 20, Vipshop Logistics Park, Dongcheng Subdistrict, Sihui, Zhaoqing',
    highlight:
      'Located in the Vipshop logistics park, with automated packing lines and concentrated courier resources.',
  },
  10: {
    name: 'Kunshan Huaqiao Warehouse',
    city: 'Kunshan',
    address: 'A8-2F, 936 Jimingtang South Road, Kunshan, Suzhou, Jiangsu',
    highlight:
      'Warehouse capacity, operating scope and available services are confirmed in the agreed project plan.',
  },
  11: {
    name: 'Shanghai Qingpu Huijin Warehouse',
    city: 'Shanghai',
    address: 'B-3-3, 3939 Waiqingsong Road, Baihe Town, Qingpu District, Shanghai',
    highlight:
      'Warehouse capacity, operating scope and available services are confirmed in the agreed project plan.',
  },
  12: {
    name: 'Hefei Lianya Warehouse',
    city: 'Hefei',
    address: '2886 Zipeng Road, Shushan District, Hefei, Anhui',
    highlight:
      'Warehouse capacity, operating scope and available services are confirmed in the agreed project plan.',
  },
}

const snapshots: Map<number, (typeof WAREHOUSES)[number]> = new Map(
  WAREHOUSES.map((warehouse) => [warehouse.id, warehouse])
)
const reportWarehouseOmission = (id: number) =>
  console.warn(`[i18n:about] omitted warehouse: ${id}`)

export function translateAboutWarehouses(items: Warehouse[]): Warehouse[] {
  return items.flatMap((item) => {
    const source = snapshots.get(item.id)
    const english = catalog[item.id]
    if (
      !source ||
      !english ||
      source.name !== item.name ||
      source.city !== item.city ||
      source.address !== item.address ||
      source.highlight !== item.highlight
    ) {
      reportWarehouseOmission(item.id)
      return []
    }
    return [
      {
        ...item,
        ...english,
      },
    ]
  })
}
