import { beforeEach, describe, expect, it } from 'vitest'

import { __setDirectusRequesterForTests, getAboutContent, getSiteSettings } from '@/lib/directus'

const emptySettings = {
  phone: '',
  headquarters_label: '',
  headquarters_address: '',
  icp: '',
  footer_description: '',
}

describe('Directus singleton publication enforcement', () => {
  beforeEach(() => __setDirectusRequesterForTests(null))

  it('suppresses draft and archived content even if the API returns it', async () => {
    for (const status of ['draft', 'archived']) {
      __setDirectusRequesterForTests(async (collection) =>
        collection === 'about_content'
          ? { id: 1, status, overview: '不可公开', hero_description: '不可公开' }
          : {
              id: 1,
              status,
              phone: '400-secret',
              headquarters_label: '不可公开',
              headquarters_address: '不可公开',
              icp: '不可公开',
              footer_description: '不可公开',
            }
      )

      await expect(getAboutContent({ overview: '回退', heroDescription: '回退' })).resolves.toEqual(
        {
          overview: '',
          heroDescription: '',
        }
      )
      await expect(getSiteSettings(emptySettings)).resolves.toEqual(emptySettings)
    }
  })

  it('requires published filters and rejects persisted records with missing status', async () => {
    const queries: Array<{ collection: string; query: Record<string, unknown> }> = []
    __setDirectusRequesterForTests(async (collection, query) => {
      queries.push({ collection, query })
      return { id: 1, key: 'main' }
    })

    await expect(getAboutContent({ overview: '', heroDescription: '' })).rejects.toThrow(
      'reason=invalid_data'
    )
    await expect(getSiteSettings(emptySettings)).rejects.toThrow('reason=invalid_data')
    expect(queries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: 'about_content',
          query: expect.objectContaining({ filter: { status: { _eq: 'published' } } }),
        }),
        expect.objectContaining({
          collection: 'site_settings',
          query: expect.objectContaining({ filter: { status: { _eq: 'published' } } }),
        }),
      ])
    )
  })
})
