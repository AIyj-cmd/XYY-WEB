import { describe, expect, it, vi } from 'vitest'

import {
  applyContractFieldConvergence,
  planContractFieldConvergence,
} from '../../scripts/lib/cms-contract-field-convergence.mjs'

describe('FAQ contract convergence', () => {
  it('requires populated FAQ relations before tightening the field and deletion rule', async () => {
    const issues: string[] = []
    const changes = planContractFieldConvergence(
      {
        records: { faqs: [{ id: 1, faq_page: 10 }] },
        fields: {
          faqs: [
            {
              field: 'faq_page',
              type: 'integer',
              meta: { required: false },
              schema: { is_nullable: true },
            },
          ],
        },
        relations: {
          faqs: [
            {
              id: 7,
              field: 'faq_page',
              related_collection: 'faq_pages',
              schema: { on_delete: 'SET NULL' },
            },
          ],
        },
      },
      issues
    )
    const directus = { request: vi.fn(async () => ({})) }

    expect(issues).toEqual([])
    expect(changes).toEqual(
      expect.arrayContaining([
        { phase: 'require_contract', collection: 'faqs', field: 'faq_page' },
        expect.objectContaining({ phase: 'relation_update', id: 7, field: 'faq_page' }),
      ])
    )
    await expect(applyContractFieldConvergence(directus, changes)).resolves.toBe(2)
    expect(directus.request).toHaveBeenCalledWith(
      'PATCH',
      '/relations/7',
      expect.objectContaining({ schema: { on_delete: 'RESTRICT' } })
    )
    expect(directus.request).toHaveBeenCalledWith('PATCH', '/fields/faqs/faq_page', {
      meta: { required: true },
      schema: { is_nullable: false },
    })
  })

  it('does not guess an absent FAQ relation before tightening the contract', () => {
    const issues: string[] = []
    const changes = planContractFieldConvergence(
      {
        records: { faqs: [{ id: 1, faq_page: null }] },
        fields: { faqs: [{ field: 'faq_page', type: 'integer', meta: {}, schema: {} }] },
      },
      issues
    )
    expect(changes).toEqual([expect.objectContaining({ phase: 'relation', field: 'faq_page' })])
    expect(issues).toContain('manual_mapping_required collection=faqs relation=faq_page')
  })
})
