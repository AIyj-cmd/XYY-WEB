import type { SiteLocale } from '@/i18n/routes'

const en = {
  hero: {
    eyebrow: 'ABOUT US',
    brand: 'XINYIYUAN SUPPLY CHAIN',
    titleLines: ['Every brand', 'deserves', 'professional', 'fulfilment.'],
    overviewHeading: 'ABOUT XINYIYUAN',
    homeAria: 'XINYIYUAN Supply Chain home',
    logoAlt: 'XINYIYUAN Supply Chain',
    pauseVideo: 'Pause video',
    playVideo: 'Play video',
    unmuteVideo: 'Turn sound on',
    muteVideo: 'Mute video',
  },
  history: {
    heading: 'Our journey',
    introduction: [
      'Founded in Guangzhou in 2011, XINYIYUAN began with apparel logistics and fulfilment.',
      'In 2017, the company secured angel investment; in 2019, it established its apparel warehousing focus and operating procedures.',
    ],
    previous: 'Previous year',
    next: 'Next year',
    jumpToYear: (year: string) => `Go to ${year}`,
    imageAlt: (year: string) => `${year} milestone`,
  },
  explorer: {
    label: 'Explore XINYIYUAN',
    entries: [
      { id: 'history', number: '01', title: 'Our journey', eyebrow: 'HISTORY' },
      { id: 'warehouse', number: '02', title: 'Warehouse network', eyebrow: 'WAREHOUSE NETWORK' },
      { id: 'honors', number: '03', title: 'Credentials & honours', eyebrow: 'HONOURS' },
      { id: 'faq', number: '04', title: 'Frequently asked questions', eyebrow: 'FAQ' },
    ],
    dialogTitle: 'Explore XINYIYUAN',
    close: 'Close content panel',
  },
  warehouseNetwork: {
    mapTitle: 'WAREHOUSE NETWORK',
    mapDetail: 'South China · East China · Central China',
    eyebrow: 'WAREHOUSE NETWORK',
    heading: 'A three-tier CDC / RDC / FDC network across South, East and Central China.',
    description:
      'CDC, RDC and FDC nodes are configured by project to coordinate inventory and order routing.',
    tiers: {
      CDC: {
        name: 'Central distribution centre',
        desc: 'Based in South China, our central warehouse supports nationwide allocation, large-scale multi-channel inventory management and intelligent wave picking.',
        location: 'South China headquarters',
        tags: ['Central allocation', 'Multi-channel dispatch', 'Intelligent waves'],
      },
      RDC: {
        name: 'Regional distribution centre',
        desc: 'East China regional nodes support replenishment and nearby dispatch, helping projects coordinate trunk-line distance and delivery timing.',
        location: 'Kunshan · Shanghai · Hefei',
        tags: ['Regional replenishment', 'Nearby dispatch', 'Lower handling loss'],
      },
      FDC: {
        name: 'Factory distribution centre',
        desc: 'Factory-connected operations support origin dispatch, faster new-stock availability and project-based warehouse configuration.',
        location: 'Jianli, Hubei; address and activation scope are confirmed by project',
        tags: ['Origin dispatch', 'Faster availability', 'Flexible configuration'],
      },
    },
  },
  warehouseRegions: {
    heading: 'South China and East China warehouse locations',
    warehouseCount: (count: number) => `${count} warehouse${count === 1 ? '' : 's'}`,
    groupCount: (count: number) => `${count}`,
    cityLabels: {
      广州: 'Guangzhou',
      东莞: 'Dongguan',
      佛山: 'Foshan',
      肇庆: 'Zhaoqing',
      昆山: 'Kunshan',
      上海: 'Shanghai',
      合肥: 'Hefei',
    },
    regions: {
      south: {
        label: 'SOUTH CHINA LOCATIONS',
        cities: 'Guangzhou · Dongguan · Foshan · Zhaoqing',
        note: 'New-goods inspection · Returns inspection · Garment care',
      },
      east: {
        label: 'EAST CHINA LOCATIONS',
        cities: 'Kunshan · Shanghai · Hefei',
        note: 'Yangtze River Delta nodes · Regional coordination',
      },
    },
    addressPending: 'Address pending confirmation',
    addressUnavailable: 'Address to be announced',
  },
  honors: {
    eyebrow: 'CREDENTIALS & HONOURS',
    heading: 'Credentials & honours',
    lightbox: 'Certificate image',
    closeLightbox: 'Close certificate image',
  },
  gallery: {
    field: 'XINYIYUAN team and operations images',
    imageAlt: (id: number) => `XINYIYUAN team and operations image ${id}`,
    eyebrow: 'FOR EVERY XINYIYUAN COLLEAGUE',
    statements: [
      {
        title: 'Care in every step\nopens the way for every arrival.',
        body: 'The everyday discipline that may go unseen is what becomes dependable for our clients.',
      },
      {
        title: 'Doing ordinary work well\nis our shared expertise.',
        body: 'We do not need to be seen first, and we do not take any trust for granted.',
      },
      {
        title: 'Together, we make complexity\nreliable.',
        body: 'We support and trust one another so every collaboration can go further.',
      },
      {
        title: 'One more step today\nbrings more confidence tomorrow.',
        body: 'There are no shortcuts to growth, but every step counts.',
      },
      {
        title: 'XINYIYUAN’s next chapter\nis written by all of us.',
        body: 'Stay committed and keep moving: a better answer is always ahead.',
      },
    ],
  },
  footer: {
    label: 'About page footer',
    contact: 'XINYIYUAN contact information',
    backToTop: 'Back to top',
    copyright: (year: number) => `© ${year} Guangzhou XINYIYUAN Supply Chain Management Co., Ltd.`,
  },
}

