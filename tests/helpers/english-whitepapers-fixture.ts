import { createServer, type Server, type ServerResponse } from 'node:http'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer as createNetServer } from 'node:net'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PUBLICATION_FAQS } from '@/data/publications'

export type WhitepaperFixtureMode =
  'ok' | 'empty' | 'unavailable' | 'network' | 'unauthorized' | 'forbidden' | 'invalid'
type Collection = 'publications' | 'faqs'
export type WhitepaperFixtureRecord = {
  id: number
  status: 'published'
  sort: number
  issue: number
  title: string
  season: string
  summary: string
  cover: string
  pdf: string
  date: string
  is_latest: boolean
}
type State = Record<Collection, { mode: WhitepaperFixtureMode; records: unknown[] }>
const root = resolve(import.meta.dirname, '../..')

async function listen(server: Server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('fixture server did not expose a port')
  return address.port
}
async function freePort() {
  const server = createNetServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('no free port')
  const port = address.port
  server.close()
  await once(server, 'close')
  return port
}
function json(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('content-type', 'application/json')
  response.end(JSON.stringify(body))
}
async function loadRecords() {
  return JSON.parse(
    await readFile(resolve(root, 'tests/fixtures/english-whitepaper-records.json'), 'utf8')
  ) as WhitepaperFixtureRecord[]
}
async function mockDirectus(records: WhitepaperFixtureRecord[]) {
  const state: State = {
    publications: { mode: 'ok', records },
    faqs: {
      mode: 'ok',
      records: PUBLICATION_FAQS.map((faq, index) => ({
        id: index + 1,
        sort: index + 1,
        status: 'published',
        faq_page: { key: 'senlinqikan' },
        question: faq.q,
        answer: faq.a,
      })),
    },
  }
  const initial = structuredClone(state)
  const server = createServer((request, response) => {
    if (request.method !== 'GET' || !request.url?.startsWith('/items/'))
      return json(response, 404, { errors: [{ message: 'fixture route not found' }] })
    const collection = new URL(request.url, 'http://127.0.0.1').pathname.split('/')[2] as Collection
    const target = state[collection]
    if (!target) return json(response, 200, { data: [] })
    if (target.mode === 'network') return response.destroy()
    if (target.mode === 'unavailable')
      return json(response, 503, { errors: [{ message: 'fixture unavailable' }] })
    if (target.mode === 'unauthorized')
      return json(response, 401, { errors: [{ message: 'fixture unauthorized' }] })
    if (target.mode === 'forbidden')
      return json(response, 403, { errors: [{ message: 'fixture forbidden' }] })
    if (target.mode === 'invalid') return json(response, 200, { malformed: true })
    return json(response, 200, {
      data: target.mode === 'empty' ? [] : structuredClone(target.records),
    })
  })
  const port = await listen(server)
  return {
    url: `http://127.0.0.1:${port}`,
    setMode(collection: Collection, mode: WhitepaperFixtureMode) {
      state[collection].mode = mode
    },
    setRecords(collection: Collection, records: unknown[]) {
      state[collection].records = structuredClone(records)
    },
    reset() {
      Object.assign(state, structuredClone(initial))
    },
    async close() {
      server.close()
      await once(server, 'close')
    },
  }
}
async function appServer(directusUrl: string) {
  const port = await freePort()
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      DIRECTUS_URL: directusUrl,
      DIRECTUS_CONTENT_TOKEN: 'whitepaper-fixture-token',
      ENABLE_DOMAIN_REDIRECTS: 'false',
      HOST: '127.0.0.1',
      PUBLIC_SITE_URL: 'http://127.0.0.1',
      XIANSUO_API_URL: 'http://127.0.0.1:1',
      XIANSUO_INGEST_TOKEN: 'whitepaper-fixture-token',
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const output: string[] = []
  const capture = (chunk: Buffer) => {
    output.push(chunk.toString())
    if (output.length > 20) output.shift()
  }
  child.stdout?.on('data', capture)
  child.stderr?.on('data', capture)
  await new Promise<void>((resolveReady, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`fixture app did not start: ${output.join('')}`)),
      20_000
    )
    const check = async () => {
      try {
        if ((await fetch(`http://127.0.0.1:${port}/en/supply-chain-whitepapers`)).ok) {
          clearTimeout(timeout)
          resolveReady()
          return
        }
      } catch {
        setTimeout(check, 30)
        return
      }
      setTimeout(check, 30)
    }
    check()
    child.once('exit', (code) => {
      clearTimeout(timeout)
      reject(new Error(`fixture app exited ${code}: ${output.join('')}`))
    })
  }).catch(async (error) => {
    if (child.exitCode === null) child.kill('SIGTERM')
    throw error
  })
  return {
    url: `http://127.0.0.1:${port}`,
    async close() {
      if (child.exitCode === null) {
        child.kill('SIGTERM')
        await once(child, 'exit')
      }
    },
  }
}
export async function startEnglishWhitepaperFixture() {
  const records = await loadRecords()
  const cms = await mockDirectus(records)
  try {
    const app = await appServer(cms.url)
    return { cms, app, records }
  } catch (error) {
    await cms.close()
    throw error
  }
}
export type EnglishWhitepaperFixture = Awaited<ReturnType<typeof startEnglishWhitepaperFixture>>
