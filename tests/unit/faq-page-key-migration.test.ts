import { describe, expect, it, vi } from 'vitest'

import {
  applyFaqPageKeyMigrationPlan,
  buildFaqPageKeyMigrationPlan,
  readFaqPageKeyMigrationSnapshot,
} from '../../scripts/lib/faq-page-key-migration.mjs'

const snapshot = (): {
  records: {
    faq_pages: Array<{ id: number; key: string }>
    faqs: Array<{ id: number; faq_page: number | null; page_key: string }>
  }
} => ({
  records: {
    faq_pages: [
      { id: 10, key: 'home' },
      { id: 11, key: 'about' },
    ],
    faqs: [{ id: 1, faq_page: null, page_key: 'home' }],
  },
})

describe('explicit FAQ legacy page_key migration', () => {
  it('maps an absent relation only from the matching legacy key', () => {
    expect(buildFaqPageKeyMigrationPlan(snapshot())).toEqual({
      changes: [{ collection: 'faqs', id: 1, patch: { faq_page: 10 } }],
      issues: [],
    })
  })

  it('uses an existing valid relation as authoritative when aligning the legacy field', () => {
    const current = snapshot()
    current.records.faqs = [{ id: 1, faq_page: 11, page_key: 'home' }]
    expect(buildFaqPageKeyMigrationPlan(current)).toEqual({
      changes: [{ collection: 'faqs', id: 1, patch: { page_key: 'about' } }],
      issues: [],
    })
  })

  it('requires manual mapping for unknown or dangling data and performs no write', async () => {
    const current = snapshot()
    current.records.faqs = [
      { id: 1, faq_page: null, page_key: 'unknown' },
      { id: 2, faq_page: 999, page_key: 'home' },
    ]
    const plan = buildFaqPageKeyMigrationPlan(current)
    const directus = { request: vi.fn() }

    expect(plan.issues).toEqual(
      expect.arrayContaining([
        'manual_mapping_required collection=faqs id=1 reason=missing_faq_page_mapping',
        'manual_mapping_required collection=faqs id=2 reason=dangling_faq_page',
      ])
    )
    await expect(applyFaqPageKeyMigrationPlan(directus, plan, { apply: true })).rejects.toThrow(
      /manual_mapping_required/
    )
    expect(directus.request).not.toHaveBeenCalled()
  })

  it('is dry-run safe and has zero changes after the exact patches are reflected', async () => {
    const current = snapshot()
    const first = buildFaqPageKeyMigrationPlan(current)
    const directus = { request: vi.fn(async () => ({})) }

    await expect(applyFaqPageKeyMigrationPlan(directus, first)).resolves.toEqual({ applied: 0 })
    expect(directus.request).not.toHaveBeenCalled()

    await expect(applyFaqPageKeyMigrationPlan(directus, first, { apply: true })).resolves.toEqual({
      applied: 1,
    })
    expect(directus.request).toHaveBeenCalledWith('PATCH', '/items/faqs/1', { faq_page: 10 })
    Object.assign(current.records.faqs[0], first.changes[0].patch)
    expect(buildFaqPageKeyMigrationPlan(current)).toEqual({ changes: [], issues: [] })
  })

  it('reads only the FAQ page identity and legacy migration fields', async () => {
    const directus = {
      request: vi.fn(async (_method: string, path: string) => {
        if (path.includes('faq_pages')) return [{ id: 10, key: 'home' }]
        return [{ id: 1, faq_page: null, page_key: 'home' }]
      }),
    }
    await expect(readFaqPageKeyMigrationSnapshot(directus)).resolves.toEqual({
      records: {
        faq_pages: [{ id: 10, key: 'home' }],
        faqs: [{ id: 1, faq_page: null, page_key: 'home' }],
      },
    })
    expect(directus.request).toHaveBeenCalledWith('GET', '/items/faq_pages?limit=-1&fields=id,key')
    expect(directus.request).toHaveBeenCalledWith(
      'GET',
      '/items/faqs?limit=-1&fields=id,faq_page,page_key'
    )
  })
})
