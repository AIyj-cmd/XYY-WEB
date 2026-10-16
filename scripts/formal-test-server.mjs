import { createServer, request as requestHttp } from 'node:http'
import { spawn } from 'node:child_process'

const proxyPort = parsePort(process.env.FORMAL_TEST_PROXY_PORT, 'FORMAL_TEST_PROXY_PORT')
const appPort = parsePort(process.env.FORMAL_TEST_APP_PORT, 'FORMAL_TEST_APP_PORT')

if (proxyPort === appPort) throw new Error('formal proxy and application ports must differ')

const app = spawn(process.execPath, ['server.mjs'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(appPort),
    TRUSTED_PROXY_CIDRS: '127.0.0.1/32',
  },
  stdio: 'inherit',
})

let shuttingDown = false
let proxy
const proxySockets = new Set()

function parsePort(value, name) {
  if (!/^\d+$/.test(value || '')) throw new Error(`${name} must be a TCP port`)
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65_535)
    throw new Error(`${name} must be a TCP port`)
  return port
}

function requestOptions(request) {
  const headers = { ...request.headers }
  headers['x-forwarded-proto'] = 'https'
  headers['x-forwarded-for'] = '127.0.0.1'
  delete headers.connection
  return {
    host: '127.0.0.1',
    port: appPort,
    method: request.method,
    path: request.url,
    headers,
  }
}

async function waitForApp() {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (shuttingDown) throw new Error('formal application shut down before readiness')
    if (app.exitCode !== null || app.signalCode !== null) {
      throw new Error(`formal application exited with ${app.exitCode ?? app.signalCode}`)
    }
    try {
      const response = await fetch(`http://127.0.0.1:${appPort}/`, {
        headers: { 'x-forwarded-proto': 'https', 'x-forwarded-for': '127.0.0.1' },
        redirect: 'manual',
        signal: globalThis.AbortSignal.timeout(1_000),
      })
      if (response.status === 200) return
    } catch {
      // The child may still be binding the loopback port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('formal application did not become ready')
}

function shutdown(exitCode) {
  if (shuttingDown) return
  shuttingDown = true
  proxy?.close()
  for (const socket of proxySockets) socket.destroy()
  if (app.exitCode === null) app.kill('SIGTERM')
  const forceKill = setTimeout(() => {
    if (app.exitCode === null) app.kill('SIGKILL')
  }, 5_000)
  forceKill.unref()
  process.exitCode = exitCode
}

app.once('error', (error) => {
  console.error('formal application failed to start: ' + error.message)
  shutdown(1)
})

app.once('exit', (code) => {
  if (!shuttingDown) {
    console.error(`formal application exited with ${code}`)
    shutdown(code || 1)
  }
})

process.once('SIGINT', () => shutdown(0))
process.once('SIGTERM', () => shutdown(0))

try {
  await waitForApp()
  if (shuttingDown || app.exitCode !== null || app.signalCode !== null) {
    throw new Error('formal application shut down before proxy listen')
  }
  proxy = createServer((request, response) => {
    const upstream = requestHttp(requestOptions(request), (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers)
      upstreamResponse.pipe(response)
    })
    upstream.setTimeout(5_000, () => {
      upstream.destroy(new Error('formal proxy upstream timeout'))
    })
    upstream.once('error', (error) => {
      if (!response.headersSent) response.writeHead(502, { 'content-type': 'text/plain' })
      response.end(`formal proxy upstream error: ${error.message}`)
    })
    request.pipe(upstream)
  })

  proxy.requestTimeout = 5_000
  proxy.headersTimeout = 6_000
  proxy.keepAliveTimeout = 1_000
  proxy.on('connection', (socket) => {
    proxySockets.add(socket)
    socket.once('close', () => proxySockets.delete(socket))
  })
  proxy.once('error', (error) => {
    console.error(`formal proxy error: ${error.message}`)
    shutdown(1)
  })

  proxy.listen(proxyPort, '127.0.0.1', () => {
    console.log(`Formal test proxy started on http://127.0.0.1:${proxyPort}`)
  })
} catch (error) {
  console.error(`formal proxy readiness failed: ${error.message}`)
  shutdown(1)
}
