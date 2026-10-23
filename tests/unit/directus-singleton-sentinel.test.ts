import { beforeEach, describe, expect, it } from 'vitest'

import { __setDirectusRequesterForTests, requestSingleton } from '@/lib/directus-client'

describe('Directus empty singleton sentinel', () => {
  beforeEach(() => __setDirectusRequesterForTests(null))

  it.each([{ id: null }, { id: null, key: 'main' }, { id: null, status: null, key: 'main' }])(
    'normalizes an unpersisted Directus singleton shape to null',
    async (sentinel) => {
      __setDirectusRequesterForTests(async () => sentinel)

      await expect(requestSingleton('site_settings')).resolves.toBeNull()
    }
  )

  it.each([
    { id: null, key: 'other' },
    { id: null, status: 'published' },
    { id: null, overview: 'unexpected content' },
    { id: null, stats: [] },
  ])('does not hide a malformed id-null record %#', async (record) => {
    __setDirectusRequesterForTests(async () => record)

    await expect(requestSingleton('about_content')).resolves.toEqual(record)
  })

  it('does not normalize a persisted record with missing status', async () => {
    const record = { id: 7, key: 'main' }
    __setDirectusRequesterForTests(async () => record)

    await expect(requestSingleton('site_settings')).resolves.toEqual(record)
  })
})
