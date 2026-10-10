import { describe, expect, it } from 'vitest'
import { runCmsContentInitialization } from '../../scripts/lib/cms-content-runtime.mjs'
import { createContentFixture } from '../fixtures/cms-initialization'

describe('independent initialization failure gates', () => {
  it('rejects singleton projection without an id rather than treating it as unsaved', async () => {
    const fixture = createContentFixture(true)
    fixture.records.site_settings = [{ key: 'main', status: 'draft' }]
    await expect(runCmsContentInitialization(fixture.directus, { mode: 'apply' })).rejects.toThrow()
    expect(fixture.writes()).toEqual([])
  })

  it.each([400, 401, 403, 500])('does not write after late preflight HTTP %s', async (status) => {
    const fixture = createContentFixture()
    fixture.setFault(({ method, path }) => {
      if (method === 'GET' && path.startsWith('/items/site_settings?')) {
        throw new Error(`HTTP ${status}`)
      }
    })
    await expect(runCmsContentInitialization(fixture.directus, { mode: 'apply' })).rejects.toThrow()
    expect(fixture.writes()).toEqual([])
  })

  it.each([false, 'malformed', {}, [null], [{ id: 9, slug: '' }]])(
    'does not write after malformed cases data %j',
    async (value) => {
      const fixture = createContentFixture()
      fixture.setFault(({ path }) => (path.startsWith('/items/cases?') ? value : undefined))
      await expect(
        runCmsContentInitialization(fixture.directus, { mode: 'apply' })
      ).rejects.toThrow()
      expect(fixture.writes()).toEqual([])
    }
  )

  it('does not write after duplicate stable identities', async () => {
    const fixture = createContentFixture(true)
    fixture.records.cases.push({ ...fixture.records.cases[0], id: 700 })
    fixture.records.services = []
    await expect(runCmsContentInitialization(fixture.directus, { mode: 'apply' })).rejects.toThrow()
    expect(fixture.writes()).toEqual([])
  })

  it('does not write when an existing FAQ page lacks its relationship ID', async () => {
    const fixture = createContentFixture(true)
    delete fixture.records.faq_pages[0].id
    fixture.records.services = []
    await expect(runCmsContentInitialization(fixture.directus, { mode: 'apply' })).rejects.toThrow()
    expect(fixture.writes()).toEqual([])
  })

  it('does not report ready when the server acknowledges but drops a create', async () => {
    const fixture = createContentFixture()
    fixture.setFault(({ method, path, body }) =>
      method === 'POST' && path === '/items/cases' ? { ...body, id: 999 } : undefined
    )
    const result = await runCmsContentInitialization(fixture.directus, { mode: 'apply' })
    expect(result.ready).toBe(false)
    expect(result.totals.missing).toBe(6)
    expect(result.issues.some(({ collection }) => collection === 'cases')).toBe(true)
  })
})
