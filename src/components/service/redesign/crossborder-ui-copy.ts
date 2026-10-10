import type { SiteLocale } from '@/i18n/routes'

const zh = {
  eyebrow: '沟通方案',
  lines: ['梳理你的跨境', '仓内方案'],
  description: '可先准备目标平台、商品规范、标签与包装模板、预计处理量和物流交接要求。',
  action: '梳理跨境仓内方案',
  preparationItems: [
    { label: '目标平台', detail: '主要销售平台与发货方向' },
    { label: '商品规范', detail: '商品资料与处理要求' },
    { label: '标签与包装模板', detail: '标签内容与包装样式' },
    { label: '预计处理量', detail: '日常与活动处理预估' },
    { label: '物流交接要求', detail: '物流交接方式与时间' },
  ],
}
const en = {
  eyebrow: 'Discuss a plan',
  lines: ['Plan your cross-border', 'warehouse operations'],
  description:
    'Prepare your target platform, product requirements, label and packaging templates, estimated volume, and logistics handover requirements.',
  action: 'Plan cross-border warehouse operations',
  preparationItems: [
    { label: 'Target platform', detail: 'Primary sales platforms and dispatch destinations' },
    { label: 'Product requirements', detail: 'Product information and handling requirements' },
    { label: 'Label and packaging templates', detail: 'Label content and packaging format' },
    { label: 'Estimated volume', detail: 'Expected everyday and campaign volumes' },
    { label: 'Logistics handover requirements', detail: 'Handover method and timing' },
  ],
}
export const crossborderUi = (locale: SiteLocale) => (locale === 'en' ? en : zh)
