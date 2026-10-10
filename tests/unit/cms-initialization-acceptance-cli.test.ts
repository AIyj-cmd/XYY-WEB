import { afterEach, describe, expect, it } from 'vitest'
import { runInitializationCli, startContentHttpFixture } from '../fixtures/cms-initialization'

const fixtures: Awaited<ReturnType<typeof startContentHttpFixture>>[] = []
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => fixture.close()))
})
async function start(ready = false) {
  const fixture = await startContentHttpFixture(ready)
  fixtures.push(fixture)
  return fixture
}

describe('independent initialization CLI over loopback HTTP', () => {
  it.each([['--unknown'], ['--apply', '--check']])(
    'rejects %j without network calls',
    async (...args) => {
      const fixture = await start()
      const result = await runInitializationCli(fixture.url, args)
      expect(result.code).not.toBe(0)
      expect(fixture.calls).toEqual([])
    }
  )

  it('rejects missing credentials and supports help without network calls', async () => {
    const fixture = await start()
    expect((await runInitializationCli(fixture.url, ['--apply'], '')).code).not.toBe(0)
    expect((await runInitializationCli(fixture.url, ['--help'], '')).code).toBe(0)
    expect(fixture.calls).toEqual([])
  })

  it.each([400, 401, 403, 500])('fails HTTP %s before the first write', async (status) => {
    const fixture = await start()
    fixture.setFault(({ path }) => {
      if (path.startsWith('/items/site_settings?')) {
        throw Object.assign(new Error('synthetic read failure'), { status })
      }
    })
    expect((await runInitializationCli(fixture.url, ['--apply'])).code).not.toBe(0)
    expect(fixture.calls.length).toBeGreaterThan(0)
    expect(fixture.writes()).toEqual([])
  })

  it('previews by default, checks read-only, applies once and verifies without writes', async () => {
    const fixture = await start()
    expect((await runInitializationCli(fixture.url, [])).code).toBe(0)
    expect((await runInitializationCli(fixture.url, ['--check'])).code).not.toBe(0)
    expect(fixture.writes()).toEqual([])
    const result = await runInitializationCli(fixture.url, ['--apply'])
    expect(result.code, result.output).toBe(0)
    expect(fixture.writes()).toHaveLength(171)
    fixture.calls.length = 0
    expect((await runInitializationCli(fixture.url, ['--check'])).code).toBe(0)
    expect((await runInitializationCli(fixture.url, ['--apply'])).code).toBe(0)
    expect(fixture.writes()).toEqual([])
  })

  it('exits unsuccessfully when a create is acknowledged without persistence', async () => {
    const fixture = await start()
    fixture.setFault(({ method, path, body }) =>
      method === 'POST' && path === '/items/cases' ? { ...body, id: 999 } : undefined
    )
    expect((await runInitializationCli(fixture.url, ['--apply'])).code).not.toBe(0)
    expect(fixture.records.cases).toHaveLength(0)
  })
})
