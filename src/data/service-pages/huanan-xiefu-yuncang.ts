import type { ServicePageStaticConfigRaw } from './types'

export const RAW_SERVICE_PAGE_CONFIG = {
  slug: 'huanan-xiefu-yuncang',
  title: '华南鞋服云仓｜广州、东莞、佛山、肇庆仓网｜新亦源',
  description:
    '新亦源华南鞋服云仓覆盖广州、东莞、佛山、肇庆，支持 B2C、B2B、电商发货、门店补货与退货处理，各仓均具备质检能力。',
  eyebrow: '华南鞋服云仓 · 珠三角区域仓配',
  h1: '华南鞋服云仓：广州、东莞、佛山、肇庆仓网',
  h1sub: '华南区域库存与鞋服仓配协同',
  stats: [
    {
      stat: '4区域',
      label: '华南仓网',
      sub: '广州+东莞+佛山+肇庆',
    },
    {
      stat: '全渠道',
      label: '仓配模式',
      sub: 'B2C+B2B+退货处理',
    },
    {
      stat: '18:00前',
      label: '截单时间',
      sub: '当日24:00前发出',
    },
    {
      stat: '30万㎡+',
      label: '华南直营仓储',
      sub: '多仓协同布局',
    },
  ],
  features: [
    {
      title: '广州仓库',
      desc: '服务广州及珠三角鞋服品牌，衔接电商发货、门店补货与退货质检。',
    },
    {
      title: '东莞仓库',
      desc: '衔接东莞工厂与品牌货源，提供入库、存储、订单发货与退货质检服务。',
    },
    {
      title: '佛山仓库',
      desc: '为佛山及周边鞋服品牌提供货品存储、订单发货与退货质检服务。',
    },
    {
      title: '肇庆仓库',
      desc: '支持鞋服货品入库、存储、发货与退货质检，唯品会 JIT/JITX 业务按平台要求安排。',
    },
    {
      title: '各仓退货质检',
      desc: '华南各仓库均具备质检能力，退货可就近回仓检查、分类。符合重新销售条件的商品，按服务约定在{{returnTurnaround}}内完成质检与二次上架；需要后整修复的商品按实际情况安排。',
    },
    {
      title: '货源入仓与库存安排',
      desc: '衔接广州、东莞、佛山等地鞋服货源，安排工厂入仓、库存管理与订单发货。',
    },
  ],
  breadcrumbLabel: '华南鞋服云仓',
  heroDesc: '广州、东莞、佛山、肇庆多仓布局，支持 B2C、B2B、全渠道库存协同、退货质检及区域配送。',
  imgSrc: '/w-hanging1.webp',
  imgAlt: '华南鞋服云仓 — 广州东莞佛山肇庆仓网',
  contentDesc:
    '正向订单{{shippingSla}}。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日。到达时间会因收货地址、承运商及线路安排有所不同，具体以双方约定的配送方案为准。',
  featuresLabel: '华南仓储服务',
  presentation: 'south',
  variant: 'south-network',
  faqs: [
    {
      contentKey: 'faq-huanan-xiefu-yuncang-01',
      q: '华南鞋服云仓覆盖哪些区域？',
      a: '华南多仓布局覆盖广州、东莞、佛山、肇庆，华南直营仓储30万㎡+。每个项目实际启用的仓点、地址、仓容和业务范围在启动前确认。',
    },
    {
      contentKey: 'faq-huanan-xiefu-yuncang-02',
      q: '华南鞋服云仓发货到全国时效怎么样？',
      a: '仓内正向履约口径为{{shippingSla}}。广州同城最快4小时；广东主要区域参考次日达；华南主要城市次日至两日；具体以线路SLA为准。',
    },
    {
      contentKey: 'faq-huanan-xiefu-yuncang-03',
      q: '华南仓储费用有没有地区优势？',
      a: '具体仓储和转运成本按仓点、货量及线路测算。',
    },
    {
      contentKey: 'faq-huanan-xiefu-yuncang-04',
      q: '新亦源华南仓适合哪类鞋服品牌？',
      a: '适合主要库存、供应商或消费市场位于华南，需要电商发货、连锁门店补货、唯品会JIT/JITX、退货质检或跨境国内端仓储配套的鞋服品牌。',
    },
    {
      contentKey: 'faq-huanan-xiefu-yuncang-05',
      q: '华南仓能支持多大规模的品牌？',
      a: '华南仓网可按品牌的SKU、库存、订单峰值和增值服务需求评估共享仓位、专属分区或多仓协同方案。公司公开的地区运营峰值为{{regionalPeak}}，具体项目产能需结合当期仓容与资源确认。',
    },
  ],
} as const satisfies ServicePageStaticConfigRaw
