import { execFile } from 'node:child_process'
import { mkdtemp, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

import { CMS_SCHEMA_VERSION_STATUS } from '../../config/cms-contract.mjs'

const run = promisify(execFile)
const sha = '54fa9e64642403548f2c3e04f0242e427445aa30'
const buildTime = '2026-10-08T12:00:00.000Z'

async function runCiIdentity(directory: string, argumentsList: string[]) {
  const root = resolve(import.meta.dirname, '../..')
  return run(
    process.execPath,
    [resolve(root, 'scripts/validate-ci-release-identity.mjs'), ...argumentsList],
    {
      cwd: directory,
      env: process.env,
    }
  )
}

describe('CI release identity validation', () => {
  it('validates an exact CI identity and only reports the CMS candidate status', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-ci-release-identity-'))
    try {
      const result = await runCiIdentity(directory, [
        '--git-sha',
        sha,
        '--build-time',
        buildTime,
        '--environment',
        'ci',
      ])

      expect(JSON.parse(result.stdout)).toEqual({
        identity: {
          schemaVersion: 1,
          gitSha: sha,
          gitShortSha: '54fa9e6',
          releaseId: '20261008T120000Z-54fa9e6',
          buildTime,
          environment: 'ci',
          cmsSchemaVersion: '2026-10-cms-maintenance',
        },
        cmsSchemaStatus: CMS_SCHEMA_VERSION_STATUS,
      })
      expect(await readdir(directory)).toEqual([])
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it.each([
    ['invalid SHA', ['--git-sha', '54fa9e6', '--build-time', buildTime, '--environment', 'ci']],
    [
      'invalid timestamp',
      ['--git-sha', sha, '--build-time', '2026-10-08 12:00', '--environment', 'ci'],
    ],
    [
      'non-CI environment',
      ['--git-sha', sha, '--build-time', buildTime, '--environment', 'staging'],
    ],
  ])('rejects a %s', async (_name, argumentsList) => {
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-ci-release-identity-'))
    try {
      await expect(runCiIdentity(directory, argumentsList)).rejects.toMatchObject({
        stderr: expect.stringContaining('identity'),
      })
      expect(await readdir(directory)).toEqual([])
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('keeps deployment manifest creation blocked for an unverified CMS candidate', async () => {
    const root = resolve(import.meta.dirname, '../..')
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-release-manifest-'))
    const output = resolve(directory, 'release-manifest.json')
    try {
      await expect(
        run(
          process.execPath,
          [
            'scripts/create-release-manifest.mjs',
            '--output',
            output,
            '--git-sha',
            sha,
            '--build-time',
            buildTime,
            '--environment',
            'ci',
          ],
          { cwd: root, env: process.env }
        )
      ).rejects.toMatchObject({ stderr: expect.stringContaining('release_manifest_blocked') })
      await expect(stat(output)).rejects.toThrow()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
