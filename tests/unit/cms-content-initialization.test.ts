import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CMS_SEEDS } from '../../scripts/data/cms-seed-config.mjs'
import { runCmsContentInitialization } from '../../scripts/lib/cms-content-runtime.mjs'

const singletonNames = new Set(['homepage_content', 'about_content', 'site_settings'])
const baseNames = Object.entries(CMS_SEEDS)
  .filter(([, rows]) => rows.length)
  .map(([name]) => name)
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

function fakeCms() {
  const rows: Record<string, any> = Object.fromEntries(baseNames.map((name) => [name, []]))
  let nextId = 1
  const request = vi.fn(async (method: string, path: string, body?: any) => {
    const name = path.match(/^\/items\/([a-z_]+)/)?.[1]
    if (!name || !baseNames.includes(name)) throw new Error('unexpected collection')
    if (method === 'GET') return structuredClone(rows[name])
    const created = { ...structuredClone(body), id: nextId++ }
    if (method === 'PATCH' && singletonNames.has(name)) rows[name] = created
    else if (method === 'POST' && !singletonNames.has(name)) rows[name].push(created)
    else throw new Error('unexpected write')
    return created
  })
  const writes = () => request.mock.calls.filter(([method]) => method !== 'GET')
  return { rows, request, writes }
}

