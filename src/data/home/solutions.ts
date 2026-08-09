import type { Service } from '@/lib/directus'
import { CLAIM_TEXT } from '@/lib/claims'

export const HOME_SOLUTION_COPY = [
  {
    problem: '订单越来越复杂，品牌需要更懂鞋服的仓配体系',
    subtitle: '全渠道一盘货，让库存和订单高效协同',
    description:
      '从商品入仓、库存管理到订单履约与退货处理，为鞋服品牌打造稳定、高效的一体化仓配体系。',
    caption: ['恒温仓储', '分类存储', '条码管理'],
    badge: '鞋服仓储挂装区',
    scenarios: ['直播电商', '品牌直营', '线下门店'],
    cta: '查看仓配方案 →',
  },
  {
    problem: '退货真正难的，不是收回来，而是判断还能不能再次销售',
    subtitle: `${CLAIM_TEXT.recognizableAnomalies}异常识别，退货质检+二次上架${CLAIM_TEXT.returnTurnaround}`,
    description: '从退货拆包、质检分级到清洁修复和二次上架，为鞋服品牌建立标准化的逆向处理体系。',
    caption: ['外观检查', '内里检查', '配饰检查', '分级修复'],
    badge: '退货质检作业区',
    scenarios: ['电商退货', '大促退货', '门店退仓', '供应商退货'],
    cta: '查看退货处理方案 →',
  },
  {
    problem: '平台、仓库和物流数据分散，品牌很难及时掌握真实履约状态',
    subtitle: '六大系统模块协同，订单履约全程可视',
    description:
      '以OTD物流服务中台为数字化底座，连接订单、库存、仓内作业、物流轨迹与签收数据，支持异常预警和履约状态查询。',
    caption: ['订单履约', '库存同步', '物流监控', '异常预警', '签收回传'],
    badge: '数字化运营中心',
    scenarios: ['多平台订单', '多仓协同', '物流路由', '异常预警', '系统对接'],
    cta: '查看系统对接方案 →',
  },
] as const

export function resolveHomeServiceHref(service: Service, index: number) {
  if (service.slug.includes('yuncang') || service.name.includes('云仓')) return '/xiefu-yuncang'
  if (service.slug.includes('tuihuo') || service.name.includes('退货')) return '/tuihuo-zhijian'
  if (service.slug.includes('shuzihua') || service.name.includes('数字化')) {
    return '/wuliu-shuzihua'
  }
  return ['/xiefu-yuncang', '/tuihuo-zhijian', '/wuliu-shuzihua'][index] ?? '/contact'
}
