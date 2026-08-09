export interface PublicationIssue {
  issue: number
  title: string
  season: string
  summary: string
  cover: string
  pdf: string
  date: string
  isLatest: boolean
}

export const PUBLICATION_ISSUES: PublicationIssue[] = [
  {
    issue: 14,
    title: '森林期刊·第14期',
    season: '',
    summary:
      '最新一期！聚焦鞋服供应链数智化前沿，结合品牌实战案例，深度呈现新亦源在仓内自动化与全链路效能提升上的最新成果。',
    cover: '/senlinqikan/covers/14.jpg',
    pdf: '/senlinqikan/pdf/14.pdf',
    date: '2025',
    isLatest: true,
  },
  {
    issue: 13,
    title: '森林期刊·第13期',
    season: '',
    summary:
      '聚焦鞋服云仓最新动态与行业趋势，分享新亦源在数智化升级、跨境出海业务布局上的最新进展。',
    cover: '/senlinqikan/covers/13.jpg',
    pdf: '/senlinqikan/pdf/13.pdf',
    date: '2025',
    isLatest: false,
  },
  {
    issue: 12,
    title: '森林期刊·第12期',
    season: '',
    summary:
      '深度解析鞋服全渠道仓配协同策略，结合直播电商、B2B门店配送场景，呈现新亦源一体化仓配解决方案。',
    cover: '/senlinqikan/covers/12.jpg',
    pdf: '/senlinqikan/pdf/12.pdf',
    date: '2025',
    isLatest: false,
  },
  {
    issue: 11,
    title: '森林期刊·第11期',
    season: '',
    summary:
      '聚焦退货质检与售后修复全链路，结合品牌客户真实案例，拆解如何将退货损耗率降低20%以上。',
    cover: '/senlinqikan/covers/11.jpg',
    pdf: '/senlinqikan/pdf/11.pdf',
    date: '2025',
    isLatest: false,
  },
  {
    issue: 10,
    title: '森林期刊·第10期',
    season: '夏',
    summary:
      '首次转型电子书刊，响应ESG理念。聚焦2024年行业动态与员工发展，收录新亦源在绿色仓储与人才培养上的阶段性实践成果。',
    cover: '/senlinqikan/covers/10.jpg',
    pdf: '/senlinqikan/pdf/10.pdf',
    date: '2024',
    isLatest: false,
  },
  {
    issue: 9,
    title: '森林期刊·第9期',
    season: '国风·绿',
    summary:
      '以国风绿为主视觉，探讨鞋服物流行业的绿色低碳实践，以及新亦源在节能降耗方面的探索与成果。',
    cover: '/senlinqikan/covers/9.jpg',
    pdf: '/senlinqikan/pdf/9.pdf',
    date: '2024',
    isLatest: false,
  },
  {
    issue: 8,
    title: '森林期刊·第8期',
    season: '国风·红',
    summary:
      '以中国红为主题，回顾新亦源年度里程碑，展示鞋服供应链在大促备战与弹性产能方面的实战经验。',
    cover: '/senlinqikan/covers/8.jpg',
    pdf: '/senlinqikan/pdf/8.pdf',
    date: '2024',
    isLatest: false,
  },
  {
    issue: 7,
    title: '森林期刊·第7期',
    season: '秋',
    summary:
      '秋季特辑，解读鞋服电商大促物流备战方法论，双11仓储容量规划、波次拣货与时效保障实操指南。',
    cover: '/senlinqikan/covers/7.jpg',
    pdf: '/senlinqikan/pdf/7.pdf',
    date: '2024',
    isLatest: false,
  },
  {
    issue: 6,
    title: '森林期刊·第6期',
    season: '夏',
    summary:
      '夏季刊聚焦鞋服仓储效率提升，介绍智能分拣、RFID盘点及多温层存储在服饰品类上的应用实践。',
    cover: '/senlinqikan/covers/6.jpg',
    pdf: '/senlinqikan/pdf/6.pdf',
    date: '',
    isLatest: false,
  },
  {
    issue: 5,
    title: '森林双月刊·第5期',
    season: '春',
    summary: '主题：“用热爱奔跑，物流时光岁月”。',
    cover: '/senlinqikan/covers/5.jpg',
    pdf: '/senlinqikan/pdf/5.pdf',
    date: '',
    isLatest: false,
  },
  {
    issue: 4,
    title: '森林双月刊·第4期',
    season: '',
    summary:
      '2022年度第四期双月刊，持续记录新亦源仓储团队的日常与成长，涵盖仓内培训实况、员工风采与运营管理经验分享。',
    cover: '/senlinqikan/covers/4.jpg',
    pdf: '/senlinqikan/pdf/4.pdf',
    date: '2022',
    isLatest: false,
  },
  {
    issue: 3,
    title: '森林双月刊·第3期',
    season: '',
    summary:
      '2022年度第三期双月刊，聚焦鞋服仓储一线团队建设与操作规范推广，记录新亦源在制度化管理和员工凝聚力建设上的探索实践。',
    cover: '/senlinqikan/covers/3.jpg',
    pdf: '/senlinqikan/pdf/3.pdf',
    date: '2022',
    isLatest: false,
  },
  {
    issue: 2,
    title: '森林双月刊·第2期',
    season: '',
    summary: '主题：“新亦源与您同源”。',
    cover: '/senlinqikan/covers/2.jpg',
    pdf: '/senlinqikan/pdf/2.pdf',
    date: '2022',
    isLatest: false,
  },
  {
    issue: 1,
    title: '森林双月刊·创刊号',
    season: '',
    summary:
      '《新亦源森林》创刊号，2022年第1期。设森林公约、技能装备、执掌引风、森林活动、森林擂台五大栏目，以简洁语言和精彩图片，打造员工信息交流与自我展示的品牌内刊平台。',
    cover: '/senlinqikan/covers/1.jpg',
    pdf: '/senlinqikan/pdf/1.pdf',
    date: '2022',
    isLatest: false,
  },
]
