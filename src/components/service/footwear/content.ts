import type { FeatureItem, StatItem } from '@/data/service'
import { CLAIM_TEXT } from '@/lib/claims'

export type FootwearFeatureGroups = Record<
  'goods' | 'channels' | 'daily' | 'unknown',
  FeatureItem[]
>
export type FootwearStatGroups = Record<'daily' | 'partner' | 'unknown', StatItem[]>

const featureGroups = new Map<string, keyof Omit<FootwearFeatureGroups, 'unknown'>>([
  [
    'RFID智能识别\u0000围绕商品识别、款色码和拣货复核组织仓内作业，具体启用方式按项目确认。',
    'goods',
  ],
  [
    `精细库存管控\u0000通过日常盘点与货品状态核对管理库存；${CLAIM_TEXT.inventoryAccuracy}为仓内库存准确率。`,
    'goods',
  ],
  [
    '全渠道一盘货\u0000支持天猫、京东、拼多多、唯品会 JIT/JITX、抖音和小程序等渠道的订单协同，结合库存核对与出库安排。',
    'channels',
  ],
  [
    '深度定制WMS\u0000支持序列号、RFID、款色码管理及线上线下协同，可按项目使用奇门、EDI或定制接口；不收系统使用费，实施和定制费用按方案确认。',
    'channels',
  ],
  [
    `弹性产能机制\u0000大促前可根据预计货量安排仓容、人力、包材与作业；${CLAIM_TEXT.singleWarehousePeak}为实际单仓单日运营峰值，${CLAIM_TEXT.regionalPeak}为地区运营峰值，具体项目安排按方案确认。`,
    'daily',
  ],
  [
    '全程监控追溯\u0000保留拆包、操作台和关键区域的作业记录，支持按订单调取记录并按项目处理争议举证。',
    'daily',
  ],
])

const statGroups = new Map<string, keyof Omit<FootwearStatGroups, 'unknown'>>([
  [`${CLAIM_TEXT.shippingAccuracy}\u0000发货准确率\u0000出库扫码复核与发货核对。`, 'daily'],
  [
    `${CLAIM_TEXT.singleWarehousePeak}\u0000单仓峰值\u0000实际单仓单日运营峰值；具体项目安排按方案确认。`,
    'daily',
  ],
  [
    `18:00前\u0000截单时间\u0000${CLAIM_TEXT.shippingSla}；送达时效受承运商线路、目的地和平台规则影响。`,
    'daily',
  ],
  [`${CLAIM_TEXT.partnerBrands}\u0000合作品牌\u0000新亦源合作品牌。`, 'partner'],
])

export const groupFootwearFeatures = (features: FeatureItem[]): FootwearFeatureGroups => {
  const groups: FootwearFeatureGroups = { goods: [], channels: [], daily: [], unknown: [] }
  for (const feature of features) {
    const group = featureGroups.get(`${feature.title}\u0000${feature.desc}`)
    groups[group ?? 'unknown'].push(feature)
  }
  return groups
}

export const groupFootwearStats = (stats: readonly StatItem[]): FootwearStatGroups => {
  const groups: FootwearStatGroups = { daily: [], partner: [], unknown: [] }
  for (const stat of stats) {
    const group = statGroups.get(`${stat.stat}\u0000${stat.label}\u0000${stat.sub}`)
    groups[group ?? 'unknown'].push(stat)
  }
  return groups
}
