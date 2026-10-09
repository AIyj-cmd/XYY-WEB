import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const script = 'scripts/crux.mjs'
const target = 'https://example.test'

const validRecord = {
  collectionPeriod: {
    firstDate: { year: 2026, month: 9, day: 1 },
    lastDate: { year: 2026, month: 9, day: 28 },
  },
  metrics: {
    largest_contentful_paint: { percentiles: { p75: 2400 } },
    interaction_to_next_paint: { percentiles: { p75: 180 } },
    cumulative_layout_shift: { percentiles: { p75: 0.1 } },
  },
}

function runFixture(
  response: unknown,
  status = 200,
  key = 'test-key',
  cliArgs = ['--origin', target]
) {
  const code = [
    `globalThis.fetch = async () => new Response(${JSON.stringify(JSON.stringify(response))}, { status: ${status} })`,
    `process.argv = [process.argv[0], ${JSON.stringify(script)}, ${cliArgs
      .map((argument) => JSON.stringify(argument))
      .join(', ')}]`,
    `await import('./${script}')`,
  ].join('; ')
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd: process.cwd(),
    env: { ...process.env, CRUX_API_KEY: key },
    encoding: 'utf8',
  })
  return {
    ...result,
    json: result.stdout ? JSON.parse(result.stdout) : null,
  }
}

function runBodyHangFixture() {
  const code = [
    'const originalSetTimeout = globalThis.setTimeout',
    'globalThis.setTimeout = (callback, _delay, ...args) => originalSetTimeout(callback, 10, ...args)',
    'globalThis.fetch = async () => ({ ok: true, json: async () => new Promise(() => {}) })',
    `process.argv = [process.argv[0], ${JSON.stringify(script)}, '--origin', ${JSON.stringify(target)}]`,
    `await import('./${script}')`,
  ].join('; ')
  return spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd: process.cwd(),
    env: { ...process.env, CRUX_API_KEY: 'test-key' },
    encoding: 'utf8',
  })
}

describe('CrUX read-only CLI contract', () => {
  it('preserves the official CLS p75 score scale', () => {
    const result = runFixture({ record: validRecord })

    expect(result.status).toBe(0)
    expect(result.json.observations[0].metrics.CLS.p75).toBe(0.1)
  })

  it('accepts an official string encoded p75 without changing its scale', () => {
    const record = {
      ...validRecord,
      metrics: {
        ...validRecord.metrics,
        cumulative_layout_shift: { percentiles: { p75: '0.1' } },
      },
    }
    const result = runFixture({ record })

    expect(result.status).toBe(0)
    expect(result.json.observations[0].metrics.CLS.p75).toBe(0.1)
  })

  it('supports URL granularity and a single PHONE observation', () => {
    const url = 'https://example.test/page'
    const result = runFixture({ record: validRecord }, 200, 'test-key', [
      '--url',
      url,
      '--form-factor',
      'PHONE',
    ])

    expect(result.status).toBe(0)
    expect(result.json.observations).toHaveLength(1)
    expect(result.json.observations[0]).toMatchObject({
      granularity: 'url',
      target: url,
      formFactor: 'PHONE',
    })
  })

  it.each([
    [
      'valid leap day',
      {
        firstDate: { year: 2024, month: 2, day: 29 },
        lastDate: { year: 2024, month: 3, day: 1 },
      },
      0,
    ],
    [
      'invalid calendar day',
      {
        firstDate: { year: 2026, month: 2, day: 30 },
        lastDate: { year: 2026, month: 3, day: 1 },
      },
      1,
    ],
    [
      'reversed period',
      {
        firstDate: { year: 2026, month: 10, day: 1 },
        lastDate: { year: 2026, month: 9, day: 28 },
      },
      1,
    ],
    [
      'string date shape',
      { firstDate: '2026-09-01', lastDate: { year: 2026, month: 9, day: 28 } },
      1,
    ],
  ])('handles %s collection period', (_label, period, expectedStatus) => {
    const result = runFixture({ record: { ...validRecord, collectionPeriod: period } })

    expect(result.status).toBe(expectedStatus)
  })

  it('fails observed output when the API omits the collection window', () => {
    const withoutPeriod = { ...validRecord, collectionPeriod: undefined }
    const result = runFixture({ record: withoutPeriod })

    expect(result.status).not.toBe(0)
  })

  it.each([
    ['boolean', true],
    ['blank', '  '],
    ['negative', -1],
  ])('rejects %s p75 values', (_label, value) => {
    const record = {
      ...validRecord,
      metrics: {
        ...validRecord.metrics,
        largest_contentful_paint: { percentiles: { p75: value } },
      },
    }
    const result = runFixture({ record })

    expect(result.status).not.toBe(0)
  })

  it('returns no_data with a non-zero status for an API NOT_FOUND response', () => {
    const result = runFixture({ error: { status: 'NOT_FOUND' } }, 404)

    expect(result.status).toBe(2)
    expect(result.json.observations).toEqual([
      { status: 'no_data', granularity: 'origin', formFactor: 'PHONE' },
      { status: 'no_data', granularity: 'origin', formFactor: 'DESKTOP' },
    ])
  })

  it('fails explicitly for forbidden API responses', () => {
    const result = runFixture({ error: { status: 'PERMISSION_DENIED' } }, 403)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('crux_api_error:http_403:PERMISSION_DENIED')
  })

  it('times out while the response body JSON remains pending', () => {
    const started = Date.now()
    const result = runBodyHangFixture()

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('crux_api_timeout')
    expect(Date.now() - started).toBeLessThan(3000)
  })
})
