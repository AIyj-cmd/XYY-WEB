/**
 * Reviewed CMS content used by the one-time Directus migration and fresh installs.
 *
 * The frontend does not import this file. Public pages always read Directus so
 * subsequent CMS edits can take effect on the next request.
 */

export const APPROVED_HOMEPAGE_STATS = [
  {
    id: 1,
    sort: 1,
    value: '140+',
    label: '合作品牌',
    unit: '家',
    detail: '鞋服及相关细分行业',
  },
  {
    id: 2,
    sort: 2,
    value: '50万',
    label: '直营仓储',
    unit: '㎡',
    detail: '华南、华东、华中仓网',
  },
  {
    id: 3,
    sort: 3,
    value: '6000+',
    label: '覆盖城市',
    unit: '个',
    detail: '仓配与运输服务网络',
  },
  {
    id: 4,
    sort: 4,
    value: '45万+',
    label: '管理SKU',
    unit: '',
    detail: '鞋服款色码精细管理',
  },
  {
    id: 5,
    sort: 5,
    value: '1.17亿',
    label: '全年新货质检',
    unit: '件',
    detail: '按项目规则验货',
  },
  {
    id: 6,
    sort: 6,
    value: '1.53亿',
    label: '全年退货质检',
    unit: '件',
    detail: '质检、分流与二次上架',
  },
  {
    id: 7,
    sort: 7,
    value: '99.99',
    label: '库存准确率',
    unit: '%',
    detail: '系统与仓内流程协同',
  },
  {
    id: 8,
    sort: 8,
    value: '10000+',
    label: '服务门店',
    unit: '家',
    detail: '连锁与全渠道零售场景',
  },
]

export const APPROVED_SERVICES = [
  {
    id: 1,
    sort: 1,
    slug: 'cloud-warehouse',
    icon: 'warehouse',
    name: '鞋服云仓',
    subtitle: '全渠道一盘货与鞋服专用仓配',
    description:
      '提供B2C+B2B+O2O全渠道仓配、库存同步和门店补货服务。实际单仓单日峰值50万单/日，18:00前截单，当日24:00前发出。',
    features: [
      '发货准确率99.99%，库存准确率99.99%',
      '18:00前截单，当日24:00前发出',
      '实际单仓单日峰值50万单/日',
      'RFID、电子标签与出库复核协同管理款色码',
      '支持唯品会JIT/JITX等项目，平台规则按项目核验',
    ],
  },
  {
    id: 2,
    sort: 2,
    slug: 'quality-inspection',
    icon: 'inspection',
    name: '退货质检与瑕疵修复',
    subtitle: '135+种异常识别，24小时二次上架',
    description:
      '与广检集团合作QC团队，按AQL 1.0–6.5执行；质检技师经广检集团资深讲师培训认证。可识别7大类135+种异常，按质检结果进入对应修复流程；退货质检与二次上架24小时，瑕疵修复成功率90%。',
    features: [
      '可识别7大类135+种异常',
      '退货质检与二次上架24小时，平均拆包4小时、质检12小时',
      '瑕疵修复成功率90%',
      '设置九大修复专区，完成后按品牌标准复检',
      '全年新货质检1.17亿件，退货质检1.53亿件',
    ],
  },
  {
    id: 3,
    sort: 3,
    slug: 'logistics-cloud',
    icon: 'logistics',
    name: '物流数字化能力',
    subtitle: '六大系统模块与OTD物流服务中台协同',
    description:
      '以OTD物流服务中台为数字化底座，由物流网关、WMS、LMS、人效通、发货时效监控、轨迹与签收监控六大模块协同订单、库存、仓内作业与物流履约，支持路由、轨迹和异常管理。',
    features: [
      '运到已对接顺丰、京东、EMS等11家主流承运商',
      '物流轨迹与异常节点可视化',
      '可采用奇门、EDI、API或客户定制接口',
      '不收系统使用费；实施、接口联调、定制开发和其他服务费用按方案确认',
      '在线工单与运营报表支持履约复盘',
    ],
  },
]

export const APPROVED_WAREHOUSES = [
  {
    sort: 1,
    name: '黄埔仓',
    aliases: ['黄埔仓'],
    city: '广州',
    address: '广东省广州市黄埔区果园一路2号',
  },
  {
    sort: 2,
    name: '兴泰仓',
    aliases: ['兴泰仓', '番禺仓'],
    city: '广州',
    address: '具体地址与启用状态以双方确认信息为准',
  },
  {
    sort: 3,
    name: '新塘仓',
    aliases: ['新塘仓'],
    city: '广州',
    address: '具体地址与启用状态以双方确认信息为准',
  },
  {
    sort: 4,
    name: '东莞云谷仓',
    aliases: ['东莞云谷仓', '云谷仓'],
    city: '东莞',
    address: '具体地址与启用状态以双方确认信息为准',
  },
  {
    sort: 5,
    name: '佛山宏盛仓',
    aliases: ['佛山宏盛仓', '宏盛仓'],
    city: '佛山',
    address: '具体地址与启用状态以双方确认信息为准',
  },
  {
    sort: 6,
    name: '肇庆仓',
    aliases: ['肇庆仓'],
    city: '肇庆',
    address: '具体地址与启用状态以双方确认信息为准',
  },
  {
    sort: 7,
    name: '昆山花桥仓',
    aliases: ['昆山花桥仓', '花桥仓'],
    city: '昆山',
    address: '具体地址与启用状态以双方确认信息为准',
  },
  {
    sort: 8,
    name: '上海青浦汇金仓',
    aliases: ['上海青浦汇金仓', '汇金仓'],
    city: '上海',
    address: '上海市青浦区白鹤镇外青松公路3939号B-3-3',
  },
  {
    sort: 9,
    name: '合肥联亚仓',
    aliases: ['合肥联亚仓', '联亚仓'],
    city: '合肥',
    address: '具体地址与启用状态以双方确认信息为准',
  },
].map((warehouse) => ({
  ...warehouse,
  since: '',
  park: '',
  rent: '',
  height: '',
  highlight: '仓容、作业范围和可用服务以双方确认的项目方案为准。',
}))

export const LEGACY_WAREHOUSE_NAMES = ['智谷仓', '朗州仓', '桥头仓']
