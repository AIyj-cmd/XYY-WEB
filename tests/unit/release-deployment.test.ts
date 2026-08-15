import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { checkReleaseVersion } from '../../scripts/health-check.mjs'

const run = promisify(execFile)
const sha = '54fa9e64642403548f2c3e04f0242e427445aa30'
const identity = {
  schemaVersion: 1,
  gitSha: sha,
  gitShortSha: '54fa9e6',
  releaseId: '20260815T120000Z-54fa9e6',
  buildTime: '2026-08-15T12:00:00.000Z',
  environment: 'staging',
  cmsSchemaVersion: '2026-08-phase3',
}

const servers: ReturnType<typeof createServer>[] = []
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((done) => server.close(done))))
})

async function serveVersion(body = identity) {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(body))
  })
  servers.push(server)
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('test server did not bind')
  return `http://127.0.0.1:${address.port}`
}

async function makeDeployFixture() {
  const root = resolve(import.meta.dirname, '../..')
  const fixture = await mkdtemp(resolve(tmpdir(), 'xyy-deploy-preflight-'))
  await mkdir(resolve(fixture, 'scripts'), { recursive: true })
  await cp(resolve(root, 'scripts/deploy.sh'), resolve(fixture, 'scripts/deploy.sh'))
  await cp(
    resolve(root, 'scripts/create-release-manifest.mjs'),
    resolve(fixture, 'scripts/create-release-manifest.mjs')
  )
  await cp(resolve(root, 'config'), resolve(fixture, 'config'), { recursive: true })
  await run('git', ['init', '-q'], { cwd: fixture })
  await run('git', ['add', '.'], { cwd: fixture })
  await run(
    'git',
    ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture'],
    {
      cwd: fixture,
    }
  )
  return fixture
}

describe('deployment release identity', () => {
  it.each(['modified', 'staged', 'untracked'])(
    'rejects a %s worktree before deployment',
    async (mode) => {
      const fixture = await makeDeployFixture()
      const target = resolve(fixture, 'tracked.txt')
      await writeFile(target, 'tracked\n')
      await run('git', ['add', 'tracked.txt'], { cwd: fixture })
      await run(
        'git',
        [
          '-c',
          'user.name=Test',
          '-c',
          'user.email=test@example.invalid',
          'commit',
          '-qm',
          'tracked',
        ],
        {
          cwd: fixture,
        }
      )
      if (mode === 'modified') await writeFile(target, 'changed\n')
      if (mode === 'staged') {
        await writeFile(target, 'changed\n')
        await run('git', ['add', 'tracked.txt'], { cwd: fixture })
      }
      if (mode === 'untracked') await writeFile(resolve(fixture, 'untracked.txt'), 'new\n')

      await expect(
        run('bash', ['scripts/deploy.sh'], {
          cwd: fixture,
          env: { ...process.env, DEPLOY_ENVIRONMENT: 'staging', DEPLOY_PREFLIGHT_ONLY: 'true' },
        })
      ).rejects.toMatchObject({
        stderr: expect.stringContaining('deployment_requires_clean_worktree'),
      })
      await rm(fixture, { recursive: true, force: true })
    }
  )

  it('allows a clean preflight and generates a SHA-bound manifest', async () => {
    const fixture = await makeDeployFixture()
    const { stdout } = await run('bash', ['scripts/deploy.sh'], {
      cwd: fixture,
      env: { ...process.env, DEPLOY_ENVIRONMENT: 'staging', DEPLOY_PREFLIGHT_ONLY: 'true' },
    })
    expect(stdout).toContain('deployment preflight ok')
    expect(stdout).toMatch(/[0-9]{8}T[0-9]{6}Z-[0-9a-f]{7}/)
    await rm(fixture, { recursive: true, force: true })
  })

  it('generates a manifest from explicit CI inputs', async () => {
    const root = resolve(import.meta.dirname, '../..')
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-manifest-'))
    const output = resolve(directory, 'manifest.json')
    await run(
      process.execPath,
      [
        'scripts/create-release-manifest.mjs',
        '--output',
        output,
        '--git-sha',
        sha,
        '--build-time',
        identity.buildTime,
        '--environment',
        'ci',
      ],
      { cwd: root }
    )
    expect(JSON.parse(await readFile(output, 'utf8'))).toMatchObject({
      gitSha: sha,
      environment: 'ci',
    })
    await rm(directory, { recursive: true, force: true })
  })
})

describe('external release version verification', () => {
  it('accepts exact expectations and reports that identity was verified', async () => {
    const baseUrl = await serveVersion()
    await expect(checkReleaseVersion(baseUrl, identity)).resolves.toMatchObject({ verified: true })
  })

  it.each([
    ['gitSha', '0'.repeat(40)],
    ['releaseId', 'wrong-54fa9e6'],
    ['environment', 'production'],
    ['cmsSchemaVersion', 'legacy'],
  ])('rejects a mismatched %s', async (field, value) => {
    const baseUrl = await serveVersion()
    await expect(checkReleaseVersion(baseUrl, { ...identity, [field]: value })).rejects.toThrow(
      /release identity mismatch/
    )
  })

  it('checks basic structure without claiming a target identity match', async () => {
    const baseUrl = await serveVersion()
    await expect(checkReleaseVersion(baseUrl, {})).resolves.toEqual({
      identity,
      verified: false,
    })
  })
})

describe('CI and test environment contracts', () => {
  it('uses github.sha without deployment permissions and isolates Directus in browser tests', async () => {
    const root = resolve(import.meta.dirname, '../..')
    const workflow = await readFile(resolve(root, '.github/workflows/ci.yml'), 'utf8')
    const playwright = await readFile(resolve(root, 'playwright.config.ts'), 'utf8')
    const formal = await readFile(resolve(root, 'playwright.formal.config.ts'), 'utf8')

    expect(workflow).toContain('github.sha')
    expect(workflow).toContain('DEPLOY_ENVIRONMENT: ci')
    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).not.toMatch(/deploy|ssh|write-all/)
    for (const config of [playwright, formal]) {
      expect(config).toContain('DIRECTUS_URL=http://127.0.0.1:1')
      expect(config).toContain('DIRECTUS_CONTENT_TOKEN=')
      expect(config).toContain('DIRECTUS_CONTACT_TOKEN=')
    }
  })
})
