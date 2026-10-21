import { execFile } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

import { ACTIVE_ECS, LOOPBACK_SITE } from './helpers/remote-target-fixtures'
import {
  createDeployTargetFixture,
  removeDeployTargetFixture,
} from './helpers/deploy-target-fixture'

const run = promisify(execFile)
const root = new URL('../..', import.meta.url)

describe('deployment target gate', () => {
  it('validates operation, canonical and SSH targets without opening a connection', async () => {
    await expect(
      run(
        process.execPath,
        [
          'scripts/lib/remote-target-policy.mjs',
          '--ssh',
          'deploy@8.138.148.179',
          '--operation-url',
          LOOPBACK_SITE,
          '--canonical-url',
          'https://56xyy.com',
        ],
        { cwd: root.pathname }
      )
    ).resolves.toMatchObject({ stdout: '' })
    await expect(
      run(
        process.execPath,
        [
          'scripts/lib/remote-target-policy.mjs',
          '--ssh',
          'root@wz.tomatopia.top',
          '--operation-url',
          ACTIVE_ECS,
        ],
        { cwd: root.pathname }
      )
    ).rejects.toMatchObject({ stderr: expect.stringContaining('deploy_host_unapproved') })
  })

  it('places the target gate before verify, SSH and rsync in deploy.sh', async () => {
    const source = await readFile(new URL('../../scripts/deploy.sh', import.meta.url), 'utf8')
    const gate = source.indexOf('scripts/lib/remote-target-policy.mjs')
    expect(gate).toBeGreaterThan(-1)
    for (const operation of ['npm run verify:release', '"${ssh_cmd[@]}"', 'rsync -az']) {
      expect(gate).toBeLessThan(source.indexOf(operation))
    }
    expect(source).toContain('SITE_URL="${SITE_URL:-}"')
    expect(source).toContain('BUILD_DIRECTUS_URL="${BUILD_DIRECTUS_URL:-}"')
    expect(source).toContain('HEALTHCHECK_SITE_URL="${HEALTHCHECK_SITE_URL:-}"')
  })

  const entries = ['scripts/deploy.sh', 'deploy/production/web/deploy-web.sh'] as const

  async function runEntry(entry: string, fixture: string, bin: string, override = {}) {
    const env = {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      DEPLOY_ENVIRONMENT: 'staging',
      DEPLOY_HOST: 'root@8.138.148.179',
      SITE_URL: LOOPBACK_SITE,
      BUILD_DIRECTUS_URL: LOOPBACK_SITE,
      HEALTHCHECK_SITE_URL: LOOPBACK_SITE,
      RELEASE_CLEANUP_APPLY: 'false',
      PROJECT_ROOT: fixture,
      ...override,
    }
    return run('bash', [entry], { cwd: fixture, env })
  }

  it.each(entries)('allows %s to reach the controlled local verify command', async (entry) => {
    const { fixture, bin } = await createDeployTargetFixture()
    try {
      await expect(runEntry(entry, fixture, bin)).rejects.toMatchObject({ code: 99 })
      await expect(
        import('node:fs/promises').then(({ readFile }) => readFile(`${bin}/npm.marker`, 'utf8'))
      ).resolves.toContain('npm')
      for (const command of ['ssh', 'rsync']) {
        await expect(
          import('node:fs/promises').then(({ readFile }) =>
            readFile(`${bin}/${command}.marker`, 'utf8')
          )
        ).rejects.toThrow()
      }
    } finally {
      await removeDeployTargetFixture(fixture)
    }
  })

  it.each(entries)(
    'blocks %s for an unverified schema before local or remote actions',
    async (entry) => {
      const { fixture, bin } = await createDeployTargetFixture()
      try {
        const cmsContractPath = `${fixture}/config/cms-contract.mjs`
        const cmsContract = await readFile(cmsContractPath, 'utf8')
        await writeFile(
          cmsContractPath,
          cmsContract.replace(
            "export const CMS_SCHEMA_VERSION_STATUS = 'verified'",
            "export const CMS_SCHEMA_VERSION_STATUS = 'pending_release_gate'"
          )
        )
        await run('git', ['add', 'config/cms-contract.mjs'], { cwd: fixture })
        await run(
          'git',
          [
            '-c',
            'user.name=Test',
            '-c',
            'user.email=test@example.invalid',
            'commit',
            '-qm',
            'pending',
          ],
          { cwd: fixture }
        )
        await expect(runEntry(entry, fixture, bin)).rejects.toMatchObject({
          stderr: expect.stringContaining('release_manifest_blocked'),
        })
        for (const command of ['npm', 'ssh', 'rsync']) {
          await expect(
            import('node:fs/promises').then(({ readFile }) =>
              readFile(`${bin}/${command}.marker`, 'utf8')
            )
          ).rejects.toThrow()
        }
      } finally {
        await removeDeployTargetFixture(fixture)
      }
    }
  )

  it.each(entries)('rejects a missing required URL in %s before remote commands', async (entry) => {
    const { fixture, bin } = await createDeployTargetFixture()
    try {
      const override = entry.endsWith('deploy-web.sh')
        ? { BUILD_DIRECTUS_URL: '' }
        : { SITE_URL: '' }
      await expect(runEntry(entry, fixture, bin, override)).rejects.toMatchObject({
        stderr: expect.stringMatching(/required|must explicitly/),
      })
      for (const command of ['npm', 'ssh', 'rsync']) {
        await expect(
          import('node:fs/promises').then(({ readFile }) =>
            readFile(`${bin}/${command}.marker`, 'utf8')
          )
        ).rejects.toThrow()
      }
    } finally {
      await removeDeployTargetFixture(fixture)
    }
  })

  it.each([
    ['old operation URL', { SITE_URL: 'https://wz.tomatopia.top' }, 'canonical_target_unapproved'],
    [
      'unknown operation URL',
      { BUILD_DIRECTUS_URL: 'https://cms.example.com' },
      'operation_target_unapproved',
    ],
    ['unknown SSH host', { DEPLOY_HOST: 'root@wz.tomatopia.top' }, 'deploy_host_unapproved'],
  ])(
    'rejects %s at both real deploy entries before remote commands',
    async (_name, override, message) => {
      const { fixture, bin } = await createDeployTargetFixture()
      try {
        for (const entry of entries) {
          await expect(runEntry(entry, fixture, bin, override)).rejects.toMatchObject({
            stderr: expect.stringContaining(message),
          })
        }
        for (const command of ['npm', 'ssh', 'rsync']) {
          await expect(
            import('node:fs/promises').then(({ readFile }) =>
              readFile(`${bin}/${command}.marker`, 'utf8')
            )
          ).rejects.toThrow()
        }
      } finally {
        await removeDeployTargetFixture(fixture)
      }
    }
  )
})
