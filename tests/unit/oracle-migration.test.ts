import { describe, expect, it } from 'vitest'

import {
  analyzeTransferFields,
  contentDigest,
  normalizeTransferItem,
} from '../../deploy/oracle19c/lib/migration-data.mjs'

describe('Oracle Directus content transfer', () => {
  const ordinaryFields = [
    { field: 'id', schema: { is_primary_key: true }, meta: {} },
    { field: 'title', schema: {}, meta: {} },
    { field: 'date_created', schema: {}, meta: { special: ['date-created'] } },
  ]

  it('regenerates technical primary keys but keeps business content', () => {
    const { fields, primaryKey } = analyzeTransferFields(ordinaryFields, 'news')
    expect(primaryKey).toBe('id')
    expect(normalizeTransferItem({ id: 9, title: '文章', date_created: 'now' }, fields)).toEqual({
      title: '文章',
    })
  })

  it('refuses relational collections instead of silently corrupting references', () => {
    expect(() =>
      analyzeTransferFields(
        [
          ...ordinaryFields,
          {
            field: 'author',
            schema: { foreign_key_table: 'authors' },
            meta: { special: ['m2o'] },
          },
        ],
        'news'
      )
    ).toThrow(/relational/)
  })

  it('produces an order-independent content digest', () => {
    expect(contentDigest([{ title: 'A' }, { title: 'B' }])).toBe(
      contentDigest([{ title: 'B' }, { title: 'A' }])
    )
  })
})
