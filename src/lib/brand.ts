import { SITE_URL } from './site-config'
import { CLAIM_TEXT } from './claims'

export const BRAND = {
  name: '新亦源供应链',
  fullName: '广州新亦源供应链管理有限公司',
  shortName: '新亦源',
  tagline: '让物流更简单·让服务更快捷',
  mission: '让发货更准确、高效、快捷',
  description: `广州新亦源供应链管理有限公司，总部位于广州，2011年成立，专注鞋服仓配与质检服务。合作品牌${CLAIM_TEXT.partnerBrands}，直营仓储${CLAIM_TEXT.warehouseArea}，服务门店${CLAIM_TEXT.servedStores}，管理SKU ${CLAIM_TEXT.managedSkus}。`,
  url: SITE_URL,
  icp: '粤ICP备17001688号',
  founded: 2011,
  phone: { toll: '400-6865-156' },
  locations: {
    south: {
      label: '华南总部',
      address: '广东省广州市黄埔区果园一路2号',
      city: '广州',
      region: 'Guangdong',
    },
  },
} as const

export const SERVICE_FACTS = {
  shippingSla: CLAIM_TEXT.shippingSla,
  returnTurnaround: CLAIM_TEXT.returnTurnaround,
  orderPickupCutoff: '18:00',
  orderDispatchDeadline: '24:00',
  shippingAccuracy: CLAIM_TEXT.shippingAccuracy,
  inventoryAccuracy: CLAIM_TEXT.inventoryAccuracy,
  returnInspectionAnnual: CLAIM_TEXT.returnInspectionAnnual,
  newGoodsInspectionAnnual: CLAIM_TEXT.newGoodsInspectionAnnual,
  repairSuccessRate: CLAIM_TEXT.repairSuccessRate,
  recognizableDefects: CLAIM_TEXT.recognizableAnomalies,
  defectCategories: '7大类',
} as const

export const DIGITAL_PRODUCTS = [
  {
    id: 'yundao-platform',
    tag: '商圈物流O2O',
    name: '运到智能寄件平台',
    subtitle: '商圈零售门店一站式智能寄件',
    description:
      '新亦源自研商圈物流O2O平台，以信息和数据协同运输资源，已对接顺丰、京东、EMS等11家主流承运商，可根据线路、货量和时效要求智能匹配方案，为连锁门店、电商平台及企业机构提供正向与逆向寄件协同服务。',
    features: [
      '对接顺丰、京东、EMS等11家主流承运商',
      '覆盖门店寄件、调拨、退仓等正向与逆向场景',
      '服务网络覆盖多地，部分线路费用最高可节省50%，具体以实际线路和报价为准',
      '专属客服+在线工单，智能报表+数据保密',
    ],
    href: '/product#yundao-platform',
  },
] as const

export const ABOUT_STATS = [
  { value: '1.17亿', unit: '件/年', label: '新货质检' },
  { value: '1.53亿', unit: '件/年', label: '退货质检' },
  { value: '99.99', unit: '%', label: '库存准确率' },
  { value: '135', unit: '种+', label: '缺陷识别' },
  { value: '24', unit: '小时', label: '退货二次上架' },
  { value: '90', unit: '%', label: '瑕疵修复成功率' },
  { value: '40', unit: '%↑', label: 'RFID拣货提效' },
  { value: '30', unit: '%↑', label: '人效提升' },
] as const

export const CAPABILITIES = [
  {
    title: '99.99% 发货准确率',
    desc: `${CLAIM_TEXT.shippingSla}，发货全流程扫码复核`,
  },
  {
    title: '三级仓网协同',
    desc: 'CDC中心仓 / RDC区域仓 / FDC产地仓按项目配置',
  },
  {
    title: 'RFID 智能仓',
    desc: '三代智能仓结合RFID、电子标签与自动化分拣',
  },
  {
    title: '全渠道一盘货',
    desc: 'B2C+B2B+O2O库存实时同步，支持唯品会JIT/JITX',
  },
  {
    title: '弹性产能保大促',
    desc: `动态人力池+小时级调配，地区单日峰值${CLAIM_TEXT.regionalPeak}`,
  },
  {
    title: '全流程监控可追溯',
    desc: '1080P拆包监控+操作台高低位双摄，按订单调取录像',
  },
] as const

