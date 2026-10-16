import { execFile as execFileCallback } from 'node:child_process'
import { createServer, type RequestListener, type Server } from 'node:http'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { CMS_SCHEMA_VERSION } from '../../config/cms-contract.mjs'

const execFile = promisify(execFileCallback)
const root = resolve(import.meta.dirname, '../..')
const identity = {
  schemaVersion: 1,
  gitSha: 'b'.repeat(40),
  gitShortSha: 'bbbbbbb',
  releaseId: '20261015T120000Z-bbbbbbb',
  buildTime: '2026-10-15T12:00:00.000Z',
  environment: 'staging',
  cmsSchemaVersion: CMS_SCHEMA_VERSION,
}
const servers: Server[] = []

afterEach(async () => {
  await Promise.all(
    servers
      .splice(0)
      .map((server) => new Promise<void>((resolveClose) => server.close(() => resolveClose())))
  )
})

async function serve(handler: RequestListener) {
  const server = createServer(handler)
  servers.push(server)
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolveListen)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('fixture did not bind')
  return `http://127.0.0.1:${address.port}`
}

async function runProbe(baseUrl: string, args: string[], extraEnv = {}) {
  return execFile(process.execPath, ['scripts/local-release-probe.mjs', ...args], {
    cwd: root,
    env: {
      PATH: process.env.PATH,
      LOCAL_PROBE_URL: baseUrl,
      LOCAL_PROBE_TIMEOUT_MS: '2000',
      ...extraEnv,
    },
  })
}

describe('local release probe command', () => {
  it('accepts a healthy loopback response without contacting an external service', async () => {
    const baseUrl = await serve((_request, response) => {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({ status: 'ok', dependencies: { cmsContent: 'ok', contactStorage: 'ok' } })
      )
    })

    await expect(runProbe(baseUrl, ['--health'])).resolves.toMatchObject({ stdout: '' })
  })

  it('rejects redirects, non-loopback bases and timeouts', async () => {
    const redirectUrl = await serve((_request, response) => {
      response.writeHead(308, { location: 'https://56xyy.com/healthz' })
      response.end()
    })
    await expect(runProbe(redirectUrl, ['--health'])).rejects.toMatchObject({
      stderr: expect.stringContaining('unexpectedly redirected: 308'),
    })

    await expect(runProbe('https://56xyy.com', ['--health'])).rejects.toMatchObject({
      stderr: expect.stringContaining('loopback HTTP origin'),
    })

    const timeoutUrl = await serve(() => {
      // Deliberately leave the request unresolved; AbortSignal must end the probe.
    })
    await expect(
      runProbe(timeoutUrl, ['--health'], { LOCAL_PROBE_TIMEOUT_MS: '100' })
    ).rejects.toMatchObject({
      stderr: expect.stringContaining('abort'),
    })
  })

  it('checks every release identity field against the local manifest', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-release-probe-'))
    try {
      const manifestPath = resolve(directory, 'release-manifest.json')
      await writeFile(manifestPath, `${JSON.stringify(identity)}\n`)
      const baseUrl = await serve((_request, response) => {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(identity))
      })
      await expect(
        runProbe(baseUrl, ['--version'], { RELEASE_MANIFEST: manifestPath })
      ).resolves.toMatchObject({ stdout: '' })

      const mismatch = { ...identity, environment: 'production' }
      const mismatchUrl = await serve((_request, response) => {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(mismatch))
      })
      await expect(
        runProbe(mismatchUrl, ['--version'], { RELEASE_MANIFEST: manifestPath })
      ).rejects.toMatchObject({ stderr: expect.stringContaining('environment') })
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})

describe('release compatibility consumers', () => {
  it('isolates both browser configurations to CI and loopback dependencies', async () => {
    const normal = await readFile(resolve(root, 'playwright.config.ts'), 'utf8')
    const formal = await readFile(resolve(root, 'playwright.formal.config.ts'), 'utf8')
    expect(normal).toContain('DEPLOY_ENVIRONMENT=ci')
    expect(formal).toContain('DEPLOY_ENVIRONMENT=ci')
    for (const config of [normal, formal]) {
      expect(config).toContain('XIANSUO_API_URL=https://127.0.0.1:1')
      expect(config).toContain('DIRECTUS_URL=http://127.0.0.1:1')
    }
    expect(formal).toContain('scripts/formal-test-server.mjs')
  })

  it('keeps formal proxy readiness and shutdown bounded', async () => {
    const source = await readFile(resolve(root, 'scripts/formal-test-server.mjs'), 'utf8')
    expect(source).toContain("redirect: 'manual'")
    expect(source).toContain("'x-forwarded-proto': 'https'")
    expect(source).toContain("process.once('SIGTERM'")
    expect(source).toContain("app.kill('SIGTERM')")
    expect(source).toContain("app.kill('SIGKILL')")
    expect(source).toContain('proxySockets')
    expect(source).toContain('formal proxy readiness failed')
  })

  it('uses the release-local probe for both active and rollback health/version checks', async () => {
    const deploy = await readFile(resolve(root, 'scripts/deploy.sh'), 'utf8')
    expect(deploy).toContain('scripts/local-release-probe.mjs')
    expect(deploy).toMatch(/local-release-probe\.mjs["\s].*--health/)
    expect(deploy).toMatch(/local-release-probe\.mjs["\s].*--version/)
    expect(deploy).toContain('legacy_previous_release_identity_unavailable')
    expect(deploy).toContain('rolled-back release failed health check')
  })
})
