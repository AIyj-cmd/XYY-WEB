import type { EnglishServiceSource } from './service-sources'
import { sourceContent } from './service-sources'

const sourceStats = [
  { stat: '11家', label: '主流承运商接入', sub: '顺丰、京东、EMS等' },
  { stat: '多场景', label: '正逆向寄件', sub: '寄件、调拨与退仓' },
  { stat: '全链路', label: '运单状态查询', sub: '轨迹、签收与异常' },
  { stat: '最高50%', label: '部分线路费用节省', sub: '以实际线路报价为准' },
]

const sourceFeatures = [
  {
    title: '多承运商统一接入',
    desc: '已对接顺丰、京东、EMS等11家主流承运商，门店和企业可从同一业务入口发起寄件。',
  },
  {
    title: '线路与服务匹配',
    desc: '结合寄件线路、货量、价格和时效要求匹配承运方案，减少门店人工反复比较。',
  },
  {
    title: '正向与逆向协同',
    desc: '覆盖门店寄件、门店调拨、退仓寄回和企业日常寄件等不同业务方向。',
  },
  {
    title: '运单与轨迹查询',
    desc: '集中查看运单生成、运输轨迹、签收和异常状态，方便业务与客服持续跟进。',
  },
  {
    title: '异常工单处理',
    desc: '通过在线工单和专属客服保留异常处理记录，明确责任节点并推动问题闭环。',
  },
  {
    title: '数据与权限管理',
    desc: '按组织、门店和角色配置操作权限，汇总寄件数据、承运表现与结果报表。',
  },
]

const sourceFaqs = [
  {
    q: '运到智能寄件平台主要解决什么问题？',
    a: '主要解决门店或企业寄件渠道分散、线路选择依赖经验、运单状态难以集中查询、异常处理缺少记录以及寄件数据难以统一汇总的问题。',
  },
  {
    q: '平台目前可以接入哪些承运商？',
    a: '目前已接入顺丰、京东、EMS等11家主流承运商。具体可选承运商、线路范围和服务类型，会根据寄件地址、货量、时效及项目合作方案确认。',
  },
  {
    q: '门店调拨和退仓寄回也可以统一管理吗？',
    a: '可以。平台可承接门店日常寄件、门店间调拨、过季商品退仓寄回和企业日常寄件等正逆向业务，并集中保留相应运单和状态记录。',
  },
  {
    q: '平台会自动保证最低价格或固定时效吗？',
    a: '不会做无条件承诺。平台会结合实际线路、货量、价格和时效要求辅助匹配方案，最终价格、承运范围与时效以承运商规则和双方确认的合作方案为准。',
  },
  {
    q: '发生运输异常后如何处理？',
    a: '业务人员可以根据运单状态识别异常，并通过在线工单或专属客服发起处理。处理过程和结果可形成记录，便于后续查询、复盘与业务管理。',
  },
]

