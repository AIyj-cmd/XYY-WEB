import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { writeCmsMigrationSnapshot } from '../../scripts/lib/cms-contract-snapshot.mjs'

describe('CMS contract migration snapshot', () => {
  it('writes an apply snapshot and SHA-256 sidecar without private records', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'xyy-cms-contract-'))
    const result = await writeCmsMigrationSnapshot(
      { warehouses: [{ id: 201, content_key: 'warehouse-guangzhou-huangpu' }] },
      { directory, now: new Date('2026-08-15T00:00:00.000Z') }
    )
    expect(result.path).toContain(directory)
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(await readFile(`${result.path}.sha256`, 'utf8')).toContain(result.sha256)
    expect(await readFile(result.path, 'utf8')).not.toContain('contact_leads')
  })
})
