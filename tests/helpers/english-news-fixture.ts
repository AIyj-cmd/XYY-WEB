import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { once } from 'node:events'
import { createServer as createNetServer } from 'node:net'
import { resolve } from 'node:path'

export type EnglishNewsFixtureMode =
  'ok' | 'empty' | 'unavailable' | 'unauthorized' | 'forbidden' | 'invalid'

export type EnglishNewsFixtureRecord = {
  id: number
  status: 'published' | 'draft' | 'archived'
  title: string
  slug: string
  summary: string
  content: string
  category: string
  published_at: string
  title_en?: string
  summary_en?: string
  content_en?: string
  english_status?: 'published' | 'draft' | 'archived'
  english_published_at?: string
}

type FixtureState = { mode: EnglishNewsFixtureMode; records: EnglishNewsFixtureRecord[] }

const appRoot = resolve(import.meta.dirname, '../..')

async function listen(server: Server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('fixture server did not expose a port')
  return address.port
}

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

function sendJson(response: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body)
  response.statusCode = status
  response.setHeader('content-type', 'application/json')
  response.end(payload)
}

function querySlug(request: IncomingMessage) {
  const query = new URL(request.url ?? '/', 'http://127.0.0.1')
  const filter = query.searchParams.get('filter')
  if (!filter) return undefined
  try {
    const parsed = JSON.parse(filter) as { slug?: { _eq?: string } }
    return parsed.slug?._eq
  } catch {
    return undefined
  }
}

async function loadFixtureRecords() {
  const raw = JSON.parse(
    await readFile(resolve(appRoot, 'tests/fixtures/english-news-records.json'), 'utf8')
  ) as EnglishNewsFixtureRecord[]
  const past = new Date(Date.now() - 60_000).toISOString()
  const future = new Date(Date.now() + 86_400_000).toISOString()
  return raw.map((record) => ({
    ...record,
    published_at: record.published_at === '__PAST__' ? past : future,
    english_published_at: record.english_published_at === '__PAST__' ? past : future,
  }))
}

async function startMockDirectus(initialRecords: EnglishNewsFixtureRecord[]) {
  const state: FixtureState = { mode: 'ok', records: structuredClone(initialRecords) }
  const server = createServer((request, response) => {
    if (request.method !== 'GET' || !request.url?.startsWith('/items/')) {
      sendJson(response, 404, { errors: [{ message: 'fixture route not found' }] })
      return
    }
    const collection = new URL(request.url, 'http://127.0.0.1').pathname.split('/')[2]
    if (collection !== 'news') return sendJson(response, 200, { data: [] })
    if (state.mode === 'unavailable')
      return sendJson(response, 503, { errors: [{ message: 'fixture unavailable' }] })
    if (state.mode === 'unauthorized')
      return sendJson(response, 401, { errors: [{ message: 'fixture unauthorized' }] })
    if (state.mode === 'forbidden')
      return sendJson(response, 403, { errors: [{ message: 'fixture forbidden' }] })
    if (state.mode === 'invalid') return sendJson(response, 200, { malformed: true })
    if (state.mode === 'empty') return sendJson(response, 200, { data: [] })
    const slug = querySlug(request)
    const records = slug ? state.records.filter((record) => record.slug === slug) : state.records
    return sendJson(response, 200, { data: records })
  })
  const port = await listen(server)
  return {
    url: `http://127.0.0.1:${port}`,
    setMode(mode: EnglishNewsFixtureMode) {
      state.mode = mode
    },
    setRecords(records: EnglishNewsFixtureRecord[]) {
      state.records = structuredClone(records)
    },
    async close() {
      server.close()
      await once(server, 'close')
    },
  }
}

async function startAppServer(directusUrl: string) {
  const appPort = await getFreePort()
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: appRoot,
    env: {
      ...process.env,
      DIRECTUS_URL: directusUrl,
      DIRECTUS_CONTENT_TOKEN: 'english-news-fixture-token',
      ENABLE_DOMAIN_REDIRECTS: 'false',
      HOST: '127.0.0.1',
      PUBLIC_SITE_URL: 'http://127.0.0.1',
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
    const timeout = setTimeout(() => {
      finished = true
      reject(new Error(`fixture app did not start: ${output.join('')}`))
    }, 20_000)
    const check = async () => {
      if (finished) return
      try {
        const response = await fetch(`http://127.0.0.1:${appPort}/en/news`)
        if (!response.ok) return setTimeout(check, 20)
      } catch {
        return setTimeout(check, 20)
      }
      finished = true
      clearTimeout(timeout)
      resolveReady()
    }
    check()
    child.once('exit', (code) => {
      finished = true
      clearTimeout(timeout)
      reject(new Error(`fixture app exited ${code}: ${output.join('')}`))
    })
  }).catch(async (error) => {
    if (child.exitCode === null) child.kill('SIGTERM')
    throw error
  })
  return {
    process: child,
    url: `http://127.0.0.1:${appPort}`,
    async close() {
      if (child.exitCode !== null) return
      child.kill('SIGTERM')
      await once(child, 'exit')
    },
  }
}

export async function startEnglishNewsFixture() {
  const records = await loadFixtureRecords()
  const cms = await startMockDirectus(records)
  try {
    const app = await startAppServer(cms.url)
    return { cms, app, records }
  } catch (error) {
    await cms.close()
    throw error
  }
}

export type EnglishNewsFixture = Awaited<ReturnType<typeof startEnglishNewsFixture>>
