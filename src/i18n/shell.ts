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
        rights: '保留所有权利.',
        privacy: '个人信息保护说明',
      }
