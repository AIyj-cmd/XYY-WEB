import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer as createNetServer } from 'node:net'
import { resolve } from 'node:path'

const appRoot = resolve(import.meta.dirname, '../..')
const buildOrigin = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4399'}`

async function getFreePort() {
  const server = createNetServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('could not reserve an app port')
  const port = address.port
  server.close()
  await once(server, 'close')
  return port
}

export async function startEnglishNewsFixtureApp(directusUrl: string) {
  const appPort = await getFreePort()
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: appRoot,
    env: {
      ...process.env,
      DEPLOY_ENVIRONMENT: 'ci',
      DIRECTUS_URL: directusUrl,
      DIRECTUS_CONTENT_TOKEN: 'english-news-fixture-token',
      ENABLE_DOMAIN_REDIRECTS: 'false',
      HOST: '127.0.0.1',
      PUBLIC_SITE_URL: buildOrigin,
      XIANSUO_API_URL: 'http://127.0.0.1:1',
      XIANSUO_INGEST_TOKEN: 'english-news-fixture-token',
      PORT: String(appPort),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const output: string[] = []
  const onData = (chunk: Buffer) => output.push(chunk.toString())
  child.stdout?.on('data', onData)
  child.stderr?.on('data', onData)
  await new Promise<void>((resolveReady, reject) => {
    let finished = false
    let retry: ReturnType<typeof setTimeout> | undefined
    const finish = (callback: () => void) => {
      if (finished) return
      finished = true
      clearTimeout(timeout)
      if (retry) clearTimeout(retry)
      callback()
    }
    const timeout = setTimeout(
      () => finish(() => reject(new Error(`fixture app did not start: ${output.join('')}`))),
      20_000
    )
    const check = async () => {
      try {
        if (
          (await fetch(`http://127.0.0.1:${appPort}/en/news`, { redirect: 'manual' })).status !==
          200
        )
          throw new Error('not_ready')
        finish(resolveReady)
      } catch {
        if (!finished) retry = setTimeout(check, 20)
      }
    }
    check()
    child.once('exit', (code) =>
      finish(() => reject(new Error(`fixture app exited ${code}: ${output.join('')}`)))
    )
  }).catch(async (error) => {
    if (child.exitCode === null) child.kill('SIGTERM')
    throw error
  })
  return {
    url: `http://127.0.0.1:${appPort}`,
    async close() {
      if (child.exitCode === null) {
        child.kill('SIGTERM')
        await once(child, 'exit')
      }
    },
  }
}
