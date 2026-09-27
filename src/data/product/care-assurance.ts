import { SERVICE_FACTS } from '@/lib/brand'

export const ASSURANCE_POINTS = [
  {
    value: SERVICE_FACTS.inventoryAccuracy,
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
