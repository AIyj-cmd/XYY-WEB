import type { SiteLocale } from '@/i18n/routes'

export const EAST_UI_COPY = {
  'zh-CN': {
    businessKicker: '一份库存，多种订单',
    businessHeading: '一份库存，服务不同订单',
    collaborationFallbackHeading: '多仓库存，一起管理',
    collaborationFallbackDesc: '华东与华南库存统一查看，根据订单地区和约定规则安排发货仓库。',
    collaborationItems: [
      ['统一看库存', '华东与华南库存统一查看，方便掌握可用货品。'],
      ['按规则发货', '根据订单地区、库存和约定规则安排发货仓库。'],
      ['跟进补货与对账', '围绕库存变化、补货节奏和订单状态持续跟进。'],
    ],
    faqHeading: '关于华东仓配，你可能还想了解',
    ctaEyebrow: '咨询华东仓配',
    ctaLines: ['聊聊你的华东', '仓配需求'],
    ctaDesc: '告诉我们货品类型、订单去向和补货节奏，一起安排合适的仓库与服务。',
    contact: '咨询华东仓配',
    prep: [
      ['货品类型', '商品品类与规格特点'],
      ['订单去向', '主要收货地区与渠道'],
      ['补货节奏', '门店补货与订单安排'],
    ],
    cases: '查看合作案例',
    services: '查看全部仓配服务',
    heroFallback: '华东鞋服云仓',
    heroClaim: ['让发货，', '更贴近你的市场'],
    cities: ['上海', '昆山', '合肥'],
    warehouseLink: '查看仓库分布',
    serviceVideo: '服务视频',
    warehouseKicker: '华东仓配服务',
    warehouseFallbackHeading: '华东仓库分布',
    warehouseFallbackDesc:
      '上海、昆山、合肥，按你的库存布局与订单需求安排仓配服务。各仓均具备质检能力。',
    serviceKicker: '服务安排',
    serviceHeading: '发货时间清楚，费用提前说明',
    serviceSections: [
      [
        '什么时候发',
        '符合条件的订单按约定安排发出。华东主要城市可参考次日达，实际送达时间结合收货地址和承运线路确认。',
      ],
      [
        '费用怎么计',
        '仓储和作业费用结合货品、库存、订单及所需服务报价；接口实施、定制和增值服务费用另行说明。',
      ],
    ],
    unavailable: '服务内容暂不可用',
    warehouses: [
      { city: '上海', name: '青浦仓', address: '上海市青浦区白鹤镇外青松公路3939号B-3-3' },
      { city: '昆山', name: '花桥仓', address: '江苏省苏州市昆山市鸡鸣塘南路936号院内A8-2F' },
      { city: '合肥', name: '联亚仓（合肥仓）', address: '安徽省合肥市蜀山区紫蓬路2886号' },
    ],
  },
  en: {
    businessKicker: 'One inventory pool, multiple order types',
    businessHeading: 'One inventory pool for different order types',
    collaborationFallbackHeading: 'Manage inventory across warehouses together',
    collaborationFallbackDesc:
      'View East and South China inventory together, then arrange the fulfilment warehouse by order region and agreed rules.',
    collaborationItems: [
      [
        'View inventory together',
        'View East and South China inventory together to understand available stock.',
      ],
      [
        'Dispatch by agreed rules',
        'Arrange the fulfilment warehouse by order region, stock and agreed rules.',
      ],
      [
        'Follow replenishment and reconciliation',
        'Follow inventory changes, replenishment rhythm and order status.',
      ],
    ],
    faqHeading: 'More about East China fulfilment',
    ctaEyebrow: 'Discuss East China fulfilment',
    ctaLines: ['Plan your East China', 'fulfilment requirements'],
    ctaDesc:
      'Share your item types, order destinations and replenishment rhythm so we can discuss suitable warehouses and services.',
    contact: 'Discuss East China fulfilment',
    prep: [
      ['Item types', 'Product categories and specification characteristics'],
      ['Order destinations', 'Primary delivery regions and channels'],
      ['Replenishment rhythm', 'Store replenishment and order arrangements'],
    ],
    cases: 'View cases',
    services: 'Explore services',
    heroFallback: 'East China apparel fulfilment',
    heroClaim: ['Bring dispatch', 'closer to your market'],
    cities: ['Shanghai', 'Kunshan', 'Hefei'],
    warehouseLink: 'View warehouse locations',
    serviceVideo: 'service video',
    warehouseKicker: 'East China fulfilment',
    warehouseFallbackHeading: 'East China warehouse locations',
    warehouseFallbackDesc:
      'Warehouses in Shanghai, Kunshan and Hefei are arranged around your inventory layout and order needs. Every warehouse has inspection capability.',
    serviceKicker: 'Service arrangements',
    serviceHeading: 'Clarify dispatch timing and charges in advance',
    serviceSections: [
      [
        'Dispatch timing',
        'Eligible orders are dispatched as agreed. Next-day delivery may be available for major East China cities; actual delivery timing is confirmed against the delivery address and carrier route.',
      ],
      [
        'How charges are calculated',
        'Storage and handling charges are quoted against the goods, inventory, orders and required services. Interface implementation, customisation and value-added services are confirmed separately.',
      ],
    ],
    unavailable: 'Service content is currently unavailable.',
    warehouses: [
      {
        city: 'Shanghai',
        name: 'Qingpu warehouse',
        address: 'B-3-3, 3939 Waiqingsong Highway, Baihe Town, Qingpu District, Shanghai',
      },
      {
        city: 'Kunshan',
        name: 'Huaqiao warehouse',
        address: 'A8-2F, 936 Jimingtang South Road, Kunshan, Suzhou, Jiangsu',
      },
      {
        city: 'Hefei',
        name: 'Lianya warehouse (Hefei)',
        address: '2886 Zipeng Road, Shushan District, Hefei, Anhui',
      },
    ],
  },
} as const

export function eastUi(locale: SiteLocale = 'zh-CN') {
  return EAST_UI_COPY[locale]
}
