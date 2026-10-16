import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { spawnNode } from './local-dev-process'

export const projectRoot = join(import.meta.dirname, '../..')

export async function createLocalDevFixture(files: Record<string, string> = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'xyy-local-dev-'))
  for (const [relative, content] of Object.entries(files)) {
    const path = join(directory, relative)
    await mkdir(join(path, '..'), { recursive: true })
    await writeFile(path, content)
  }
  return {
    directory,
    cleanup: () => rm(directory, { recursive: true, force: true }),
  }
}

export function localDevelopmentEnv(port: number) {
  return {
    NODE_ENV: 'development',
    DEPLOY_ENVIRONMENT: 'ci',
    HOST: '127.0.0.1',
    PORT: String(port),
    PUBLIC_SITE_URL: `http://127.0.0.1:${port}`,
    DIRECTUS_URL: 'http://127.0.0.1:1',
    PUBLIC_DIRECTUS_URL: 'http://127.0.0.1:1',
    XIANSUO_API_URL: 'https://127.0.0.1:1',
    ASTRO_TELEMETRY_DISABLED: '1',
    ASTRO_DISABLE_UPDATE_CHECK: 'true',
  }
}

export function spawnLifecycleFixture(kind: string) {
  const lifecycle = join(projectRoot, 'scripts/lib/local-dev-lifecycle.mjs')
  const source = `
    import { createServer } from 'node:net'
    import { createLocalDevLifecycle } from ${JSON.stringify(lifecycle)}
    const kind = ${JSON.stringify(kind)}
    const server = createServer()
    const closeListener = () => new Promise((resolve) => {
      if (!server.listening) return resolve()
      server.close(() => resolve())
    })
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })
    console.log(JSON.stringify({ marker: 'CHILD_READY', pid: process.pid, port: server.address().port, kind }))
    const lifecycle = createLocalDevLifecycle({ readyTimeoutMs: 60, stopTimeoutMs: 60 })
    lifecycle.install()
    if (kind === 'unattached-timeout') {
      // The helper owns no server and must fail its ready deadline.
    } else if (kind === 'unattached-reject') {
      setTimeout(() => void lifecycle.fail(new Error('fixture_startup_rejected')), 10)
    } else if (kind === 'attached-reject') {
      lifecycle.attach({ stop: async () => { await closeListener(); throw new Error('fixture_stop_rejected') } })
      setTimeout(() => void lifecycle.fail(new Error('fixture_failure')), 10)
    } else if (kind === 'attached-timeout') {
      lifecycle.attach({ stop: async () => { await closeListener(); return new Promise(() => {}) } })
      setTimeout(() => void lifecycle.fail(new Error('fixture_failure')), 10)
    } else if (kind === 'unattached-sigint') {
      setTimeout(() => process.kill(process.pid, 'SIGINT'), 20)
    } else if (kind === 'attached-second-signal') {
      lifecycle.attach({ stop: async () => { await closeListener(); return new Promise(() => {}) } })
      setTimeout(() => process.kill(process.pid, 'SIGTERM'), 20)
      setTimeout(() => process.kill(process.pid, 'SIGINT'), 40)
    } else {
      throw new Error('unknown_fixture_case:' + kind)
    }
  `
  return spawnNode(process.execPath, ['--input-type=module', '--eval', source], {
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'test', TMPDIR: '/home/yj/data/t1504' },
  })
}
