import { CLAIM_TEXT } from '@/lib/claims'

export const SPECIALTY_LINKS = [
  { href: '/xiefu-yuncang', label: '鞋服云仓', sub: 'B2C+B2B+O2O全渠道' },
  { href: '/huadong-xiefu-yuncang', label: '华东鞋服云仓', sub: '上海仓·长三角覆盖' },
  {
    href: '/tuihuo-zhijian',
    label: '退货质检',
    sub: `${CLAIM_TEXT.recognizableAnomalies}异常识别`,
  },
  {
    href: '/houzheng-xiufu',
    label: '后整修复',
    sub: `修复成功率${CLAIM_TEXT.repairSuccessRate}`,
  },
  { href: '/kuajing-yuncang', label: '跨境云仓', sub: '国内端仓储+项目质检' },
  { href: '/zhibo-cangpei', label: '直播电商仓配', sub: '抖音/快手/淘宝直播' },
  { href: '/huanan-xiefu-yuncang', label: '华南鞋服云仓', sub: '广州+东莞+佛山+肇庆' },
  { href: '/guangzhou-xiefu-yuncang', label: '广州鞋服云仓', sub: '服务广州及珠三角' },
  { href: '/b2b-mendian-cangpei', label: 'B2B门店仓配', sub: '连锁补货·批发铺货' },
] as const

export type SpecialtyLink = (typeof SPECIALTY_LINKS)[number]
