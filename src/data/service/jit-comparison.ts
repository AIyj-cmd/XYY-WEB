import { CLAIM_TEXT } from '@/lib/claims'

export const JIT_COMPARE_ROWS = [
  {
    item: '模式定位',
    jit: '按需供货，活动前备货到仓，活动开始后按单快速发货，降低库存积压',
    jitx: 'JIT 升级版，极速供应链，适合爆款和高频复购商品，响应要求更严格',
  },
  {
    item: '发货时效要求',
    jit: '平日 48 小时内，活动期间 24 小时内',
    jitx: '平日 24 小时内，活动期间 12 小时内',
  },
  {
    item: '库存同步要求',
    jit: '实时库存同步，订单下发后自动波次拣货',
    jitx: '实时同步 + 提前预警机制，库存低于阈值自动提醒',
  },
  {
    item: '系统对接要求',
    jit: '标准奇门 / EDI 接口，WMS 与唯品会平台打通',
    jitx: '同 JIT，另需满足 JITX 专属接口协议与数据反馈频率',
  },
  {
    item: '主要扣分风险点',
    jit: '延时发货 · 短发漏发 · 包装质量不达标',
    jitx: '时间窗口违规 · 数量精确性误差 · 系统响应超时 · 标签错误',
  },
  {
    item: '新亦源应对方案',
    jit: `${CLAIM_TEXT.shippingSla} · ${CLAIM_TEXT.shippingAccuracy} 准确率 · SLA 合同保障`,
    jitx: '肇庆唯品会物流园内直发 · 极速产能响应 · 大促专项排班',
  },
] as const

export const JIT_RISK_ITEMS = [
  {
    risk: '延时发货',
    level: '高',
    tip: '仓配服务商未在活动时效内完成出库，直接触发唯品会平台扣分',
  },
  { risk: '短发 / 漏发', level: '高', tip: '实际出库数量与订单不符，影响品牌评级和平台信任分' },
  { risk: '包装不合规', level: '中', tip: '唯品会对包装规格、面单格式有严格要求，不合规将被退件' },
  {
    risk: '系统响应超时',
    level: '中',
    tip: 'JITX 对 WMS 与平台系统的响应频率有要求，延迟将触发预警',
  },
] as const