// CASE_DETAILS keys match Directus cases.label so modal lookup works directly
export const CASE_DETAILS = {
  'UR（Urban Revivo）': {
    slug: 'ur',
    name: 'UR',
    fullName: 'Urban Revivo（UR）',
    category: '头部快时尚女装',
    image: '/w-flower.webp',
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
    image: '/w-apparel.webp',
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
    image: '/w-returns.webp',
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
    image:
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=75&auto=format&fit=crop',
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
} as const

export const MILESTONES = [
  { year: '2011', text: '团队成立' },
  { year: '2017', text: '获千万级天使投资，定位服饰客户专业化物流' },
  { year: '2019', text: '完成战略定位，布局服装仓储中心并建立仓配服务SOP' },
  { year: '2020', text: '完成A轮融资，布局全国物流中心，打造线上线下融合新物流模式' },
  { year: '2021', text: '布局行业垂直整合“三架马车”，建设全国区域后整检品服务' },
  { year: '2022', text: '完成PRE-A轮融资并获上市公司参股，启动“启明星计划”' },
  { year: '2023', text: '物流服务中台OTD上线，人效通与店配O2O平台升级' },
  { year: '2024', text: '深耕鞋服战略，推进仓内作业数字化升级' },
  { year: '2025', text: '布局跨境出海，从数字化过渡到数智化，建设管理人才体系' },
] as const

export const HONORS = [
  'CFLP服装物流分会·一届理事会理事单位',
  'CFLP·服装物流行业贡献企业（2019年度）',
  '上海张江劳动人事协会·会员单位',
  'CFLP服装物流分会·一届理事会感谢状',
  '中华全国工商业联合会纺织服装业商会·会员单位',
  '全球鞋服供应链与物流技术研讨会十周年·杰出贡献奖',
  '招商银行广州分行·2024年度薪酬福利典范企业',
  '海尔智家·2019年度金牌供应链运营商',
  '广东物流协会·广东省信息化建设优秀企业',
  '中国交通运输协会·值得推荐企业奖',
  '全球鞋服行业供应链与物流研讨会·优秀物流服务商',
  'CFLP中国物流与采购联合会服装物流分会·理事单位',
  '时尚物流联盟·2017年双11中国行活动鼎力支持',
  '广州税务局·纳税信用A级荣誉证书（2022年度）',
  '第十一届国际物流节·十佳物流企业奖',
] as const

export const WAREHOUSES = [
  {
    name: '黄埔仓',
    city: '广州',
    since: '2025',
    address: '广州市黄埔区果园一路2号',
    park: '15,000',
    rent: '3,000',
    height: '6m',
    highlight: '紧邻广园快速、京港澳高速，10台3吨货梯，进出货效率高',
  },
  {
    name: '兴泰仓',
    city: '广州',
    since: '2023',
    address: '具体地址以双方确认信息为准',
    park: '6,000',
    rent: '200',
    height: '6m',
    highlight: '与黄埔仓合计运营面积1.8万㎡，具体服务范围按项目方案确认',
  },
  {
    name: '肇庆仓',
    city: '肇庆',
    since: '2019',
    address: '肇庆市四会市东城街道唯品会物流园20号库',
    park: '100,000',
    rent: '50,000',
    height: '12m',
    highlight: '20万平米物流园，12米超高层，多条自动打包线，快递资源发达',
  },
  {
    name: '智谷仓',
    city: '东莞',
    since: '2020',
    address: '东莞市常平镇多宝路2号常平智谷',
    park: '110,000',
    rent: '5,000',
    height: '12m / 4m',
    highlight: '高速出口3公里，一层层高12米，10个升降平台，8部货梯',
  },
  {
    name: '东莞仓点',
    city: '东莞',
    since: '2017',
    address: '具体地址以双方确认信息为准',
    park: '30,000',
    rent: '5,000',
    height: '4.5m',
    highlight: '4台专配电商货梯，前后1500–2000㎡中转空间，进出货流转高效',
  },
  {
    name: '桥头仓',
    city: '东莞',
    since: '2023',
    address: '东莞市桥头镇多宝路2号常平桥头',
    park: '30,000',
    rent: '5,000',
    height: '6m',
    highlight: '东部高速5公里，方正大开间，动线流畅，弹性扩容灵活',
  },
]

export const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/product', label: '仓配服务' },
  { href: '/about', label: '关于我们' },
  { href: '/cases', label: '合作案例' },
  { href: '/news', label: '行业动态' },
  { href: '/senlinqikan', label: '森林期刊' },
  { href: '/contact', label: '联系我们' },
] as const
