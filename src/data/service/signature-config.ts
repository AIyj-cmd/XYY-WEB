import type { ServiceVariant } from './types'

export const SERVICE_SIGNATURE_CONFIG: Record<
  ServiceVariant,
  { code: string; kicker: string; heading: string; summary: string }
> = {
  journey: {
    code: 'FLOW / 01',
    kicker: '一件货的仓内旅程',
    heading: '让每一次入仓、流转与出库都有明确下一站',
    summary:
      '以货物流为页面主轴，把高 SKU 管理、RFID 识别、全渠道履约和峰值产能串成一条连续作业线。',
  },
  showroom: {
    code: 'SPACE / 02',
    kicker: '面料友好型仓储展厅',
    heading: '不同服装，不应被放进同一种仓储逻辑',
    summary: '挂装、叠装、鞋类和特殊面料采用不同空间与作业方式，页面以仓内展厅呈现品类差异。',
  },
  'guangzhou-hub': {
    code: 'HUB / GZ',
    kicker: '广州核心枢纽',
    heading: '从广州仓点出发，连接珠三角订单与货源',
    summary: '用本地仓点、订单区域和协同线路组织服务，而不是把广州方案缩写成一组通用能力。',
  },
  'south-network': {
    code: 'NETWORK / S',
    kicker: '华南多仓协同网络',
    heading: '仓容、人力、物流与系统在区域内一起调度',
    summary: '广州、东莞、佛山与肇庆节点按项目组合，通过四类资源协同承接日常履约与货量波动。',
  },
  'east-radius': {
    code: 'RADIUS / E',
    kicker: '华东时效覆盖面板',
    heading: '库存前置到区域节点，再由时效圈组织履约',
    summary: '以华东节点和订单覆盖为中心，呈现区域仓配、签收监控与华南华东协同关系。',
  },
  'store-rhythm': {
    code: 'STORE / B2B',
    kicker: '门店补货节奏轴',
    heading: '不是一次发完，而是让每家门店按节奏收到正确货品',
    summary: '把铺货、补货、调拨和退仓放进同一张作业单，清楚呈现门店仓配与普通电商小包的差异。',
  },
  'global-tower': {
    code: 'ROUTE / GLOBAL',
    kicker: '世界航线控制塔',
    heading: '正向出海与逆向回流，共用一套可追踪节点',
    summary:
      '围绕跨境仓、质检、包装、上架、发货与退货回流组织双向链路，业务边界在每个节点清晰可见。',
  },
  'live-command': {
    code: 'LIVE / NOW',
    kicker: '直播履约战情中心',
    heading: '围绕开播时间组织库存、波次、人力与异常处理',
    summary: '订单波峰不是事后统计，而是在直播前、直播中和直播后被连续监控和调度。',
  },
  'jit-radar': {
    code: 'SLA / JIT',
    kicker: 'JIT / JITX 时限与风险雷达',
    heading: '两种模式并行运行，每个风险点提前进入视野',
    summary: '将库存同步、订单响应、复核出库和异常工单放到双轨时钟上，突出平台履约的过程控制。',
  },
  'evidence-lab': {
    code: 'EVIDENCE / QC',
    kicker: '订单证据实验室',
    heading: '从拆包到分级，每个判断都能回到操作证据',
    summary: '录像、订单核验、缺陷图片、质检分级和系统报表组成一条可追溯的退货处理证据链。',
  },
  'repair-workshop': {
    code: 'WORKSHOP / 09',
    kicker: '蓝色修复工坊',
    heading: '让不同瑕疵进入对应工位，再以二次质检结束',
    summary: '洗护、清污、缝补、配饰、鞋类、整烫与标识处理采用不同工艺，不以一套模板概括全部修复。',
  },
  'delivery-desk': {
    code: 'DELIVERY / 11',
    kicker: '智能寄件协同台',
    heading: '从寄件入口一直管到签收与异常闭环',
    summary:
      '承运商、运单、轨迹、签收、异常和报表统一在一个业务入口内协同，不再分散到多个查询后台。',
  },
}
