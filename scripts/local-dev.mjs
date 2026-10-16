import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { waitForLocalDevIdentity } from './lib/local-dev-identity.mjs'
import { createLocalDevLifecycle } from './lib/local-dev-lifecycle.mjs'
import { inspectLocalDevPort } from './lib/local-dev-port.mjs'

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_PORT = 4321
const DEVELOPMENT_MODE = 'development'

export function projectOutputWatchIgnore(projectRoot) {
  const outputRoot = resolve(projectRoot, 'output')
  return (path) => path === outputRoot || path.startsWith(`${outputRoot}/`)
}

function portValue(value) {
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('local_dev_invalid_port')
  return port
}

export function parseLocalDevArguments(argv) {
  let port = DEFAULT_PORT
  let hasPort = false
  let hasMode = false
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const equalsIndex = argument.indexOf('=')
    const flag = equalsIndex === -1 ? argument : argument.slice(0, equalsIndex)
    const inlineValue = equalsIndex === -1 ? undefined : argument.slice(equalsIndex + 1)
    if (flag === '--port') {
      if (hasPort) throw new Error('local_dev_duplicate_port')
      const value = inlineValue ?? argv[++index]
      if (!value) throw new Error('local_dev_missing_port')
      port = portValue(value)
      hasPort = true
      continue
    }
    if (flag === '--mode') {
      if (hasMode) throw new Error('local_dev_duplicate_mode')
      const value = inlineValue ?? argv[++index]
      if (value !== DEVELOPMENT_MODE) throw new Error('local_dev_mode_must_be_development')
      hasMode = true
      continue
    }
    throw new Error(`local_dev_unsupported_argument:${argument}`)
  }
  return { port }
}

export function configureLocalDevelopment({ port }) {
  const origin = `http://127.0.0.1:${port}`
  Object.assign(process.env, {
    ASTRO_DISABLE_UPDATE_CHECK: 'true',
    ASTRO_TELEMETRY_DISABLED: '1',
    CI: '1',
    DEPLOY_ENVIRONMENT: 'ci',
    DIRECTUS_CONTENT_TOKEN: 'local-fake-content',
    DIRECTUS_URL: 'http://127.0.0.1:1',
    ENABLE_DOMAIN_REDIRECTS: 'false',
    HOST: '127.0.0.1',
    NODE_ENV: DEVELOPMENT_MODE,
    PORT: String(port),
    PUBLIC_DIRECTUS_URL: 'http://127.0.0.1:1',
    PUBLIC_SITE_URL: origin,
    XIANSUO_API_URL: 'https://127.0.0.1:1',
    XIANSUO_INGEST_TOKEN: 'local-fake-ingest',
  })
  process.argv = [
    process.argv[0] ?? process.execPath,
    process.argv[1] ?? fileURLToPath(import.meta.url),
    `--mode=${DEVELOPMENT_MODE}`,
  ]
  return origin
}

function assertServerAddress(server, port) {
  if (server.address?.address !== '127.0.0.1' || server.address.port !== port)
    throw new Error('local_dev_unexpected_server_address')
}

function readyRecord(origin, pid, reused) {
  return `LOCAL_DEV_READY ${JSON.stringify({ protocol: 1, origin, identityVerified: true, pid, reused })}`
}

async function startLocalDev({ port, projectRoot = PROJECT_ROOT }) {
  const lifecycle = createLocalDevLifecycle({})
  lifecycle.install()
  try {
    process.chdir(projectRoot)
    const origin = configureLocalDevelopment({ port })
    const existing = await inspectLocalDevPort({ projectRoot, port })
    if (existing.state === 'trusted') {
      await waitForLocalDevIdentity({ projectRoot, port })
      lifecycle.ready()
      console.log(readyRecord(origin, existing.pid, true))
      return { origin, pid: existing.pid, reused: true }
    }
    if (existing.state !== 'free') throw new Error(`local_dev_port_occupied:${existing.reason}`)

    const { dev } = await import('astro')
    const server = await dev({
      root: projectRoot,
      mode: DEVELOPMENT_MODE,
      logLevel: 'error',
      server: { host: '127.0.0.1', port },
      vite: {
        server: {
          host: '127.0.0.1',
          port,
          strictPort: true,
          watch: { ignored: projectOutputWatchIgnore(projectRoot) },
        },
      },
    })
    lifecycle.attach(server)
    assertServerAddress(server, port)
    const owner = await inspectLocalDevPort({ projectRoot, port, expectedPid: process.pid })
    if (owner.state !== 'trusted')
      throw new Error(`local_dev_owner_check:${owner.reason ?? owner.state}`)
    await waitForLocalDevIdentity({ projectRoot, port })
    lifecycle.ready()
    console.log(readyRecord(origin, process.pid, false))
    return { origin, pid: process.pid, reused: false }
  } catch (error) {
    await lifecycle.fail(error)
    return null
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseLocalDevArguments(process.argv.slice(2))
  await startLocalDev(options)
}

export { startLocalDev }
