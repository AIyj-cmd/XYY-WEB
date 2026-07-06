export const BRAND = {
  name: '新亦源供应链',
  fullName: '广州新亦源供应链管理有限公司',
  shortName: '新亦源',
  tagline: '让物流更简单·让服务更快捷',
  mission: '让发货更准确、高效、快捷',
  description:
    '广州新亦源供应链管理有限公司，总部位于广州，2011年成立，深耕鞋服物流15年。专注鞋服、潮玩、美妆、箱包等行业的云仓、仓配一体、退货质检和全渠道一盘货服务，合作知名服饰品牌140+，直营鞋服仓储50万㎡，配送服务覆盖全国主要城市及6000+区县/服务区域。',
  url: 'https://wz.tomatopia.top',
  icp: '粤ICP备17001688号',
  founded: 2011,
  phone: { direct: '020-82036224', toll: '400-6865-156' },
  locations: {
    south: {
      label: '华南总部',
      address: '广东省广州市黄埔区果园一路2号',
      city: '广州',
      region: 'Guangdong',
    },
    east: {
      label: '华东仓',
      address: '上海市青浦区汇金路889号2号楼三楼',
      city: '上海',
      region: 'Shanghai',
    },
    central: {
      label: '华中仓',
      address: '湖北省监利市监利服装产业园3号楼',
      city: '监利',
      region: 'Hubei',
    },
  },
} as const

export const STATS = [
  { value: '140+', label: '合作知名品牌', unit: '家', detail: '鞋服、潮玩、美妆、箱包等细分行业' },
  { value: '50万', label: '直营鞋服仓储', unit: '㎡', detail: '三级仓网架构，按需配仓' },
  { value: '6000+', label: '服务区域', unit: '个', detail: '覆盖全国主要城市及区县网络' },
  { value: '2000+', label: '自有员工', unit: '人', detail: '固定员工占比约80%，行业内较高水平' },
  { value: '1.17亿', label: '全年新货质检', unit: '件', detail: '专业质检团队，标准化流程' },
  { value: '1.53亿', label: '全年退货质检', unit: '件', detail: '退货二次上架，降低损耗' },
  { value: '99.99%', label: '库存准确率', unit: '+', detail: 'RFID + 系统双重校验' },
  { value: '3000万', label: '包材二次利用', unit: '个/年', detail: '旧纸箱回收再利用，降本减碳' },
] as const

export const SERVICES = [
  {
    id: 'cloud-warehouse',
    name: '鞋服云仓',
    subtitle: '一仓发全国，全渠道一盘货',
    description:
      '以鞋服品类深度优化的仓储管理系统为核心，提供B2C+B2B+O2O全渠道发货、库存同步与智能补货服务。单仓单日峰值50万单，弹性产能保障大促不爆仓。',
    features: [
      '全渠道一盘货，库存准确率99.99%+',
      '当日18:00前订单，当日24:00前全出',
      '单仓峰值50万单/日，弹性人力调配',
      'RFID全域识别，拣货效率+40%',
      '支持唯品会JIT/JITX等主流平台',
    ],
    icon: 'warehouse',
  },
  {
    id: 'quality-inspection',
    name: '后整质检修复',
    subtitle: '135+种缺陷识别，48小时二次上架',
    description:
      '与广检集团合作的QC认证质检团队，按AQL 1.0–6.5标准运行。新货全检/抽检、退货质检、瑕疵修复一站式服务，瑕疵修复成功率90%，退货48小时内完成质检并二次上架。',
    features: [
      '可识别缺陷135+种，覆盖污渍、面料外观、缝线、纽扣配件、后工艺印绣、吊牌标识、异味等7大类',
      '退货质检+二次上架48小时内（加急24小时）',
      '瑕疵修复成功率90%，专属9区修复分区',
      '1080P拆包监控，电商争议全程可举证',
      '全年新货质检1.17亿件，退货质检1.53亿件',
    ],
    icon: 'inspection',
  },
  {
    id: 'logistics-cloud',
    name: '物流云',
    subtitle: '多承运商聚合，智能路由降本',
    description:
      '自研物流服务中台OTD，聚合顺丰快运、中通、圆通、韵达、德邦、京东物流、申通、跨越速递、安能、EMS等10家主流承运商，一键切换路由、实时轨迹可视化、发货超时预警。通过智能寄件平台"运到"，实现商圈零售门店正向+逆向网络统一管理。',
    features: [
      '顺丰、中通、圆通、韵达、德邦、申通等10家承运商聚合，一键拦截转寄',
      '发货超时预警+签收时效监控',
      '奇门/EDI接口，与主流ERP无缝对接',
      '不收系统使用费，按需付费',
      '物流轨迹可视化，在线客户工单流',
    ],
    icon: 'logistics',
  },
] as const

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
  {
    id: 'basic-supply',
    tag: '直供平台',
    name: '服装基础品类直供',
    subtitle: '工厂直采，去中间层降成本',
    description:
      '聚合优质服装基础品类工厂（袜类、内衣、T恤等），绕过中间层直供零售商及品牌。支持小批量起订、快速翻单、品质溯源，帮助采购团队稳定货期、系统性降低采购成本。',
    features: [
      '精选优质工厂，全程品质可溯源',
      '小批量起订，降低库存积压风险',
      '快速翻单机制，柔性响应补货需求',
      '货期承诺有保障，履约率98%+',
    ],
    href: '/product#basic-supply',
  },
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

