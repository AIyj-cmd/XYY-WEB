import { execFile } from 'node:child_process'
import { cp, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

const run = promisify(execFile)
const sha = '54fa9e64642403548f2c3e04f0242e427445aa30'
const buildTime = '2026-10-08T12:00:00.000Z'

async function makeCiFixture(cmsSchemaStatus = 'candidate_unverified') {
  const root = resolve(import.meta.dirname, '../..')
  const fixture = await mkdtemp(resolve(tmpdir(), 'xyy-ci-release-identity-'))
  await cp(resolve(root, 'config'), resolve(fixture, 'config'), { recursive: true })
  await cp(resolve(root, 'scripts'), resolve(fixture, 'scripts'), { recursive: true })
  const cmsContractPath = resolve(fixture, 'config/cms-contract.mjs')
  const cmsContract = await readFile(cmsContractPath, 'utf8')
  await writeFile(
    cmsContractPath,
    cmsContract.replace(
      /export const CMS_SCHEMA_VERSION_STATUS = '[^']+'/,
      `export const CMS_SCHEMA_VERSION_STATUS = '${cmsSchemaStatus}'`
    )
  )
  return fixture
}

async function runCiIdentity(directory: string, argumentsList: string[]) {
  return run(
    process.execPath,
    [resolve(directory, 'scripts/validate-ci-release-identity.mjs'), ...argumentsList],
    {
      cwd: directory,
      env: process.env,
    }
  )
}

describe('CI release identity validation', () => {
  it('validates an exact CI identity and only reports the CMS candidate status', async () => {
    const directory = await makeCiFixture('candidate_unverified')
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
        cmsSchemaStatus: 'candidate_unverified',
      })
      expect(await readdir(directory)).toEqual(['config', 'scripts'])
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
    const directory = await makeCiFixture('candidate_unverified')
    try {
      await expect(runCiIdentity(directory, argumentsList)).rejects.toMatchObject({
        stderr: expect.stringContaining('identity'),
      })
      expect(await readdir(directory)).toEqual(expect.arrayContaining(['config', 'scripts']))
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('keeps deployment manifest creation blocked for an unverified CMS candidate', async () => {
    const directory = await makeCiFixture('candidate_unverified')
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
          { cwd: directory, env: process.env }
        )
      ).rejects.toMatchObject({ stderr: expect.stringContaining('release_manifest_blocked') })
      await expect(stat(output)).rejects.toThrow()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('creates an exact manifest from a verified fixture', async () => {
    const directory = await makeCiFixture('verified')
    const output = resolve(directory, 'release-manifest.json')
    try {
      await run(
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
        { cwd: directory, env: process.env }
      )
      await expect(readFile(output, 'utf8')).resolves.toContain(`"gitSha": "${sha}"`)
      await expect(readFile(output, 'utf8')).resolves.toContain(
        '"cmsSchemaVersion": "2026-10-cms-maintenance"'
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
