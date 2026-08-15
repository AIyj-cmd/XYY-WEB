import { describe, expect, it, vi } from 'vitest'

import { createCmsSeedRuntime } from '../../scripts/lib/cms-seed-runtime.mjs'

const singletonSeed = async (
  collection: string,
  current: unknown,
  seed: Record<string, unknown>
) => {
  let remote = current
  const request = vi.fn(async (method: string, _path: string, body?: unknown) => {
    if (method === 'GET') return remote
    if (method === 'PATCH') {
      const record = Array.isArray(remote) ? remote[0] : remote
      remote = [{ ...(record as object), ...(body as object) }]
    }
    return {}
  })
  const runtime = createCmsSeedRuntime({ request })
  await runtime.seedMissing(collection, [seed], ['key'], { singleton: true })
  return { request, runtime }
}

describe('CMS singleton seed safety', () => {
  it.each([
    ['homepage_content', 'hero_title'],
    ['about_content', 'overview'],
    ['site_settings', 'footer_description'],
  ])('does not synchronize existing %s content when identity matches', async (name, field) => {
    const { request } = await singletonSeed(
      name,
      [{ key: 'main', [field]: '运营人员已经修改的正文' }],
      { key: 'main', [field]: '代码中的审核回退正文' }
    )
    expect(request.mock.calls.every(([method]) => method === 'GET')).toBe(true)
  })

  it('blocks a populated singleton whose identity differs without exposing content', async () => {
    const request = vi.fn(async (method: string) =>
      method === 'GET' ? [{ key: 'legacy-main', overview: '运营人员已经修改的正文' }] : {}
    )
    const runtime = createCmsSeedRuntime({ request })
    const result = runtime.seedMissing(
      'about_content',
      [{ key: 'main', overview: '代码中的审核回退正文' }],
      ['key'],
      { singleton: true }
    )
    await expect(result).rejects.toThrow(
      'singleton_migration_required collection=about_content expected_identity=["main"] actual_identity=["legacy-main"]'
    )
    await expect(result).rejects.not.toThrow('运营人员已经修改的正文')
    expect(request.mock.calls.every(([method]) => method === 'GET')).toBe(true)
  })

  it('blocks meaningful content when the stable identity is missing', async () => {
    const request = vi.fn(async (method: string) =>
      method === 'GET' ? [{ key: null, footer_description: '运营正文' }] : {}
    )
    const runtime = createCmsSeedRuntime({ request })
    await expect(
      runtime.seedMissing(
        'site_settings',
        [{ key: 'main', footer_description: '审核正文' }],
        ['key'],
        { singleton: true }
      )
    ).rejects.toThrow(
      'singleton_migration_required collection=site_settings expected_identity=["main"] actual_identity=[null]'
    )
    expect(request.mock.calls.every(([method]) => method === 'GET')).toBe(true)
  })

  it('initializes a truly empty singleton once and makes the second run a no-op', async () => {
    let remote = [{ id: 1, status: 'draft', key: null, hero_title: null, stats: [], hero: {} }]
    const request = vi.fn(async (method: string, _path: string, body?: unknown) => {
      if (method === 'GET') return remote
      if (method === 'PATCH') remote = [{ ...remote[0], ...(body as object) }]
      return {}
    })
    const runtime = createCmsSeedRuntime({ request })
    const seed = { key: 'main', hero_title: '审核标题', stats: [{ claimKey: 'partnerBrands' }] }
    await runtime.seedMissing('homepage_content', [seed], ['key'], { singleton: true })
    await runtime.seedMissing('homepage_content', [seed], ['key'], { singleton: true })
    expect(request.mock.calls.filter(([method]) => method === 'PATCH')).toEqual([
      ['PATCH', '/items/homepage_content', { status: 'published', ...seed }],
    ])
  })

  it.each([
    [[{ key: 'one' }, { key: 'two' }], 'multiple_records'],
    [[{ key: 123 }], 'invalid_identity'],
    ['invalid', 'invalid_response'],
  ])('fails closed for abnormal singleton state (%s)', async (current, reason) => {
    const request = vi.fn(async (method: string) => (method === 'GET' ? current : {}))
    const runtime = createCmsSeedRuntime({ request })
    await expect(
      runtime.seedMissing('about_content', [{ key: 'main', overview: '审核正文' }], ['key'], {
        singleton: true,
      })
    ).rejects.toThrow(`singleton_migration_required collection=about_content reason=${reason}`)
    expect(request.mock.calls.every(([method]) => method === 'GET')).toBe(true)
  })

  it('preserves normal collection insert and deduplication behavior', async () => {
    const request = vi.fn(async (method: string) =>
      method === 'GET' ? [{ slug: 'existing' }] : {}
    )
    const runtime = createCmsSeedRuntime({ request })
    await runtime.seedMissing('cases', [{ slug: 'existing' }, { slug: 'new' }], ['slug'])
    expect(request).toHaveBeenCalledWith('POST', '/items/cases', {
      status: 'published',
      slug: 'new',
    })
    expect(request).not.toHaveBeenCalledWith(
      'POST',
      '/items/cases',
      expect.objectContaining({ slug: 'existing' })
    )
  })
})
