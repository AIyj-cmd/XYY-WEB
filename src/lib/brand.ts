import { SITE_URL } from './site-config'

export const BRAND = {
  name: '新亦源供应链',
  fullName: '广州新亦源供应链管理有限公司',
  shortName: '新亦源',
  tagline: '让物流更简单·让服务更快捷',
  mission: '让发货更准确、高效、快捷',
  description:
    '广州新亦源供应链管理有限公司，总部位于广州，2011年成立，深耕鞋服物流15年。专注鞋服、潮玩、美妆、箱包等行业的云仓、仓配一体、退货质检和全渠道一盘货服务，合作知名服饰品牌140+，直营鞋服仓储50万㎡，配送服务覆盖全国主要城市及6000+区县/服务区域。',
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

export const DIGITAL_PRODUCTS = [
  {
    id: 'yundao-platform',
    tag: '商圈物流O2O',
    name: '运到智能寄件平台',
    subtitle: '商圈零售门店一站式智能寄件',
    description:
      '新亦源自研商圈物流O2O平台，聚合顺丰快运、京东物流、中通、圆通、韵达、德邦、申通、EMS、跨越速递、货拉拉、闪送等11家主流承运商，智能比价、智慧分配订单，为连锁门店、电商平台及企业机构提供全国任意区域运力服务，部分场景寄件费用节省可达50%。',
    features: [
      '对接11家主流承运商，系统智能比价智能派单',
      '覆盖全国6000+区县，门店开在哪都可寄取',
      '部分场景寄件费用可节省高达50%，以实际线路报价为准',
      '专属客服+快速理赔，智能报表+数据保密',
    ],
    href: '/product#yundao-platform',
  },
] as const

export const ABOUT_STATS = [
  { value: '1.17亿', unit: '件/年', label: '新货质检' },
  { value: '1.53亿', unit: '件/年', label: '退货质检' },
  { value: '99.99',  unit: '%+',    label: '库存准确率' },
  { value: '135',    unit: '种+',   label: '缺陷识别' },
  { value: '48',     unit: '小时',  label: '退货二次上架' },
  { value: '90',     unit: '%',     label: '瑕疵修复成功率' },
  { value: '40',     unit: '%↑',    label: 'RFID拣货提效' },
  { value: '30',     unit: '%↑',    label: '人效提升' },
] as const

export const CAPABILITIES = [
  {
    title: '99.99% 发货准确率',
    desc: '错漏全赔，当天 18:00 前订单当天 24:00 前全出',
  },
  {
    title: '三级仓网覆盖全国',
    desc: 'CDC中心仓 / RDC区域仓 / FDC产地仓，灵活配置',
  },
  {
    title: 'RFID 智能仓提效40%',
    desc: '三代智能仓，人效提升30%，仓内成本降低18%',
  },
  {
    title: '全渠道一盘货',
    desc: 'B2C+B2B+O2O库存实时同步，支持唯品会JIT/JITX',
  },
  {
    title: '弹性产能保大促',
    desc: '动态人力池+小时级调配，地区单日峰值100万单',
  },
  {
    title: '100亿保额风控保障',
    desc: '仓库财产险+运输险，1080P监控全程可追溯',
  },
] as const

// CASE_DETAILS keys match Directus cases.label so modal lookup works directly
export const CASE_DETAILS = {
  'UR（Urban Revivo）': {
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
  '幸棉': {
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
    name: '美一(MEIYI)',
    fullName: '美一（MEIYI）',
    category: '跨境全品类女装',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=75&auto=format&fit=crop',
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
  { year: '2011', text: '创始团队在广州成立，聚焦服饰供应链' },
  { year: '2017', text: '获千万级天使投资，战略定位服饰专业化物流' },
  { year: '2019', text: 'A轮融资，全国物流中心网络布局完成' },
  { year: '2020', text: '布局"三架马车"，全国区域后整检品服务落地' },
  { year: '2021', text: 'PreA轮融资，上市公司参股，启明星人才计划启动' },
  { year: '2022', text: '物流服务中台OTD上线，O2O平台全面升级' },
  { year: '2023', text: '业绩持续增长，仓内作业全面数字化升级' },
  { year: '2025', text: '布局跨境出海，从数字化迈向数智化' },
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
    name: '番禺仓',
    city: '广州',
    since: '2023',
    address: '广州市番禺区石楼镇市莲路石楼段6号',
    park: '6,000',
    rent: '200',
    height: '6m',
    highlight: '番禺石楼核心区，3台电梯，丙二类消防，开仓即用',
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
    name: '朗州仓',
    city: '东莞',
    since: '2017',
    address: '东莞市常平镇朗洲村鸿腾缘工业园',
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
  { href: '/product', label: '产品服务' },
  { href: '/about', label: '关于我们' },
  { href: '/cases', label: '合作案例' },
  { href: '/news', label: '行业动态' },
  { href: '/senlinqikan', label: '森林期刊' },
  { href: '/contact', label: '联系我们' },
] as const
