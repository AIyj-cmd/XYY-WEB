import { describe, expect, it } from 'vitest'

import { BRAND } from '@/data/brand/core'
import { ORGANIZATION_ID, createOrganizationSchema } from '@/lib/seo'

describe('brand identity schema', () => {
  it('uses the known Chinese legal name with the established English brand aliases', () => {
    const organization = createOrganizationSchema()

    expect(organization).toMatchObject({
      '@id': ORGANIZATION_ID,
      name: BRAND.name,
      legalName: BRAND.fullName,
      url: BRAND.url,
      logo: `${BRAND.url}/logo.png`,
    })
    expect(organization.alternateName).toEqual([
      BRAND.shortName,
      BRAND.englishShortName,
      BRAND.englishName,
    ])
    expect(organization).not.toHaveProperty('sameAs')
  })
})