export const YUNDAO_ENGLISH_SOURCE: EnglishServiceSource = {
  source: sourceContent(
    {
      title: '运到智能寄件平台｜门店寄件、调拨与退仓协同｜新亦源',
      description:
        '运到智能寄件平台统一接入顺丰、京东、EMS等主流承运商，为连锁门店、电商平台和企业机构提供寄件、调拨、退仓、轨迹查询与异常工单协同。',
      breadcrumbLabel: '运到智能寄件平台',
      eyebrow: '运到智能寄件平台 · 商圈物流O2O服务',
      h1: '门店寄件、调拨与退仓协同',
      h1sub: '11家主流承运商统一接入',
      heroDesc:
        '运到连接连锁门店、电商平台、企业机构与主流承运商，统一管理下单、线路匹配、轨迹查询、异常工单和寄件报表。',
      imgSrc: '/images/services/carrier-console.webp',
      imgAlt: '运到智能寄件平台运单管理界面',
      contentDesc:
        '适合需要统一管理多门店、多组织或多承运商寄件业务的品牌与企业。运到不是单一快递下单工具，而是将需求提交、方案匹配、运单生成、运输跟踪、异常处理和数据回看连接在同一条业务链路中；具体承运范围、计费与时效以实际线路和承运服务规则为准。',
      featuresLabel: '平台服务能力',
    },
    sourceStats,
    sourceFeatures
  ),
  english: sourceContent(
    {
      title: 'Smart shipping platform | Store shipping, transfers and return coordination',
      description:
        'Coordinate store shipping, transfers, return-to-warehouse requests, tracking and exception follow-up through a route-specific carrier plan.',
      breadcrumbLabel: 'Smart shipping platform',
      eyebrow: 'Smart shipping platform · retail and business shipping coordination',
      h1: 'Store shipping, transfers and returns',
      h1sub: 'Multi-carrier coordination for shipping, transfers and return-to-warehouse requests',
      heroDesc:
        'Coordinate booking, route matching, tracking, exception work orders and shipping reporting for stores, e-commerce operations and organisations. Carrier coverage, quotes and timing are confirmed for each route and service plan.',
      imgSrc: '/images/services/carrier-console.webp',
      imgAlt: 'Smart shipping platform waybill-management interface',
      contentDesc:
        'For brands and organisations coordinating shipping across multiple stores, teams or carriers. Smart shipping connects requests, route planning, waybill creation, transport tracking, exception handling and reporting in one operating flow. Carrier coverage, quoted terms and timing follow the actual route and carrier rules.',
      featuresLabel: 'Platform capability',
    },
    [
      {
        stat: 'Multi-carrier',
        label: 'Carrier connection',
        sub: 'Confirmed by route and service plan',
      },
      {
        stat: 'Multiple scenarios',
        label: 'Outbound and return shipping',
        sub: 'Shipping, transfers and return-to-warehouse requests',
      },
      {
        stat: 'End-to-end',
        label: 'Waybill status review',
        sub: 'Tracking, delivery confirmation and exceptions',
      },
      {
        stat: 'Route-specific',
        label: 'Quoted shipping terms',
        sub: 'Confirmed by carrier rules and agreement',
      },
    ],
    [
      {
        title: 'Unified carrier connection',
        desc: 'Coordinate approved carrier options through one operating entry for stores and organisations.',
      },
      {
        title: 'Route and service matching',
        desc: 'Match a carrier plan around route, shipment volume, quoted terms and timing requirements.',
      },
      {
        title: 'Outbound and return coordination',
        desc: 'Coordinate store shipping, store transfers, return-to-warehouse and organisation shipping flows.',
      },
      {
        title: 'Waybill and tracking review',
        desc: 'Review waybill creation, transport tracking, delivery confirmation and exception status in one place.',
      },
      {
        title: 'Exception work-order handling',
        desc: 'Keep exception handling records through online work orders and agreed support channels.',
      },
      {
        title: 'Data and permission management',
        desc: 'Set access by organisation, store and role, then review shipping and carrier-performance records.',
      },
    ]
  ),
  sourceFaqs,
  englishFaqs: [
    {
      q: 'What problems does the smart shipping platform address?',
      a: 'It coordinates fragmented store or organisation shipping channels, route choices, waybill-status review, exception records and shipping-data review through one operating flow.',
    },
    {
      q: 'Which carriers can the platform connect to?',
      a: 'Available carriers, route coverage and service types are confirmed against the pickup address, shipment volume, timing requirements and project service plan.',
    },
    {
      q: 'Can store transfers and return-to-warehouse shipping be managed together?',
      a: 'Yes. The operating flow can coordinate daily store shipping, store transfers, seasonal return-to-warehouse requests and organisation shipping, retaining related waybill and status records.',
    },
    {
      q: 'Does the platform guarantee the lowest price or fixed transit timing?',
      a: 'No unconditional promise is made. Carrier options are assessed around the actual route, volume, quoted terms and timing requirements; final terms follow carrier rules and the agreed service plan.',
    },
    {
      q: 'How are transport exceptions handled?',
      a: 'Operators can identify an exception from waybill status and start handling through an online work order or agreed support channel. The process and result are retained for later review.',
    },
  ],
}
