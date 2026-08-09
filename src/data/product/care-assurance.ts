import { SERVICE_FACTS } from '@/lib/brand'

export const CARE_CATEGORIES = [
  { number: '01', title: '标签处理', description: '换吊牌、洗水标、领标、条码及防伪标签' },
  { number: '02', title: '外观整理', description: '熨烫、除皱、折叠、除尘和简单清洁' },
  { number: '03', title: '包装处理', description: '换袋、换盒、重新包装、赠品及物料放入' },
  { number: '04', title: '轻微修复', description: '剪线头、补扣、简单开线和包装破损处理' },
] as const

export const SERVICE_FLOW = [
  ['01', '需求确认', '确认商品类型、处理范围和质量标准。'],
  ['02', '商品到仓', '完成签收、清点和基础信息登记。'],
  ['03', '质检分类', '判断商品进入上架、整理、修复、退回或报废流程。'],
  ['04', '执行处理', '按照品牌标准完成对应操作。'],
  ['05', '结果复核', '复核数量、质量和处理结果。'],
  ['06', '数据反馈', '将处理结果回传并完成后续入库、发货或退回。'],
] as const

export const ASSURANCE_POINTS = [
  {
    value: `${SERVICE_FACTS.inventoryAccuracy}+`,
    label: '库存准确率',
    note: '数据准，货位与状态持续管理',
  },
  {
    value: SERVICE_FACTS.orderPickupCutoff,
    label: '日常订单截单时间',
    note: '以项目约定的订单规则执行',
  },
  {
    value: `${SERVICE_FACTS.orderDispatchDeadline}前`,
    label: '符合条件订单当日发出',
    note: '具体以合作方案与订单条件为准',
  },
  { value: '全流程', label: '商品状态可追踪', note: '从入仓到交付，关键节点可追踪' },
] as const

export const ASSURANCE_MECHANISMS = [
  { title: '标准流程作业', note: 'SOP规范执行，保持服务一致性', icon: 'standard' },
  { title: '多重质检机制', note: '关键环节质检，降低错误风险', icon: 'check' },
  { title: '系统记录留存', note: '全流程记录可查，追溯可回看', icon: 'record' },
  { title: '异常快速响应', note: '异常识别与处置，及时闭环', icon: 'alert' },
  { title: '持续改进优化', note: '基于数据与反馈，持续迭代', icon: 'improve' },
] as const

export type AssuranceIcon = (typeof ASSURANCE_MECHANISMS)[number]['icon']
