export const CONTACT_SERVICE_OPTIONS = [
  { slug: 'xiefu-yuncang', value: '鞋服云仓', english: 'Apparel fulfilment' },
  { slug: 'tuihuo-zhijian', value: '退货质检', english: 'Returns inspection' },
  { slug: 'houzheng-xiufu', value: '后整修复', english: 'Garment care and repair' },
  { slug: 'kuajing-yuncang', value: '跨境云仓', english: 'Cross-border fulfilment' },
  { slug: 'huanan-xiefu-yuncang', value: '华南鞋服云仓', english: 'South China fulfilment' },
  { slug: 'huadong-xiefu-yuncang', value: '华东鞋服云仓', english: 'East China fulfilment' },
  { slug: 'zhibo-cangpei', value: '直播电商仓配', english: 'Livestream fulfilment' },
  { slug: 'b2b-mendian-cangpei', value: 'B2B门店仓配', english: 'Retail distribution' },
] as const

export type ContactServiceOption = (typeof CONTACT_SERVICE_OPTIONS)[number]
export type ContactServiceValue = ContactServiceOption['value']

export function getContactServiceOption(slug: string): ContactServiceOption | null {
  return CONTACT_SERVICE_OPTIONS.find((option) => option.slug === slug) ?? null
}
