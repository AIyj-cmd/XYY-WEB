import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import {
  REVISION_CAPACITY_QUERY,
  checkRevisionCapacity,
  verifyRevisionCapacity,
} from '../../deploy/oracle19c/lib/revision-capacity.mjs'

const clobColumns = [
  { COLUMN_NAME: 'data', DATA_TYPE: 'CLOB', DATA_LENGTH: 4000 },
  { COLUMN_NAME: 'delta', DATA_TYPE: 'CLOB', DATA_LENGTH: 4000 },
]

describe('Oracle Directus revision capacity checker', () => {
  it('passes only for the exact lowercase data and delta CLOB pair', () => {
    expect(checkRevisionCapacity(clobColumns)).toEqual({ ok: true, code: 'CAPACITY_PASS' })
    expect(
      checkRevisionCapacity([
        { COLUMN_NAME: 'data', DATA_TYPE: 'clob', DATA_LENGTH: 32767 },
        { COLUMN_NAME: 'delta', DATA_TYPE: 'CLOB', DATA_LENGTH: 4000 },
      ])
    ).toEqual({ ok: true, code: 'CAPACITY_PASS' })
  })

  it.each([
    {
      label: 'data VARCHAR2(4000)',
      rows: [{ COLUMN_NAME: 'data', DATA_TYPE: 'VARCHAR2', DATA_LENGTH: 4000 }, clobColumns[1]],
    },
    {
      label: 'delta VARCHAR2(32767)',
      rows: [clobColumns[0], { COLUMN_NAME: 'delta', DATA_TYPE: 'VARCHAR2', DATA_LENGTH: 32767 }],
    },
    { label: 'duplicate data', rows: [clobColumns[0], clobColumns[0]] },
    {
      label: 'non CLOB type',
      rows: [clobColumns[0], { COLUMN_NAME: 'delta', DATA_TYPE: 'BLOB', DATA_LENGTH: 4000 }],
    },
    {
      label: 'JSON type',
      rows: [clobColumns[0], { COLUMN_NAME: 'delta', DATA_TYPE: 'JSON', DATA_LENGTH: 4000 }],
    },
    {
      label: 'uppercase quoted name mismatch',
      rows: [{ ...clobColumns[0], COLUMN_NAME: 'DATA' }, clobColumns[1]],
    },
    {
      label: 'malformed row',
      rows: [{ COLUMN_NAME: 'data', DATA_TYPE: 'CLOB' }, { COLUMN_NAME: 'delta' }],
    },
    { label: 'missing delta', rows: [clobColumns[0]] },
    { label: 'non-array result', rows: null },
  ])('fails closed for $label', ({ rows }) => {
    expect(checkRevisionCapacity(rows)).toMatchObject({ ok: false })
  })

  it('uses fixed USER_TAB_COLUMNS metadata and fails closed on database errors', async () => {
    const execute = vi.fn(async () => ({ rows: clobColumns }))
    await expect(verifyRevisionCapacity(execute)).resolves.toEqual({
      ok: true,
      code: 'CAPACITY_PASS',
    })
    expect(execute).toHaveBeenCalledWith(REVISION_CAPACITY_QUERY, [])
    await expect(
      verifyRevisionCapacity(async () => Promise.reject(new Error('ORA-01017')))
    ).resolves.toEqual({ ok: false, code: 'QUERY_FAILED' })
  })

  it('stops Oracle preparation at the capacity gate before snapshot, schema apply, uploads, or PM2', () => {
    const prepare = readFileSync(
      resolve(import.meta.dirname, '../../deploy/oracle19c/prepare-directus-oracle.sh'),
      'utf8'
    )
    const bootstrap = prepare.indexOf('directus -- bootstrap')
    const gate = prepare.indexOf('verify-revision-capacity.mjs')

    expect(gate).toBeGreaterThan(bootstrap)
    for (const laterStep of [
      'echo "[prepare] snapshotting current PostgreSQL-backed Directus schema"',
      '"${NODE_BIN}/npm" exec directus -- schema apply --yes --dry-run',
      'rsync -a',
      'write_oracle_pm2_configs',
    ]) {
      expect(gate).toBeLessThan(prepare.indexOf(laterStep))
    }
  })
})
