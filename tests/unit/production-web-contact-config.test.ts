import { readFileSync } from 'node:fs'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const run = promisify(execFile)

describe('production Web contact-storage configuration', () => {
  it('requires Xiansuo integration settings instead of a Directus contact token', () => {
    const template = read('deploy/production/web/web.env.example')
    const prepare = read('deploy/production/web/prepare-web-server.sh')
    const deploy = read('scripts/deploy.sh')
    const bootstrap = read('scripts/lib/remote-capacity-bootstrap.sh')

    expect(template).toContain('DIRECTUS_CONTENT_TOKEN=')
    expect(template).toContain('XIANSUO_API_URL=https://xs.tomatopia.top')
    expect(template).toContain('XIANSUO_INGEST_TOKEN=')
    expect(template).not.toContain('DIRECTUS_CONTACT_TOKEN=')
    expect(prepare).toContain("'^DIRECTUS_CONTENT_TOKEN=.+'")
    expect(prepare).toContain("'^XIANSUO_API_URL=https://.+'")
    expect(prepare).toContain("'^XIANSUO_INGEST_TOKEN=.+'")
    expect(prepare).not.toContain('DIRECTUS_CONTACT_TOKEN')
    expect(prepare).not.toContain('DIRECTUS_TOKEN')
    expect(deploy).toContain('remote-capacity-bootstrap.sh')
    expect(bootstrap).toContain("'^XIANSUO_API_URL=https://.+'")
    expect(bootstrap).toContain("'^XIANSUO_INGEST_TOKEN=.+'")
    expect(deploy).not.toContain('DIRECTUS_CONTACT_TOKEN')
  })

  it('fails the remote bootstrap stub before capacity work when required integration settings are absent', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-contact-bootstrap-'))
    try {
      await mkdir(directory, { recursive: true })
      await expect(
        run(
          'bash',
          [
            'scripts/lib/remote-capacity-bootstrap.sh',
            directory,
            '/missing-node',
            `${directory}/bootstrap`,
            `${directory}/release`,
          ],
          { cwd: root }
        )
      ).rejects.toMatchObject({ code: 1, stderr: '' })
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
