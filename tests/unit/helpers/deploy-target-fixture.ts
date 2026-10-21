import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const root = resolve(import.meta.dirname, '../../..')

export async function createDeployTargetFixture() {
  const fixture = await mkdtemp(resolve(tmpdir(), 'xyy-target-policy-'))
  await mkdir(resolve(fixture, 'scripts/lib'), { recursive: true })
  await cp(resolve(root, 'scripts/deploy.sh'), resolve(fixture, 'scripts/deploy.sh'))
  await cp(
    resolve(root, 'scripts/lib/deploy-capacity.sh'),
    resolve(fixture, 'scripts/lib/deploy-capacity.sh')
  )
  await cp(
    resolve(root, 'scripts/lib/remote-target-policy.mjs'),
    resolve(fixture, 'scripts/lib/remote-target-policy.mjs')
  )
  await cp(
    resolve(root, 'scripts/create-release-manifest.mjs'),
    resolve(fixture, 'scripts/create-release-manifest.mjs')
  )
  await cp(resolve(root, 'config'), resolve(fixture, 'config'), { recursive: true })
  const cmsContractPath = resolve(fixture, 'config/cms-contract.mjs')
  const cmsContract = await readFile(cmsContractPath, 'utf8')
  await writeFile(
    cmsContractPath,
    cmsContract.replace(
      /export const CMS_SCHEMA_VERSION_STATUS = '[^']+'/,
      "export const CMS_SCHEMA_VERSION_STATUS = 'verified'"
    )
  )
  await mkdir(resolve(fixture, 'deploy/production/web'), { recursive: true })
  await cp(
    resolve(root, 'deploy/production/web/deploy-web.sh'),
    resolve(fixture, 'deploy/production/web/deploy-web.sh')
  )
  await writeFile(
    resolve(fixture, 'scripts/lib/deploy-capacity.sh'),
    `validate_capacity_maintenance_paths() { :; }\nrun_local_capacity_preflight() { :; }\npreview_remote_release_cleanup() { :; }\n`
  )
  const bin = resolve(fixture, 'bin')
  await mkdir(bin)
  for (const command of ['npm', 'ssh', 'rsync']) {
    await writeFile(resolve(bin, command), `#!/bin/sh\necho ${command} >> "$0.marker"\nexit 99\n`, {
      mode: 0o700,
    })
  }
  await run('git', ['init', '-q'], { cwd: fixture })
  await run('git', ['add', '.'], { cwd: fixture })
  await run(
    'git',
    ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture'],
    { cwd: fixture }
  )
  return { fixture, bin }
}

export async function removeDeployTargetFixture(fixture: string) {
  await rm(fixture, { recursive: true, force: true })
}
