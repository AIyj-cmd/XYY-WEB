import { describe, expect, it } from 'vitest'
import { runCmsContentInitialization } from '../../scripts/lib/cms-content-runtime.mjs'
import { counts, createContentFixture, singletonNames } from '../fixtures/cms-initialization'

describe('independent initial content acceptance', () => {
  it('previews and checks a schema-only model without any content writes', async () => {
    const fixture = createContentFixture()
    const preview = await runCmsContentInitialization(fixture.directus)
    const check = await runCmsContentInitialization(fixture.directus, { mode: 'check' })
    for (const report of [preview, check]) {
      expect(report.ready).toBe(false)
      expect(report.totals).toEqual({ required: 171, created: 0, existing: 0, missing: 171 })
      expect(
        Object.fromEntries(report.collections.map((row) => [row.collection, row.required]))
      ).toEqual(counts)
    }
    expect(fixture.writes()).toEqual([])
    expect(new Set(fixture.calls.map(({ path }) => path.split('?')[0]))).toEqual(
      new Set(Object.keys(counts).map((name) => `/items/${name}`))
    )
  })

  it('imports all 171 rows, links FAQs, reads back ready, and reruns without writing', async () => {
    const fixture = createContentFixture()
    const applied = await runCmsContentInitialization(fixture.directus, { mode: 'apply' })
    expect(applied.ready).toBe(true)
    expect(applied.totals).toMatchObject({ required: 171, created: 171, missing: 0 })
    expect(
      Object.fromEntries(Object.entries(fixture.records).map(([name, rows]) => [name, rows.length]))
    ).toEqual(counts)
    const firstWrite = fixture.calls.findIndex(({ method }) => method !== 'GET')
    expect(
      new Set(fixture.calls.slice(0, firstWrite).map(({ path }) => path.split('?')[0])).size
    ).toBe(12)
    for (const faq of fixture.records.faqs) {
      expect(fixture.records.faq_pages.some(({ id }) => id === faq.faq_page)).toBe(true)
      expect(faq).not.toHaveProperty('faqPageKey')
      expect(faq).not.toHaveProperty('page_key')
    }
    fixture.calls.length = 0
    const check = await runCmsContentInitialization(fixture.directus, { mode: 'check' })
    const rerun = await runCmsContentInitialization(fixture.directus, { mode: 'apply' })
    expect(check.ready).toBe(true)
    expect(rerun.totals).toEqual({ required: 171, created: 0, existing: 171, missing: 0 })
    expect(fixture.writes()).toEqual([])
  })

  it('preserves edits, drafts and intentionally empty fields in existing rows', async () => {
    const fixture = createContentFixture(true)
    fixture.records.cases[0].case_description = '运营已改稿'
    fixture.records.cases[1].status = 'draft'
    fixture.records.site_settings[0].footer_description = ''
    fixture.records.service_pages[0].h1 = ''
    const before = structuredClone(fixture.records)
    const result = await runCmsContentInitialization(fixture.directus, { mode: 'apply' })
    expect(result.ready).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
    expect(fixture.records).toEqual(before)
    expect(fixture.writes()).toEqual([])
  })

  it('initializes id:null singleton defaults but preserves saved empty singleton rows', async () => {
    const emptyDefaults = createContentFixture(true)
    for (const name of singletonNames) {
      emptyDefaults.records[name] = [{ id: null, status: 'draft', key: null }]
    }
    const initialized = await runCmsContentInitialization(emptyDefaults.directus, { mode: 'apply' })
    expect(initialized.ready).toBe(true)
    expect(emptyDefaults.writes()).toHaveLength(3)
    const saved = createContentFixture(true)
    for (const name of singletonNames)
      saved.records[name] = [{ id: 42, status: 'draft', key: null }]
    const before = structuredClone(saved.records)
    const savedResult = await runCmsContentInitialization(saved.directus, { mode: 'apply' }).catch(
      () => null
    )
    if (savedResult) expect(savedResult.ready).toBe(false)
    expect(saved.records).toEqual(before)
    expect(saved.writes()).toEqual([])
  })
})
