import { describe, expect, it, vi } from 'vitest'

import { CMS_CONTRACT_BY_COLLECTION } from '../../scripts/data/cms-contract-definitions.mjs'
import {
  loadCollectionSnapshot,
  validateCollectionSnapshot,
} from '../../scripts/lib/cms-contract-runtime.mjs'

const contract = CMS_CONTRACT_BY_COLLECTION.faqs
const snapshotField = (field: {
  field: string
  type: string
  meta?: Record<string, unknown>
  schema?: Record<string, unknown>
}) => ({
  field: field.field,
  type: field.type,
  meta: { required: Boolean(field.meta?.required) },
  schema: {
    is_nullable: field.schema?.is_nullable ?? !field.meta?.required,
    is_unique: Boolean(field.schema?.is_unique),
  },
})
const relation = contract.relations[0]
const relationSnapshot = {
  field: relation.field,
  related_collection: relation.related_collection,
  schema: { on_delete: relation.schema?.on_delete ?? null },
}

describe('FAQ runtime relation validation', () => {
  it.each([{}, { data: null }, { data: {} }])(
    'fails closed for malformed FAQ item payloads',
    async (payload) => {
      const request = vi.fn(async (_method: string, path: string) => {
        if (path === '/collections/faqs') return { collection: 'faqs', meta: { singleton: false } }
        if (path === '/fields/faqs') return contract.fields.map(snapshotField)
        if (path === '/relations/faqs') return [relationSnapshot]
        if (path.startsWith('/items/faqs?')) return payload
        if (path === '/items/faq_pages?limit=-1&fields=id,key') return []
        throw new Error(`unexpected request ${path}`)
      })
      await expect(loadCollectionSnapshot({ request }, contract)).rejects.toThrow('items_payload')
    }
  )

  it('fails closed for a malformed FAQ relation inventory', async () => {
    const request = vi.fn(async (_method: string, path: string) => {
      if (path === '/collections/faqs') return { collection: 'faqs', meta: { singleton: false } }
      if (path === '/fields/faqs') return contract.fields.map(snapshotField)
      if (path === '/relations/faqs') return [relationSnapshot]
      if (path.startsWith('/items/faqs?')) return { data: [] }
      if (path === '/items/faq_pages?limit=-1&fields=id,key') return {}
      throw new Error(`unexpected request ${path}`)
    })
    await expect(loadCollectionSnapshot({ request }, contract)).rejects.toThrow(
      'relation_target_inventory'
    )
  })

  it('requires every FAQ relation to point at an inventoried FAQ page', () => {
    const result = validateCollectionSnapshot(contract, {
      collection: { collection: 'faqs', meta: { singleton: false } },
      fields: contract.fields.map(snapshotField),
      relations: [relationSnapshot],
      records: [{ id: 1, content_key: 'faq-home-service-fit', faq_page: 999 }],
      relatedRecords: { faq_pages: [{ id: 10, key: 'home' }] },
    })
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'migration_required:relation_target_missing collection=faqs id=1 field=faq_page target=999',
      ])
    )
  })

  it('loads FAQ relation values and their target inventory together', async () => {
    const request = vi.fn(async (_method: string, path: string) => {
      if (path === '/collections/faqs') return { collection: 'faqs', meta: { singleton: false } }
      if (path === '/fields/faqs') return contract.fields.map(snapshotField)
      if (path === '/relations/faqs') return [relationSnapshot]
      if (path.startsWith('/items/faqs?')) {
        return { data: [{ id: 1, content_key: 'faq-home-service-fit', faq_page: 10 }] }
      }
      if (path === '/items/faq_pages?limit=-1&fields=id,key') return [{ id: 10, key: 'home' }]
      throw new Error(`unexpected request ${path}`)
    })

    await expect(loadCollectionSnapshot({ request }, contract)).resolves.toMatchObject({
      records: [{ id: 1, faq_page: 10 }],
    })
    expect(request).toHaveBeenCalledWith(
      'GET',
      expect.stringContaining('/items/faqs?limit=-1&fields=id,content_key,faq_page'),
      undefined,
      { unwrapData: false }
    )
    expect(request).toHaveBeenCalledWith('GET', '/items/faq_pages?limit=-1&fields=id,key')
  })
})
