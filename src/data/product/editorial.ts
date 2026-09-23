import { SPECIALTY_LINKS } from '@/data/navigation'

const EDITORIAL_SERVICE_META = {
  '/xiefu-yuncang': {
    id: 'foundation',
    description: '全渠道一盘货与鞋服专用仓配。',
  },
  '/huadong-xiefu-yuncang': {
    id: 'east-china-warehouse',
    description: '华东区域仓网支持库存协同与退货质检。',
  },
  '/tuihuo-zhijian': {
    id: 'returns',
    description: '覆盖拆包核对、质检分级、修复分流与二次上架。',
  },
  '/houzheng-xiufu': {
    id: 'product-care-service',
    description: '覆盖清污、缝补、熨烫与补换标识，完成后二次质检。',
  },
  '/kuajing-yuncang': {
    id: 'cross-border-warehouse',
    description: '国内端仓储、项目质检、换标换包装与退货整理。',
  },
  '/zhibo-cangpei': {
    id: 'live-commerce-fulfillment',
    description: '多平台订单协同，以弹性产能应对爆单与退货处理。',
  },
  '/huanan-xiefu-yuncang': {
    id: 'south-china-warehouse',
    description: '华南区域仓网覆盖广州及珠三角，支持全渠道仓配、库存协同、退货质检与瑕疵修复。',
  },
  '/b2b-mendian-cangpei': {
    id: 'store-fulfillment',
    description: '连锁补货、批发铺货、分色分码分货与 ERP 协同。',
  },
} as const

const EDITORIAL_SERVICE_ORDER = {
  '/xiefu-yuncang': 1,
  '/tuihuo-zhijian': 2,
  '/houzheng-xiufu': 3,
  '/kuajing-yuncang': 4,
  '/huanan-xiefu-yuncang': 5,
  '/huadong-xiefu-yuncang': 6,
  '/zhibo-cangpei': 7,
  '/b2b-mendian-cangpei': 8,
} as const

const EDITORIAL_SERVICE_LINKS = SPECIALTY_LINKS.filter(
  (
    link
  ): link is Extract<
    (typeof SPECIALTY_LINKS)[number],
    { href: keyof typeof EDITORIAL_SERVICE_ORDER }
  > => link.href in EDITORIAL_SERVICE_ORDER
).toSorted(
  (left, right) => EDITORIAL_SERVICE_ORDER[left.href] - EDITORIAL_SERVICE_ORDER[right.href]
)

export const EDITORIAL_SERVICE_SERIES = EDITORIAL_SERVICE_LINKS.map(({ href, label }, index) => ({
  ...EDITORIAL_SERVICE_META[href],
  number: String(index + 1).padStart(2, '0'),
  title: label,
  href,
}))

export const EDITORIAL_NEEDS = [
  ['01', '新品到仓', '需要快速验收上架', '/xiefu-yuncang'],
  ['02', 'SKU 多', '管理复杂易出错', '/xiefu-yuncang'],
  ['03', '订单量波动大', '需要灵活应对', '/xiefu-yuncang'],
  ['04', '退货频率高', '需要快速处理与分类', '/tuihuo-zhijian'],
  ['05', '可售商品', '需要重新整理后上架', '/tuihuo-zhijian'],
  ['06', '标签 / 包装 / 套餐', '需要专业化处理', '/houzheng-xiufu'],
] as const

export const EDITORIAL_CARE_CATEGORIES = [
  ['01', '分类处理', '质检 / 清洁 / 分类'],
  ['02', '外观重整', '换标 / 换包 / 换箱'],
  ['03', '包装优化', '单品 / 组合 / 定制'],
  ['04', '轻微修复', '简单修复 / 状态复核'],
] as const

export const EDITORIAL_PROCESS = [
  ['01', '到货验收', '核对数量与状态'],
  ['02', '商品入库', '系统登记上架'],
  ['03', '拣货分拣', '按单精准拣货'],
  ['04', '打包出库', '复核打包发货'],
  ['05', '运输跟踪', '关键节点可查'],
  ['06', '完成交付', '签收与反馈'],
] as const
