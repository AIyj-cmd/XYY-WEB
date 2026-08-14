export interface CaseDetail {
  readonly slug: string
  readonly name: string
  readonly fullName: string
  readonly category: string
  readonly image: string
  readonly accent: string
  readonly description: string
  readonly stats: readonly {
    readonly label: string
    readonly value: string
    readonly unit: string
  }[]
}

export const CASE_DETAILS = {
  'UR（Urban Revivo）': {
    slug: 'ur',
    name: 'UR',
    fullName: 'Urban Revivo（UR）',
    category: '头部快时尚女装',
    image: '/images/cases/ur.webp',
    accent: '#2563EB',
    description:
      'UR 是中国头部快时尚女装品牌。在天猫超品日期间，UR 创下服饰类目 GMV 新纪录，官方旗舰店同比增长 116%；618 大促斩获天猫、抖音、京东三大平台女装榜首。全球门店超 400 家，覆盖新加坡、泰国、菲律宾等海外市场。',
    stats: [
      { label: '总库存量', value: '260万+', unit: '件' },
      { label: 'SKU 数量', value: '13万+', unit: '' },
      { label: '仓库面积', value: '10万+', unit: '㎡' },
      { label: '日均入库量', value: '6万+', unit: '件/日' },
      { label: '峰值 B2C', value: '10万+', unit: '件/日' },
      { label: '日均 B2C', value: '5万+', unit: '件/日' },
      { label: '日均 B2B', value: '2万+', unit: '件/日' },
      { label: '日均退货量', value: '3万+', unit: '件/日' },
    ],
  },
  '玛克茜妮（MAXRIENY）': {
    slug: 'maxrieny',
    name: 'MAXRIENY',
    fullName: '玛克茜妮（MAXRIENY）',
    category: '高端设计师女装',
    image: '/images/cases/maxrieny.webp',
    accent: '#7C3AED',
    description:
      '深圳玛克茜妮（MAXRIENY）聚焦 28–38 岁独立都市高知女性，主打"精致职场"与"社交聚会"场景。以欧洲中世纪宫廷奇幻美学为核心，融合巴洛克艺术与街拍风格，产品均价春夏 800–3500 元、秋冬 1000–4500 元。曾获《深圳服装创新品牌奖》《原创设计师奖》，旗下涵盖高级成衣系列 SARAWONG、Lifestyle 系列及家居产品线 HOME。',
    stats: [
      { label: '总库存量', value: '90万+', unit: '件' },
      { label: 'SKU 数量', value: '1.7万+', unit: '' },
      { label: '仓库面积', value: '1.2万+', unit: '㎡' },
      { label: '日均入库量', value: '2万+', unit: '件/日' },
      { label: '日均 B2C', value: '1.2万+', unit: '件/日' },
      { label: '峰值 B2C', value: '7.5万+', unit: '件/日' },
      { label: '日均 B2B', value: '1.1万+', unit: '件/日' },
      { label: '峰值 B2B', value: '6万+', unit: '件/日' },
    ],
  },
  幸棉: {
    slug: 'xingmian',
    name: '幸棉',
    fullName: '幸棉',
    category: '内衣基础品类',
    image: '/images/cases/xingmian.webp',
    accent: '#0D9488',
    description:
      '幸棉是国内内衣基础品类的代表性品牌。新亦源为其提供从多渠道订单聚合、运输平台连通，到新货退货质检、达播寄样、订单全程跟踪及次品分类返厂的全链路一体化服务，实现电商仓配与逆向物流的高效统一管理。',
    stats: [
      { label: '总库存量', value: '370万+', unit: '件' },
      { label: 'SKU 数量', value: '5000+', unit: '' },
      { label: '仓库面积', value: '2.5万+', unit: '㎡' },
      { label: '日均入库量', value: '5万+', unit: '件/日' },
      { label: '日均 B2C', value: '6万+', unit: '件/日' },
      { label: '峰值 B2C', value: '10万+', unit: '件/日' },
      { label: '日均退货量', value: '1.5万+', unit: '件/日' },
    ],
  },
  '美一(MEIYI)': {
    slug: 'meiyi',
    name: '美一(MEIYI)',
    fullName: '美一（MEIYI）',
    category: '跨境全品类女装',
    image: '/images/cases/meiyi.webp',
    accent: '#D97706',
    description:
      '美一（MEIYI）是专注跨境全品类女装的服饰品牌。新亦源为其提供 B2B+B2C 一体化仓储服务，涵盖收货验货、新货质检、包装整理、库存上架及发货打包全流程，年综合处理量达百万件级别。',
    stats: [
      { label: '年发货量', value: '100~150', unit: '万件/年' },
      { label: '年质检量', value: '120~200', unit: '万件/年' },
      { label: '年上架量', value: '130~180', unit: '万件/年' },
      { label: '年包装量', value: '80~160', unit: '万件/年' },
    ],
  },
  'ROMI STUDIO': {
    slug: 'romi-studio',
    name: 'ROMI STUDIO',
    fullName: 'ROMI STUDIO',
    category: '直播女装',
    image: '/images/cases/romi-studio.webp',
    accent: '#DB2777',
    description:
      'ROMI STUDIO 是创立于 2010 年的中国极简轻奢女装品牌，总部位于深圳，2019 年正式进入电商领域，2024 年抖音 GMV 达 22.5 亿元，成为抖音 IP 女装 TOP1。',
    stats: [
      { label: '日均出库量', value: '3万+', unit: '件' },
      { label: '仓配能力', value: '快速补货', unit: '' },
      { label: '直播服务', value: '达播寄样', unit: '' },
    ],
  },
  '茵曼（Inman）': {
    slug: 'inman',
    name: '茵曼',
    fullName: '茵曼（Inman）',
    category: '棉麻生活服装',
    image: '/images/cases/inman.webp',
    accent: '#B7791F',
    description:
      '知名棉麻生活服装品牌，多年线上线下融合运营。新亦源提供全渠道一盘货仓储，实现多平台库存统一。',
    stats: [
      { label: '库存管理', value: '全渠道统一管理', unit: '' },
      { label: '履约能力', value: '多平台同步发货', unit: '' },
    ],
  },
} as const satisfies Record<string, CaseDetail>
