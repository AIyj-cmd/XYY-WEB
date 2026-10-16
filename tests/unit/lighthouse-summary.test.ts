import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'

import { summarizeLighthouse } from '../../scripts/lib/lighthouse-summary.mjs'

const roots: string[] = []

type Sample = unknown | { value?: unknown; omitAudit?: boolean; omitNumeric?: boolean }

function report(sample: Sample = 100) {
  const descriptor =
    typeof sample === 'object' && sample !== null && !Array.isArray(sample)
      ? (sample as { value?: unknown; omitAudit?: boolean; omitNumeric?: boolean })
      : { value: sample }
  const audits: Record<string, unknown> = {
    'http-status-code': { score: 1 },
    'largest-contentful-paint': { numericValue: 1000 },
    'total-blocking-time': { numericValue: 20 },
    'cumulative-layout-shift': { numericValue: 0.01 },
    'network-requests': { details: { items: [{ url: 'http://127.0.0.1:4400/' }] } },
  }
  if (!descriptor.omitAudit)
    audits['total-byte-weight'] = descriptor.omitNumeric ? {} : { numericValue: descriptor.value }
  return {
    requestedUrl: 'http://127.0.0.1:4400/',
    finalUrl: 'http://127.0.0.1:4400/',
    runtimeError: null,
    audits,
    categories: {
      performance: { score: 0.9 },
      accessibility: { score: 0.9 },
      'best-practices': { score: 0.9 },
      seo: { score: 0.9 },
    },
  }
}

async function summarize(values: unknown[]) {
  const root = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'luna-summary-r4-'))
  roots.push(root)
  const manifest = []
  for (const [index, value] of values.entries()) {
    const jsonPath = join(root, `report-${index}.json`)
    await writeFile(jsonPath, JSON.stringify(report(value)))
    manifest.push({ jsonPath })
  }
  await writeFile(join(root, 'manifest.json'), JSON.stringify(manifest))
  return summarizeLighthouse(
    'desktop',
    { ci: { collect: { url: ['http://127.0.0.1:4400/'] } } },
    root
  )
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('Lighthouse summary required metrics', () => {
  it('keeps the three-sample median for finite total-byte-weight', async () => {
    const summary = await summarize([100, 200, 300])
    expect(summary.routes[0].metrics.resourceBytes).toBe(200)
  })

  it.each([
    ['first audit', [{ omitAudit: true }, 300, 200]],
    ['later audit', [100, { omitAudit: true }, 200]],
    ['missing numericValue', [100, { omitNumeric: true }, 200]],
    ['null', [100, null, 200]],
    ['string', [100, 'NaN', 300]],
  ])(
    'fails when %s sample has a missing or invalid total-byte-weight audit',
    async (_name, values) => {
      await expect(summarize(values)).rejects.toThrow('invalid_total-byte-weight')
    }
  )
})