export const CASES = [
  {
    id: 'ur',
    label: 'UR',
    category: '快时尚女装',
    metrics: '库存 260万件+ · SKU 13万+ · 仓面积 10万㎡+ · 峰值B2C 10万件/日',
    tags: ['合作自2017年', 'B2C+B2B全渠道', 'RFID全面上线', '唯品会JIT/JITX'],
    stats: [
      { value: '260万+', label: '件在库' },
      { value: '10万+', label: '件/日 峰值B2C' },
    ],
  },
  {
    id: 'maxrieny',
    label: '玛克茜妮',
    category: '高端设计师女装',
    metrics: '库存 90万件+ · SKU 1.7万+ · 峰值B2C 7.5万件/日 · 峰值B2B 6万件/日',
    tags: ['B2C+B2B联动', '仓内质检修复'],
    stats: [
      { value: '7.5万', label: '件/日 峰值B2C' },
      { value: '90万+', label: '件在库' },
    ],
  },
  {
    id: 'xingmian',
    label: '幸棉',
    category: '内衣基础品类',
    metrics: '库存 370万件+ · SKU 5000+ · 仓 2.5万㎡ · 峰值B2C 10万件/日',
    tags: ['多渠道接入', '达播寄样', '退货质检'],
    stats: [
      { value: '370万+', label: '件在库' },
      { value: '10万+', label: '件/日 峰值B2C' },
    ],
  },
  {
    id: 'urbanic',
    label: 'Urbanic',
    category: '跨境快时尚',
    metrics: '年发货 1800–2300万件 · 年质检 800–1400万件 · 年包装 1500–2000万件',
    tags: ['跨境出海', '质检+包装+上架'],
    stats: [
      { value: '2300万', label: '件/年 出货' },
      { value: '1400万', label: '件/年 质检' },
    ],
  },
] as const

export const CASES_ALL_EXTRA = [
  {
    label: '头部国际运动品牌',
    metrics: '库存 320万+ · 专属仓 12万㎡ · 峰值 12万件/日',
    tags: ['大货质检', 'B2B分拨', 'RFID管理'],
  },
  {
    label: '头部潮玩品牌',
    metrics: '库存 150万+ · SKU 1.2万+ · 峰值 8万件/日',
    tags: ['非鞋服类目', '品质管控', '全渠道'],
  },
] as const

export const CASE_DETAILS = {
  ur: {
    name: 'UR',
    fullName: 'Urban Revivo（UR）',
    category: '头部快时尚女装',
    image:
      '/w-flower.webp',
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
  maxrieny: {
    name: 'MAXRIENY',
    fullName: '玛克茜妮（MAXRIENY）',
    category: '高端设计师女装',
    image:
      '/w-apparel.webp',
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
  xingmian: {
    name: '幸棉',
    fullName: '幸棉',
    category: '内衣基础品类',
    image:
      '/w-returns.webp',
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
  urbanic: {
    name: 'Urbanic',
    fullName: 'Urbanic（跨境快时尚）',
    category: '跨境快时尚',
    image:
      '/w-fulfill.webp',
    accent: '#D97706',
    description:
      'Urbanic 是面向印度、英国等海外市场的跨境快时尚品牌，主营全品类女装。新亦源为其提供 B2B+B2C 一体化仓储服务，覆盖质检、包装、上架、库存管理及发货打包全流程，年处理量达千万件级别。',
    stats: [
      { label: '年质检量', value: '800–1400', unit: '万件/年' },
      { label: '年包装量', value: '1500–2000', unit: '万件/年' },
      { label: '年上架量', value: '1300–1900', unit: '万件/年' },
      { label: '年发货量', value: '1800–2300', unit: '万件/年' },
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
  '中国鞋服供应链与物流优秀服务商',
  '时尚消费品行业数字化最优秀解决方案奖',
  '深圳市服装行业协会供应链副会长单位',
  '中国物流与采购联合会服装理事单位',
  '广东省科技型中小企业',
  '国际物流节十佳物流企业',
  '年度金牌供应链运营商',
  '纳税信用A级企业',
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
  { href: '/contact', label: '联系我们' },
] as const
