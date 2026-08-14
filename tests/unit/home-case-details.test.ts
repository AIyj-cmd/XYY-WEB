import { describe, expect, it } from 'vitest'

import { createHomeCaseDetails } from '@/data/cases/home-details'
import type { Case } from '@/lib/directus'

describe('homepage case details', () => {
  it('builds modal details for a case created only in Directus', () => {
    const cmsCase: Case = {
      id: 99,
      sort: 6,
      slug: 'new-brand',
      category: '女装',
      label: '新品牌',
      name: 'NEW BRAND',
      full_name: '新品牌（NEW BRAND）',
      accent: '#2563EB',
      case_description: '后台维护的案例说明。',
      stats: [{ label: '库存规模', value: '80万+', unit: '件' }],
      metrics: '库存规模 80万+件',
      details: '列表说明',
      tags: ['女装'],
      img: '/images/new-brand.jpg',
    }

    expect(createHomeCaseDetails([cmsCase])).toEqual({
      新品牌: {
        slug: 'new-brand',
        name: 'NEW BRAND',
        fullName: '新品牌（NEW BRAND）',
        category: '女装',
        image: '/images/new-brand.jpg',
        accent: '#2563EB',
        description: '后台维护的案例说明。',
        stats: [{ label: '库存规模', value: '80万+', unit: '件' }],
      },
    })
  })
})
