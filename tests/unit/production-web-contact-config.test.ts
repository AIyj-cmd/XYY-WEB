import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('production Web contact-storage configuration', () => {
  it('requires Xiansuo integration settings instead of a Directus contact token', () => {
    const template = read('deploy/production/web/web.env.example')
    const prepare = read('deploy/production/web/prepare-web-server.sh')
    const deploy = read('scripts/deploy.sh')

    expect(template).toContain('DIRECTUS_CONTENT_TOKEN=')
    expect(template).toContain('XIANSUO_API_URL=https://xs.tomatopia.top')
    expect(template).toContain('XIANSUO_INGEST_TOKEN=')
    expect(template).not.toContain('DIRECTUS_CONTACT_TOKEN=')
    expect(prepare).toContain("'^DIRECTUS_CONTENT_TOKEN=.+'")
    expect(prepare).toContain("'^XIANSUO_API_URL=https://.+'")
    expect(prepare).toContain("'^XIANSUO_INGEST_TOKEN=.+'")
    expect(prepare).not.toContain('DIRECTUS_CONTACT_TOKEN')
    expect(prepare).not.toContain('DIRECTUS_TOKEN')
    expect(deploy).toContain("'^XIANSUO_API_URL=https://.+'")
    expect(deploy).toContain("'^XIANSUO_INGEST_TOKEN=.+'")
    expect(deploy).not.toContain('DIRECTUS_CONTACT_TOKEN')
  })
})
