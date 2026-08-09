export const REPAIR_WORKSHOP_PHOTOS = [
  {
    src: '/images/services/repair-handwash.webp',
    alt: '服装清污处理工位',
    label: '清污工位',
    code: 'ZONE 04',
  },
  {
    src: '/images/services/repair-stitch.webp',
    alt: '服装缝补修复工位',
    label: '缝补工位',
    code: 'ZONE 06',
  },
  {
    src: '/images/services/repair-ironing.webp',
    alt: '服装手工熨烫工位',
    label: '熨烫工位',
    code: 'ZONE 02',
  },
] as const

export const REPAIR_ZONES = [
  '自动熨烫',
  '手工熨烫',
  '异味晾晒',
  '手工清污',
  '配饰修复',
  '缝补',
  '鞋类修复',
  '干湿洗',
  '补换标识',
] as const

export const REPAIR_WORK_ORDER_FLOW = [
  { num: '01', title: '质检分流', desc: '识别异常并依据客户标准进入相应处理流程' },
  { num: '02', title: '工艺评估', desc: '结合材质、瑕疵类型与验收规则确认处理方式' },
  { num: '03', title: '专区修复', desc: '工单流转至对应专业工位，关键状态留痕' },
  { num: '04', title: '二次质检', desc: '按品牌确认标准复检，再进入后续授权流程' },
] as const
