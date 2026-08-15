import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { CMS_SCHEMA_VERSION } from '../../config/cms-contract.mjs'

export async function writeCmsMigrationSnapshot(snapshot, options = {}) {
  const directory = resolve(options.directory ?? 'output/cms-migrations')
  const now = options.now ?? new Date()
  await mkdir(directory, { recursive: true })
  const stamp = now.toISOString().replace(/[:.]/g, '-')
  const path = resolve(directory, `${CMS_SCHEMA_VERSION}-${stamp}.json`)
  const body = `${JSON.stringify({ schemaVersion: CMS_SCHEMA_VERSION, snapshot }, null, 2)}\n`
  await writeFile(path, body, { flag: 'wx', mode: 0o600 })
  const sha256 = createHash('sha256').update(body).digest('hex')
  await writeFile(`${path}.sha256`, `${sha256}  ${path.split('/').pop()}\n`, {
    flag: 'wx',
    mode: 0o600,
  })
  return { path, sha256 }
}
