import type { ServicePageStaticConfigRaw } from './types'

export const RAW_SERVICE_PAGE_CONFIG = {
  slug: 'huadong-xiefu-yuncang',
  title: '华东鞋服云仓｜上海、昆山、合肥仓配｜新亦源',
  description:
    '新亦源华东鞋服云仓覆盖上海、昆山、合肥，支持电商发货、门店补货、库存协同与退货质检，各仓均具备质检能力。',
  eyebrow: '',
  h1: '华东鞋服云仓',
  h1sub: '',
  stats: [
    {
      stat: '3区域',
      label: '华东仓网',
      sub: '上海、昆山、合肥',
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
      stat: '不收',
      label: '系统使用费',
      sub: '接口实施和定制费用按方案确认',
    },
  ],
  features: [
    {
      title: '华东仓库分布',
      desc: '上海、昆山、合肥多仓布局，按库存与订单需求安排仓配服务，各仓均具备质检能力。',
    },
    {
      title: '华东电商发货',
      desc: '支持天猫、京东、拼多多、抖音电商、快手等平台订单，按库存和约定安排发货。',
    },
    {
      title: '华东门店补货',
      desc: '按门店整理货品，支持整件发货、拆零分拣与补货配送。',
    },
    {
      title: '华东退货质检',
      desc: '各仓均可处理退货质检；符合重新销售条件的商品，按服务约定在{{returnTurnaround}}内完成质检与二次上架，需修复的商品另行安排。',
    },
    {
      title: '华东华南库存协同',
      desc: '华东与华南库存统一查看，根据订单地区、库存和约定规则安排发货、补货与对账。',
    },
    {
      title: '本地团队沟通',
      desc: '可围绕货品、订单去向和补货节奏沟通华东仓配需求。',
    },
  ],
  breadcrumbLabel: '华东鞋服云仓',
  heroDesc: '上海、昆山、合肥多仓布局，支持电商发货、门店补货与退货质检。',
  imgSrc: '/w-hq.webp',
  imgAlt: '华东鞋服云仓仓储服务',
  contentDesc: '根据货品、订单去向和所需服务，确认发货安排与费用。',
  featuresLabel: '华东仓配服务',
  presentation: 'east',
  variant: 'east-radius',
  faqs: [
    {
      contentKey: 'faq-huadong-xiefu-yuncang-01',
      q: '新亦源华东仓在哪里？适合哪些品牌？',
      a: '华东仓网覆盖上海、昆山和合肥，上海青浦为核心节点之一，适合供应链或主要消费市场位于华东、需要区域库存和门店补货协同的鞋服品牌。上海仓地址为上海市青浦区白鹤镇外青松公路3939号B-3-3；实际启用仓点、仓容和作业范围在项目启动前确认。',
    },
    {
      contentKey: 'faq-huadong-xiefu-yuncang-02',
      q: '华东仓发货到长三角主要城市需要多久？',
      a: '运输时效取决于实际启用仓点、收货区域、截单节点、承运商和当期线路。新亦源会在项目评估中核验线路，并在双方确认的服务方案中明确适用范围和SLA。',
    },
    {
      contentKey: 'faq-huadong-xiefu-yuncang-03',
      q: '华东仓和广州仓可以同时使用，统一管理库存吗？',
      a: '可以。新亦源OMS支持多仓一体管理：①统一库存视图，库存在广州仓和上海仓之间实时可见；②就近发货策略配置，华东订单自动路由至上海仓，华南订单路由至广州仓；③统一报表和对账，无需分别登录两套系统；④分仓补货预警，避免单仓缺货影响发货。',
    },
    {
      contentKey: 'faq-huadong-xiefu-yuncang-04',
      q: '华东仓规模多大？能应对大促爆单吗？',
      a: '上海青浦仓是华东仓网核心节点之一，大促期间可通过弹性人力机制调整产能；品牌也可结合昆山、合肥及华南仓网规划库存。具体仓容请联系商务团队评估。',
    },
    {
      contentKey: 'faq-huadong-xiefu-yuncang-05',
      q: '华东仓收费与广州仓有区别吗？',
      a: '费用通常由仓储、操作、系统实施和增值服务组成，具体单价受启用仓点、SKU、吞吐量和服务范围影响。品牌可提供业务数据，由商务团队形成项目报价。',
    },
  ],
} as const satisfies ServicePageStaticConfigRaw
