import type { SiteLocale } from '@/i18n/routes'

type AboutExplorerCard = {
  description: string
}

export const aboutExplorerCards: Record<SiteLocale, Record<string, AboutExplorerCard>> = {
  en: {
    history: {
      description: 'Revisit XINYIYUAN’s development journey and key milestones.',
    },
    warehouse: {
      description: 'Explore regional warehouse coverage and fulfilment coordination.',
    },
    honors: {
      description: 'View company credentials and industry honours.',
    },
    faq: {
      description: 'Browse common questions about fulfilment partnerships and services.',
    },
  },
  'zh-CN': {
    history: {
      description: '回顾新亦源的发展足迹与重要节点。',
    },
    warehouse: {
      description: '了解区域仓网与仓配协同布局。',
    },
    honors: {
      description: '查看企业资质与行业荣誉。',
    },
    faq: {
      description: '查阅仓配合作与服务中的常见问题。',
    },
  },
}
