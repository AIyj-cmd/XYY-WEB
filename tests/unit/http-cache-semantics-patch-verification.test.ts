import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('local cache patch verifier', () => {
  it('checks provenance, runtime resolution, and Astro consumer behavior together', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/verify-http-cache-semantics-patch.mjs'],
      {
        encoding: 'utf8',
      }
    )
    expect(JSON.parse(output)).toMatchObject({ status: 'ok', sourceSha256: expect.any(String) })
  })
})