const zhCN = {
  hero: {
    eyebrow: '关于我们',
    brand: '新亦源供应链',
    titleLines: ['让每个品牌', '都有专业的', '出货能力'],
    overviewHeading: '关于新亦源',
    homeAria: '新亦源供应链首页',
    logoAlt: '新亦源供应链',
    pauseVideo: '暂停视频',
    playVideo: '播放视频',
    unmuteVideo: '开启声音',
    muteVideo: '静音',
  },
  history: {
    heading: '发展历程',
    introduction: [
      '新亦源主体创立于2011年，早期深耕鞋服物流与仓配服务；',
      '2017年获千万级天使投资；2019年完成战略定位，布局服装仓储中心并建立仓配服务SOP。',
    ],
    previous: '上一年',
    next: '下一年',
    jumpToYear: (year: string) => `跳到${year}年`,
    imageAlt: (year: string) => `${year}年发展历程`,
  },
  explorer: {
    label: '浏览新亦源',
    entries: [
      { id: 'history', number: '01', title: '发展历程', eyebrow: 'HISTORY' },
      { id: 'warehouse', number: '02', title: '仓网布局', eyebrow: 'WAREHOUSE NETWORK' },
      { id: 'honors', number: '03', title: '资质与荣誉', eyebrow: 'HONORS' },
      { id: 'faq', number: '04', title: '常见问题', eyebrow: 'FAQ' },
    ],
    dialogTitle: '了解新亦源',
    close: '关闭内容层',
  },
  warehouseNetwork: {
    mapTitle: '仓网布局',
    mapDetail: '华南 · 华东 · 华中，区域仓网协同',
    eyebrow: '仓网布局',
    heading: 'CDC/RDC/FDC三级仓网，覆盖华南、华东与华中节点',
    description: 'CDC + RDC + FDC 三级仓网，按项目配置仓点、库存与订单路由',
    tiers: {},
  },
  warehouseRegions: {
    heading: '华南与华东仓点',
    warehouseCount: (count: number) => `${count} 个仓点`,
    groupCount: (count: number) => `${count} 个`,
    cityLabels: {},
    regions: {
      south: {
        label: '华南仓点',
        cities: '广州 · 东莞 · 佛山 · 肇庆',
        note: '新货质检 · 退货质检 · 整烫修复',
      },
      east: {
        label: '华东仓点',
        cities: '昆山 · 上海 · 合肥',
        note: '长三角区域节点 · 区域仓网协同',
      },
    },
    addressPending: '地址待确认',
    addressUnavailable: '地址待公布',
  },
  honors: {
    eyebrow: '资质与荣誉',
    heading: '资质与荣誉',
    lightbox: '证书大图',
    closeLightbox: '关闭证书大图',
  },
  gallery: {
    field: '新亦源团队与工作影像',
    imageAlt: (id: number) => `新亦源团队与工作现场影像 ${id}`,
    eyebrow: '致每一位新亦源同行者',
    statements: [
      {
        title: '每一次认真，\n都在为下一次抵达铺路。',
        body: '那些看似平常的坚持，最终都会成为客户心里的可靠。',
      },
      {
        title: '把普通的岗位做好，\n就是我们共同的专业。',
        body: '不急于被看见，也不辜负每一份托付。',
      },
      {
        title: '并肩时，\n我们把复杂变成可靠。',
        body: '彼此补位、彼此信任，让每一次协作都更有力量。',
      },
      { title: '今天多走一步，\n明天就多一份底气。', body: '成长没有捷径，但每一步都算数。' },
      {
        title: '新亦源的下一程，\n由每一个我们共同写下。',
        body: '保持热爱，继续向前；更好的答案，始终在路上。',
      },
    ],
  },
  footer: {
    label: '关于页页脚',
    contact: '新亦源联系信息',
    backToTop: '返回顶部',
    copyright: (year: number) => `© ${year} 广州新亦源供应链管理有限公司`,
  },
}

export type AboutUi = typeof en

export function aboutUi(locale: SiteLocale = 'zh-CN'): AboutUi {
  return locale === 'en' ? en : (zhCN as AboutUi)
}
