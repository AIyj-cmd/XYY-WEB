import type { SiteLocale } from '@/i18n/routes'

const zh = {
  eyebrow: '咨询仓配服务',
  lines: ['选择适合你的', '华南仓库'],
  description: '告诉我们货源位置、主要收货地区和订单需求，我们会为你推荐合适的仓库与服务方案。',
  action: '咨询华南仓配服务',
  preparationItems: [
    { label: '货源位置', detail: '所在城市与入仓安排' },
    { label: '主要收货地区', detail: '主要收货城市与区域' },
    { label: '订单需求', detail: '日常订单与配送安排' },
  ],
}
const en = {
  eyebrow: 'Discuss fulfilment',
  lines: ['Choose the right', 'South China warehouse'],
  description:
    'Tell us where your stock is located, your main delivery regions, and order requirements. We can recommend a suitable warehouse and service plan.',
  action: 'Discuss South China fulfilment',
  preparationItems: [
    { label: 'Stock location', detail: 'City and receiving arrangements' },
    { label: 'Main delivery regions', detail: 'Main delivery cities and regions' },
    { label: 'Order requirements', detail: 'Everyday orders and delivery arrangements' },
  ],
}
export const southUi = (locale: SiteLocale) => (locale === 'en' ? en : zh)
