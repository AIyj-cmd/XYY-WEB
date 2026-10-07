import { readFileSync } from 'node:fs'
import { mkdir, mkdtemp, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

import packageJson from '../../package.json'

const root = resolve(import.meta.dirname, '../..')
const run = promisify(execFile)
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('release deployment capacity contracts', () => {
  it('deploys through an isolated release and switches the current symlink', () => {
    const deploy = read('scripts/deploy.sh')

    expect(deploy).toContain('RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"')
    expect(deploy).toContain('CURRENT_LINK="$REMOTE_DIR/current"')
    expect(deploy).toContain('server.mjs ecosystem.config.cjs config server scripts')
    expect(deploy).toMatch(/mv -Tf \\"\\\$current_link\.next\\" \\"\\\$current_link\\"/)
    expect(deploy).toContain('.previous_target')
    expect(read('scripts/lib/deploy-capacity.sh')).toContain('if [[ -L "$current_link" ]]')
    expect(deploy).not.toContain('readlink -f \\"\\$current_link\\" 2>/dev/null || true')
    expect(deploy.match(/pm2 delete xyy-web/g)).toHaveLength(3)
    const healthLoop = deploy.match(/healthy=0[\s\S]*?done/)?.[0] ?? ''
    expect(healthLoop.match(/curl -fsS http:\/\/127\.0\.0\.1:\$WEB_PORT\/healthz/g)).toHaveLength(1)
    expect(healthLoop).toMatch(/health_payload[\s\S]*cmsContent[\s\S]*contactStorage/)
  })
  it('rejects cleanup apply and unsafe maintenance paths before builds or remote connections', () => {
    const deploy = read('scripts/deploy.sh')
    const capacity = read('scripts/lib/deploy-capacity.sh')
    const cleanupReject = deploy.indexOf('deploy.sh only creates an exact cleanup preview')
    const localPreflight = deploy.indexOf('run_local_capacity_preflight')
    const sshConnection = deploy.indexOf('ssh_cmd=(ssh')
    const remoteBaseline = capacity.indexOf(
      'REMOTE_CAPACITY_BASELINE_FILE must be a safe absolute path'
    )

    expect(cleanupReject).toBeGreaterThan(-1)
    expect(localPreflight).toBeGreaterThan(cleanupReject)
    expect(sshConnection).toBeGreaterThan(cleanupReject)
    expect(remoteBaseline).toBeGreaterThan(-1)
    expect(deploy).toContain('validate_capacity_maintenance_paths "$REMOTE_DIR"')
    const planPreparation = deploy.indexOf('prepare_remote_cleanup_plan_directory')
    const cleanupPreview = deploy.indexOf('preview_remote_release_cleanup')
    const activation = deploy.indexOf('current_link.next')
    expect(planPreparation).toBeGreaterThan(sshConnection)
    expect(cleanupPreview).toBeGreaterThan(planPreparation)
    expect(cleanupPreview).toBeGreaterThan(activation)
    expect(deploy).toContain(
      'release $RELEASE_ID is active, but cleanup preview failed; verify the cleanup plan before use'
    )
    expect(capacity).toContain('cleanup_plan_outside_remote_dir')
    expect(capacity).toContain("PATH='$node_bin':\\$PATH $cleanup_command")
    expect(deploy).toContain(
      "CAPACITY_SCOPE=remote REMOTE_CAPACITY_BASELINE_FILE='$REMOTE_CAPACITY_BASELINE_FILE' TMPDIR=/tmp"
    )
    expect(packageJson.scripts.preinstall).toBe('node scripts/check-capacity.mjs')
    expect(packageJson.scripts.prebuild).toContain('node scripts/check-capacity.mjs')
    expect(packageJson.scripts.preverify).toBe('node scripts/check-capacity.mjs')
    expect(packageJson.scripts['preverify:release']).toBe('node scripts/check-capacity.mjs')
    expect(packageJson.scripts.verify).toContain('npm run check:cache-patch')
  })
  it('creates a missing default cleanup directory before activation and rejects a symlinked parent', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-cleanup-plan-'))
    const remote = resolve(directory, 'remote')
    const outside = resolve(directory, 'outside')
    const fakeSsh = resolve(directory, 'ssh')
    await mkdir(remote)
    await mkdir(outside)
    await writeFile(
      fakeSsh,
      `#!/usr/bin/env bash
set -euo pipefail
while [[ "$#" -gt 0 && "$1" == -* ]]; do
  if [[ "$1" == -o ]]; then shift 2; else shift; fi
done
shift
exec bash -c "$1"
`
    )
    await run('chmod', ['700', fakeSsh])
    const helper = resolve(root, 'scripts/lib/deploy-capacity.sh')
    const invoke = (plan: string) =>
      run(
        'bash',
        [
          '-c',
          'source "$1"; ssh_cmd=("$2"); prepare_remote_cleanup_plan_directory stub "$3" "$4"',
          '--',
          helper,
          fakeSsh,
          remote,
          plan,
        ],
        { env: { ...process.env } }
      )
    const plan = resolve(remote, 'maintenance/release-cleanup-next.json')
    await expect(invoke(plan)).resolves.toMatchObject({ stderr: '' })
    expect((await stat(resolve(remote, 'maintenance'))).isDirectory()).toBe(true)
    await expect(invoke(resolve(outside, 'outside-plan.json'))).rejects.toMatchObject({
      stderr: expect.stringContaining('cleanup_plan_outside_remote_dir'),
    })
    await symlink(outside, resolve(remote, 'symlinked-maintenance'))
    await expect(invoke(resolve(remote, 'symlinked-maintenance/plan.json'))).rejects.toMatchObject({
      stderr: expect.stringContaining('unsafe_cleanup_plan_directory'),
    })
    await rm(directory, { recursive: true, force: true })
  })
})
