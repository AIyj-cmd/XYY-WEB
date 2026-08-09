export const SOUTH_NETWORK_NODES = [
  {
    city: '广州',
    code: 'GZ / 主节点',
    role: '电商仓配 · 门店补货 · 退货质检',
    note: '项目库存与订单在此汇总编排',
  },
  {
    city: '东莞',
    code: 'DG / 制造协同',
    role: '货源入仓 · 仓储 · 发货',
    note: '衔接制造业与品牌货源',
  },
  {
    city: '佛山',
    code: 'FS / 区域协同',
    role: '区域仓配 · 周边履约',
    note: '按项目确认仓点与启用条件',
  },
  {
    city: '肇庆',
    code: 'ZQ / 平台协同',
    role: '唯品会 JIT / JITX 等相关项目',
    note: '平台规则与作业范围按项目核验',
  },
] as const

export const SOUTH_COLLABORATION_BANDS = [
  {
    num: '01',
    title: '仓容协同',
    desc: '依据SKU、库存深度与业务类型，确认实际启用仓点和库存分布。',
    signal: '库存布局',
  },
  {
    num: '02',
    title: '人力协同',
    desc: '结合日常订单与活动预测，组织各节点作业班次和弹性资源。',
    signal: '峰值准备',
  },
  {
    num: '03',
    title: '物流协同',
    desc: '按目的地、渠道和线路SLA配置承运资源，仓内按统一截单口径履约。',
    signal: '线路编排',
  },
  {
    num: '04',
    title: '系统协同',
    desc: '以项目系统方案连接订单、库存、仓内作业与退货处理状态。',
    signal: '状态贯通',
  },
] as const
