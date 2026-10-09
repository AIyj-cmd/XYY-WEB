import type { SiteLocale } from './routes'

export const shellCopy = (locale: SiteLocale) =>
  locale === 'en'
    ? {
        brand: 'XINYIYUAN Supply Chain',
        home: 'XINYIYUAN Supply Chain home',
        nav: 'Primary navigation',
        scrollTop: 'Back to top',
        chat: 'Contact us',
        phone: 'Call us',
        phoneLabel: 'Domestic service line',
        nationwide: 'China',
        services: 'Services',
        quick: 'Quick links',
        contact: 'Contact and address',
        cultureTitle: 'Corporate culture',
        culture: [
          {
            label: 'Vision:',
            value:
              'To be the most professional and trusted strategic partner for apparel and footwear brands.',
          },
          {
            label: 'Mission:',
            value:
              'Improve inventory turnover and logistics efficiency through smart warehousing, so apparel and footwear brands can focus on creation and growth.',
          },
          { label: 'Values:', value: 'Simplicity · Sincerity · Shared success' },
          { label: 'Service philosophy:', value: 'Respect customer needs. Put customers first.' },
        ],
        rights: 'All rights reserved.',
        privacy: 'Privacy notice',
      }
    : {
        brand: '新亦源供应链',
        home: '新亦源供应链首页',
        nav: '主导航',
        scrollTop: '回到顶部',
        chat: '在线咨询',
        phone: '电话咨询',
        phoneLabel: '电话咨询',
        nationwide: '全国',
        services: '仓配服务',
        quick: '快速入口',
        contact: '联系与地址',
        cultureTitle: '企业文化',
        culture: [
          { label: '愿景：', value: '成为鞋服品牌最专业最值得信赖的战略伙伴。' },
          {
            label: '使命：',
            value: '用智慧云仓提高库存周转与物流效率，让鞋服品牌专注创造与增长。',
          },
          { label: '价值观：', value: '简单 · 真诚 · 共赢' },
          { label: '服务理念：', value: '尊重需求，客户至上。' },
        ],
        rights: '保留所有权利.',
        privacy: '个人信息保护说明',
      }
