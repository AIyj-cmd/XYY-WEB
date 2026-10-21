import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { readFile } from 'node:fs/promises'
import { once } from 'node:events'
import { resolve } from 'node:path'
import { startEnglishNewsFixtureApp } from './english-news-fixture-app'

export type EnglishNewsFixtureMode =
  'ok' | 'empty' | 'unavailable' | 'unauthorized' | 'forbidden' | 'invalid'

export type ChineseNewsFixtureRecord = {
  id: number
  status: 'published' | 'draft' | 'archived'
  title: string
  slug: string
  summary: string
  content: string
  category: string
  published_at: string
}

export type EnglishNewsFixtureRecord = {
  id: number
  status: 'published' | 'draft' | 'archived'
  title: string
  slug: string
  summary: string
  content: string
  category: string
  published_at: string
  cover_image?: string | null
  legacy_news_id?: number | null
}

type FixtureState = {
  mode: EnglishNewsFixtureMode
  chineseRecords: ChineseNewsFixtureRecord[]
  englishRecords: EnglishNewsFixtureRecord[]
}

const appRoot = resolve(import.meta.dirname, '../..')

async function listen(server: Server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('fixture server did not expose a port')
  return address.port
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
  const [chineseRaw, englishRaw] = await Promise.all([
    readFile(resolve(appRoot, 'tests/fixtures/english-news-records.json'), 'utf8'),
    readFile(resolve(appRoot, 'tests/fixtures/english-news-independent-records.json'), 'utf8'),
  ])
  const past = new Date(Date.now() - 60_000).toISOString()
  const future = new Date(Date.now() + 86_400_000).toISOString()
  const timestamp = (value: string) =>
    value === '__PAST__' ? past : value === '__FUTURE__' ? future : value
  const chineseRecords = (JSON.parse(chineseRaw) as ChineseNewsFixtureRecord[]).map((record) => ({
    ...record,
    published_at: timestamp(record.published_at),
  }))
  const englishRecords = (JSON.parse(englishRaw) as EnglishNewsFixtureRecord[]).map((record) => ({
    ...record,
    published_at: timestamp(record.published_at),
  }))
  return { chineseRecords, englishRecords }
}

async function startMockDirectus(initial: Awaited<ReturnType<typeof loadFixtureRecords>>) {
  const state: FixtureState = {
    mode: 'ok',
    chineseRecords: structuredClone(initial.chineseRecords),
    englishRecords: structuredClone(initial.englishRecords),
  }
  const server = createServer((request, response) => {
    if (request.method !== 'GET' || !request.url?.startsWith('/items/')) {
      sendJson(response, 404, { errors: [{ message: 'fixture route not found' }] })
      return
    }
    const collection = new URL(request.url, 'http://127.0.0.1').pathname.split('/')[2]
    if (state.mode === 'unavailable')
      return sendJson(response, 503, { errors: [{ message: 'fixture unavailable' }] })
    if (state.mode === 'unauthorized')
      return sendJson(response, 401, { errors: [{ message: 'fixture unauthorized' }] })
    if (state.mode === 'forbidden')
      return sendJson(response, 403, { errors: [{ message: 'fixture forbidden' }] })
    if (state.mode === 'invalid') return sendJson(response, 200, { malformed: true })
    if (state.mode === 'empty') return sendJson(response, 200, { data: [] })
    const source =
      collection === 'news'
        ? state.chineseRecords
        : collection === 'english_news'
          ? state.englishRecords
          : []
    const slug = querySlug(request)
    const records = slug ? source.filter((record) => record.slug === slug) : source
    return sendJson(response, 200, { data: records })
  })
  const port = await listen(server)
  return {
    url: `http://127.0.0.1:${port}`,
    setMode(mode: EnglishNewsFixtureMode) {
      state.mode = mode
    },
    setChineseRecords(records: ChineseNewsFixtureRecord[]) {
      state.chineseRecords = structuredClone(records)
    },
    setEnglishRecords(records: EnglishNewsFixtureRecord[]) {
      state.englishRecords = structuredClone(records)
    },
    async close() {
      server.close()
      await once(server, 'close')
    },
  }
}

export async function startEnglishNewsFixture() {
  const initial = await loadFixtureRecords()
  const cms = await startMockDirectus(initial)
  try {
    const app = await startEnglishNewsFixtureApp(cms.url)
    return { cms, app, ...initial }
  } catch (error) {
    await cms.close()
    throw error
  }
}

export type EnglishNewsFixture = Awaited<ReturnType<typeof startEnglishNewsFixture>>
