import { describe, expect, it } from 'vitest'

import { CMS_COLLECTION_DEFINITIONS } from '../../scripts/data/cms-collection-definitions.mjs'

describe('contact service CMS field', () => {
  it('shows the stable service codes as Chinese labels', () => {
    const contactLeads = CMS_COLLECTION_DEFINITIONS.find(({ name }) => name === 'contact_leads')
    const service = contactLeads?.fields.find(({ field }) => field === 'service')
    const choices = [
      { text: '鞋服云仓', value: 'cloud-warehouse' },
      { text: '后整质检修复', value: 'quality-inspection' },
      { text: '物流云', value: 'logistics-cloud' },
      { text: '全链路解决方案', value: 'all' },
      { text: '其他', value: 'other' },
    ]

    expect(service?.meta).toMatchObject({
      interface: 'select-dropdown',
      display: 'labels',
      options: { choices },
      display_options: { choices },
    })
  })
})