describe('first CMS content initialization', () => {
  it('defaults to read-only preview of only 12 collections and 171 missing records', async () => {
    const cms = fakeCms()
    const result = await runCmsContentInitialization(cms)
    expect(result.mode).toBe('preview')
    expect(result.ready).toBe(false)
    expect(result.totals).toEqual({ required: 171, created: 0, existing: 0, missing: 171 })
    expect(result.collections).toHaveLength(12)
    expect(cms.writes()).toEqual([])
  })

  it('reads all collections before inserting, resolves FAQs, checks readback, and is idempotent', async () => {
    const cms = fakeCms()
    const result = await runCmsContentInitialization(cms, { mode: 'apply' })
    expect(result.ready).toBe(true)
    expect(result.totals).toEqual({ required: 171, created: 171, existing: 0, missing: 0 })
    expect(cms.request.mock.calls.slice(0, 12).every(([method]) => method === 'GET')).toBe(true)
    const pageId = cms.rows.faq_pages.find((page: any) => page.key === 'home').id
    expect(cms.rows.faqs.find((faq: any) => faq.content_key === 'faq-home-01')).toMatchObject({
      faq_page: pageId,
    })
    expect(cms.rows.faqs.every((faq: any) => !('faqPageKey' in faq) && !('page_key' in faq))).toBe(
      true
    )
    cms.request.mockClear()
    const second = await runCmsContentInitialization(cms, { mode: 'apply' })
    expect(second.ready).toBe(true)
    expect(second.totals).toEqual({ required: 171, created: 0, existing: 171, missing: 0 })
    expect(cms.writes()).toEqual([])
  })

  it.each([null, { id: null, key: 'main', status: 'draft', stats: [] }])(
    'initializes unpersisted singleton defaults %j',
    async (empty) => {
      const cms = fakeCms()
      cms.rows.homepage_content = empty
      expect((await runCmsContentInitialization(cms, { mode: 'apply' })).ready).toBe(true)
      expect(cms.rows.homepage_content.id).toBeTruthy()
    }
  )

  it('preserves persisted singleton empty fields and draft edits while reporting incomplete content', async () => {
    const cms = fakeCms()
    await runCmsContentInitialization(cms, { mode: 'apply' })
    cms.rows.homepage_content.stats = []
    cms.rows.services[0] = { ...cms.rows.services[0], status: 'draft', description: '运营编辑' }
    const before = structuredClone(cms.rows)
    cms.request.mockClear()
    const result = await runCmsContentInitialization(cms, { mode: 'apply' })
    expect(result.ready).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ collection: 'homepage_content', field: 'stats' }),
        expect.objectContaining({ collection: 'services', field: 'status' }),
      ])
    )
    expect(cms.rows).toEqual(before)
    expect(cms.writes()).toEqual([])
  })

  it.each([
    ['malformed list', 'services', {}],
    [
      'duplicate identity',
      'cases',
      [
        { id: 1, slug: 'ur' },
        { id: 2, slug: 'ur' },
      ],
    ],
    ['missing identity', 'warehouses', [{ id: 1, content_key: null }]],
    ['invalid identity', 'cases', [{ id: 1, slug: 44 }]],
    [
      'singleton content without id',
      'about_content',
      { id: null, key: 'main', overview: '运营正文' },
    ],
    ['singleton missing key', 'about_content', { id: 8, key: null }],
    ['singleton missing primary key', 'about_content', { key: 'main', status: 'draft' }],
    ['singleton undefined primary key', 'about_content', { id: undefined, key: 'main' }],
    ['orphan FAQ', 'faqs', [{ id: 8, content_key: 'faq-home-service-fit', faq_page: 123 }]],
  ])('fails all-read preflight for %s before any write', async (_label, name, invalid) => {
    const cms = fakeCms()
    cms.rows[name as string] = invalid
    await expect(runCmsContentInitialization(cms, { mode: 'apply' })).rejects.toThrow()
    expect(cms.writes()).toEqual([])
  })

  it('fails inaccessible or nonexistent collection before any content write', async () => {
    const cms = fakeCms()
    const request = vi.fn(async (method: string, path: string, body?: any) => {
      if (path.includes('/site_settings')) throw new Error('forbidden secret-token')
      return cms.request(method, path, body)
    })
    await expect(runCmsContentInitialization({ request }, { mode: 'apply' })).rejects.toThrow(
      'collection=site_settings'
    )
    expect(cms.writes()).toEqual([])
  })

  it('reports an incomplete write readback instead of claiming readiness', async () => {
    const cms = fakeCms()
    const request = vi.fn(async (method: string, path: string, body?: any) => {
      if (method === 'POST' && path === '/items/services') return { id: 10, ...body }
      return cms.request(method, path, body)
    })
    const result = await runCmsContentInitialization({ request }, { mode: 'apply' })
    expect(result.ready).toBe(false)
    expect(result.totals.created).toBe(168)
    expect(result.totals.missing).toBe(3)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ collection: 'services', reason: 'missing_record' }),
      ])
    )
  })

  it('accepts edited valid content and uploaded file alternatives in read-only check', async () => {
    const cms = fakeCms()
    await runCmsContentInitialization(cms, { mode: 'apply' })
    cms.rows.service_pages[0].h1 = '运营新标题'
    cms.rows.service_pages[0].img_src = ''
    cms.rows.service_pages[0].hero_image = 'c7c2f596-4acf-4720-952b-4d34eac237f7'
    cms.request.mockClear()
    const result = await runCmsContentInitialization(cms, { mode: 'check' })
    expect(result.ready).toBe(true)
    expect(cms.writes()).toEqual([])
  })

  it('requires meaningful list entries, not merely a non-empty list', async () => {
    const cms = fakeCms()
    await runCmsContentInitialization(cms, { mode: 'apply' })
    cms.rows.homepage_content.stats = [{ claimKey: 'unknown', label: '统计' }]
    cms.rows.service_pages[0].features = [{}]
    const result = await runCmsContentInitialization(cms, { mode: 'check' })
    expect(result.ready).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ collection: 'homepage_content', field: 'stats' }),
        expect.objectContaining({ collection: 'service_pages', field: 'features' }),
      ])
    )
  })

  it('rechecks a singleton created after preflight and preserves its draft edits', async () => {
    const cms = fakeCms()
    let reads = 0
    const request = vi.fn(async (method: string, path: string, body?: any) => {
      if (method === 'GET' && path.includes('/homepage_content') && ++reads === 2) {
        cms.rows.homepage_content = { id: 901, key: 'main', status: 'draft', stats: [] }
      }
      return cms.request(method, path, body)
    })
    const result = await runCmsContentInitialization({ request }, { mode: 'apply' })
    expect(cms.rows.homepage_content).toEqual({ id: 901, key: 'main', status: 'draft', stats: [] })
    expect(cms.writes().some(([, path]) => path === '/items/homepage_content')).toBe(false)
    expect(result.totals).toEqual({ required: 171, created: 170, existing: 1, missing: 0 })
    expect(result.ready).toBe(false)
  })

  it('retains HTTP status while discarding server error text and credentials', async () => {
    const request = vi.fn(async () => {
      throw Object.assign(new Error('token=private https://user:pass@cms.test'), { status: 403 })
    })
    const result = runCmsContentInitialization({ request }, { mode: 'apply' })
    await expect(result).rejects.toThrow('collection=homepage_content status=403')
    await expect(result).rejects.not.toThrow(/private|user|pass/)
  })
})
