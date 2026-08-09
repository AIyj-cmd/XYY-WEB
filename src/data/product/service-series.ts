export const SERVICE_SERIES = [
  {
    id: 'foundation',
    number: '01',
    eyebrow: 'FOUNDATION FULFILLMENT',
    title: '基础仓配',
    description: '适合需要稳定完成入库、仓储、拣货、复核、打包和发货的鞋服品牌。',
    steps: null,
    services: [
      ['入库质检', '/xiefu-yuncang'],
      ['仓储管理', '/xiefu-yuncang'],
      ['订单履约', '/xiefu-yuncang'],
      ['系统与平台对接', '/wuliu-shuzihua'],
    ],
    image: '/images/services/inspection-workbench.webp',
    alt: '新亦源鞋服入库质检与作业工作台',
    href: '/xiefu-yuncang',
    link: '查看基础仓配服务',
  },
  {
    id: 'returns',
    number: '02',
    eyebrow: 'RETURNS & REVERSE LOGISTICS',
    title: '退货与逆向处理',
    description:
      '退回来的商品，我们进行拆包、验收、分类与评估，并根据商品状态提供二次上架、退供应商或其他处理方案，实现高效、合规的逆向物流闭环。',
    steps: [
      ['退货接收', '与登记', '/tuihuo-zhijian'],
      ['商品状态', '判断', '/tuihuo-zhijian'],
      ['分类处理', '与决策', '/tuihuo-zhijian'],
      ['二次上架或', '退件处理', '/tuihuo-zhijian'],
    ],
    services: [
      ['退货接收与质检', '/tuihuo-zhijian'],
      ['二次上架', '/tuihuo-zhijian'],
      ['退回供应商', '/tuihuo-zhijian'],
      ['整批退仓', '/tuihuo-zhijian'],
    ],
    image: '/images/services/return-inspection-operator.jpg',
    alt: '新亦源工作人员处理鞋服退货商品',
    href: '/tuihuo-zhijian',
    link: '查看退货处理服务',
  },
  {
    id: 'care',
    number: '03',
    eyebrow: 'PRODUCT CARE',
    title: '商品整理与增值处理',
    description:
      '根据商品状态，提供标签更换、包装升级、蒸汽熨烫、外观整理、轻微瑕疵处理及组合加工等精细化服务，提升商品呈现，助力销售转化。',
    steps: null,
    services: [
      ['换标与包装', '/houzheng-xiufu'],
      ['熨烫与外观整理', '/houzheng-xiufu'],
      ['轻微瑕疵处理', '/houzheng-xiufu'],
      ['组合加工', '/houzheng-xiufu'],
    ],
    image: '/images/services/quality-inspection-operator.jpg',
    alt: '新亦源工作人员进行鞋服商品整理与检查',
    href: '/houzheng-xiufu',
    link: '查看商品整理与增值处理',
  },
] as const

export type ServiceSeriesItem = (typeof SERVICE_SERIES)[number]
