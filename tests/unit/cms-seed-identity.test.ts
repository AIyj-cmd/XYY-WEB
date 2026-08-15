import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { CMS_SEEDS, CMS_SEED_IDENTITIES } from '../../scripts/data/cms-seed-config.mjs'
import { createCmsSetupRuntime } from '../../scripts/lib/cms-setup-runtime.mjs'

describe('CMS stable seed identities', () => {
  it('derives every seed identity from immutable contract fields', () => {
    expect(CMS_SEED_IDENTITIES).toMatchObject({
      warehouses: ['content_key'],
      cases: ['slug'],
      faqs: ['content_key'],
      about_history: ['content_key'],
      about_honors: ['content_key'],
    })
    expect(CMS_SEEDS.faqs.every(({ content_key }) => Boolean(content_key))).toBe(true)
  })

  it('does not expose legacy or private collections to normal setup seeds', () => {
    expect(CMS_SEEDS).not.toHaveProperty('case_details')
    expect(CMS_SEEDS).not.toHaveProperty('case_stats')
    expect(CMS_SEEDS).not.toHaveProperty('service_stats')
    expect(CMS_SEEDS).not.toHaveProperty('service_features')
    expect(CMS_SEEDS).not.toHaveProperty('contact_leads')
  })

  it('reads stable keys explicitly from reviewed source data instead of mutable text or order', () => {
    const root = resolve(import.meta.dirname, '../..')
    const faqGenerator = readFileSync(resolve(root, 'scripts/generate-faq-seeds.mjs'), 'utf8')
    const contentGenerator = readFileSync(
      resolve(root, 'scripts/generate-cms-content-seeds.mjs'),
      'utf8'
    )
    expect(faqGenerator).toContain('values.contentKey')
    expect(faqGenerator).not.toMatch(/content_key:\s*`[^`]*\$\{[^}]*index/i)
    expect(contentGenerator).not.toMatch(/(?:content_key|metric_key):\s*`[^`]*\$\{[^}]*index/i)
  })

  it.each([
    ['question', '已修改问题'],
    ['title', '已修改标题'],
    ['label', '已修改指标名称'],
    ['sort', 99],
    ['year', '2030'],
  ])(
    'does not create a record when mutable %s changes under the same stable key',
    async (field, value) => {
      const request = vi.fn(async (method: string) =>
        method === 'GET' ? [{ content_key: 'history-founded' }] : {}
      )
      const runtime = createCmsSetupRuntime({ request })

      await runtime.seedMissing(
        'about_history',
        [
          {
            content_key: 'history-founded',
            [field]: value,
          },
        ],
        ['content_key']
      )

      expect(request).not.toHaveBeenCalledWith('POST', '/items/about_history', expect.anything())
    }
  )

  it('rejects duplicate stable keys inside a seed batch', async () => {
    const runtime = createCmsSetupRuntime({ request: vi.fn(async () => []) })
    await expect(
      runtime.seedMissing(
        'warehouses',
        [
          { content_key: 'warehouse-south-guangzhou', name: '甲' },
          { content_key: 'warehouse-south-guangzhou', name: '乙' },
        ],
        ['content_key']
      )
    ).rejects.toThrow(/duplicate seed identity.*warehouses/i)
  })

  it('rejects multiple current records with the same stable identity', async () => {
    const runtime = createCmsSetupRuntime({
      request: vi.fn(async () => [
        { content_key: 'faq-home-service-fit' },
        { content_key: 'faq-home-service-fit' },
      ]),
    })
    await expect(
      runtime.seedMissing('faqs', [{ content_key: 'faq-home-service-fit' }], ['content_key'])
    ).rejects.toThrow(/duplicate current identity.*faqs/i)
  })

  it('resolves FAQ relationships by faq_pages.key without trusting cross-environment IDs', async () => {
    const runtime = createCmsSetupRuntime({
      request: vi.fn(async () => [{ id: 73, key: 'home' }]),
    })
    await expect(
      runtime.resolveFaqSeedRelations([
        {
          content_key: 'faq-home-service-fit',
          faqPageKey: 'home',
          page_key: 'legacy-home',
        },
      ])
    ).resolves.toEqual([
      {
        content_key: 'faq-home-service-fit',
        faq_page: 73,
        page_key: 'legacy-home',
      },
    ])
  })
})
