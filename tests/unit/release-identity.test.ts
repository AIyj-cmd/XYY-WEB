import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  CMS_SCHEMA_VERSION,
  createReleaseIdentity,
  validateReleaseIdentity,
} from '../../config/release-contract.mjs'
import { createVersionHandler } from '../../server/release-info.mjs'

const sha = '54fa9e64642403548f2c3e04f0242e427445aa30'
const valid = createReleaseIdentity({
  gitSha: sha,
  buildTime: '2026-08-15T12:00:00.000Z',
  environment: 'staging',
})

function responseDouble() {
  const state = { status: 200, headers: {} as Record<string, string>, body: undefined as unknown }
  return {
    state,
    response: {
      status(value: number) {
        state.status = value
        return this
      },
      set(name: string, value: string) {
        state.headers[name] = value
        return this
      },
      json(value: unknown) {
        state.body = value
        return this
      },
    },
  }
}

describe('release identity contract', () => {
  it('derives an immutable identity from explicit inputs', () => {
    expect(valid).toEqual({
      schemaVersion: 1,
      gitSha: sha,
      gitShortSha: '54fa9e6',
      releaseId: '20260815T120000Z-54fa9e6',
      buildTime: '2026-08-15T12:00:00.000Z',
      environment: 'staging',
      cmsSchemaVersion: CMS_SCHEMA_VERSION,
    })
  })

  it.each([
    ['short sha', { ...valid, gitSha: '54fa9e6' }],
    ['mismatched short sha', { ...valid, gitShortSha: 'abcdef0' }],
    ['release id without sha', { ...valid, releaseId: '20260815T120000Z' }],
    ['invalid environment', { ...valid, environment: 'preview' }],
    ['invalid build time', { ...valid, buildTime: '2026-08-15 12:00' }],
    ['wrong CMS schema', { ...valid, cmsSchemaVersion: 'legacy' }],
    ['extra sensitive field', { ...valid, token: 'must-not-be-accepted' }],
  ])('rejects %s', (_name, value) => {
    expect(() => validateReleaseIdentity(value)).toThrow()
  })
})

describe('/version release identity handler', () => {
  it('returns a valid manifest without caching', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-version-'))
    const path = resolve(directory, 'release-manifest.json')
    await writeFile(path, `${JSON.stringify(valid)}\n`)
    const result = responseDouble()

    await createVersionHandler({ manifestPath: path })({}, result.response)

    expect(result.state.status).toBe(200)
    expect(result.state.headers['Cache-Control']).toBe('no-store')
    expect(result.state.headers['Content-Type']).toBe('application/json')
    expect(result.state.body).toEqual(valid)
    await rm(directory, { recursive: true, force: true })
  })

  it.each(['missing', 'invalid'])('fails safely for a %s production manifest', async (mode) => {
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-version-error-'))
    const path = resolve(directory, 'release-manifest.json')
    if (mode === 'invalid') await writeFile(path, '{invalid')
    const result = responseDouble()

    await createVersionHandler({ manifestPath: path })({}, result.response)

    expect(result.state.status).toBe(503)
    expect(result.state.body).toEqual({
      status: 'unavailable',
      error: 'release_identity_unavailable',
    })
    expect(JSON.stringify(result.state.body)).not.toContain(directory)
    await rm(directory, { recursive: true, force: true })
  })

  it('loads from a minimal release without git, scripts, source or env files', async () => {
    const root = resolve(import.meta.dirname, '../..')
    const release = await mkdtemp(resolve(tmpdir(), 'xyy-release-package-'))
    await cp(resolve(root, 'config'), resolve(release, 'config'), { recursive: true })
    await cp(resolve(root, 'server'), resolve(release, 'server'), { recursive: true })
    await mkdir(resolve(release, 'dist'), { recursive: true })
    for (const file of [
      'server.mjs',
      'package.json',
      'package-lock.json',
      'ecosystem.config.cjs',
    ]) {
      await cp(resolve(root, file), resolve(release, file))
    }
    await writeFile(resolve(release, 'release-manifest.json'), `${JSON.stringify(valid)}\n`)

    const module = await import(
      `${pathToFileURL(resolve(release, 'server/release-info.mjs')).href}?package=${Date.now()}`
    )
    await expect(
      module.loadReleaseIdentity({ manifestPath: resolve(release, 'release-manifest.json') })
    ).resolves.toEqual(valid)
    await expect(readFile(resolve(release, '.git/HEAD'))).rejects.toThrow()
    await expect(readFile(resolve(release, 'scripts/deploy.sh'))).rejects.toThrow()
    await expect(readFile(resolve(release, '.env'))).rejects.toThrow()
    await rm(release, { recursive: true, force: true })
  })
})
