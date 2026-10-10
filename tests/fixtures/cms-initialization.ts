import { createServer } from 'node:http'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { CMS_SEEDS } from '../../scripts/data/cms-seed-config.mjs'

export type Row = Record<string, unknown>
export const counts: Record<string, number> = {
  homepage_content: 1,
  services: 3,
  warehouses: 12,
  cases: 6,
  faqs: 85,
  faq_pages: 14,
  publications: 14,
  service_pages: 9,
  about_content: 1,
  about_history: 10,
  about_honors: 15,
  site_settings: 1,
}
export const singletonNames = new Set(['homepage_content', 'about_content', 'site_settings'])
export type Call = { method: string; path: string; body?: Row }
type Fault = (call: Call, calls: Call[]) => unknown

export function initialRecords() {
  const records: Record<string, Row[]> = {}
  for (const name of Object.keys(counts)) {
    records[name] = (CMS_SEEDS[name as keyof typeof CMS_SEEDS] as Row[]).map((row, i) => ({
      status: 'published',
      ...structuredClone(row),
      id: i + 1,
    }))
  }
  const pages = new Map(records.faq_pages.map(({ key, id }) => [key, id]))
  records.faqs = records.faqs.map(({ faqPageKey, ...row }) => ({
    ...row,
    faq_page: pages.get(faqPageKey),
  }))
  return records
}

export function createContentFixture(ready = false) {
  const records: Record<string, Row[]> = ready
    ? initialRecords()
    : Object.fromEntries(Object.keys(counts).map((name) => [name, []]))
  const calls: Call[] = []
  let fault: Fault | undefined
  const directus = {
    async request(method: string, path: string, body?: Row) {
      const call = { method, path, body: structuredClone(body) }
      calls.push(call)
      const match = /^\/items\/([^/?]+)(?:\?.*)?$/.exec(path)
      const name = match?.[1] ?? ''
      if (!Object.hasOwn(counts, name)) throw new Error(`forbidden fixture path: ${path}`)
      const result = fault?.(call, calls)
      if (result !== undefined) return structuredClone(result)
      if (method === 'GET') {
        return singletonNames.has(name)
          ? structuredClone(records[name][0] ?? null)
          : structuredClone(records[name])
      }
      if (!body || !['POST', 'PATCH'].includes(method)) throw new Error('invalid fixture write')
      const row = { ...structuredClone(body), id: records[name].length + 1 }
      if (method === 'PATCH') {
        if (!singletonNames.has(name)) throw new Error('unexpected non-singleton PATCH')
        records[name] = [{ ...records[name][0], ...row }]
      } else records[name].push(row)
      return structuredClone(row)
    },
  }
  return {
    records,
    calls,
    directus,
    setFault(next?: Fault) {
      fault = next
    },
    writes: () => calls.filter(({ method }) => method !== 'GET'),
  }
}

export async function startContentHttpFixture(ready = false) {
  const fixture = createContentFixture(ready)
  const server = createServer(async (request, response) => {
    try {
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(Buffer.from(chunk))
      const text = Buffer.concat(chunks).toString()
      const data = await fixture.directus.request(
        request.method ?? '',
        request.url ?? '',
        text ? JSON.parse(text) : undefined
      )
      response.setHeader('content-type', 'application/json')
      response.end(JSON.stringify({ data }))
    } catch (error) {
      response.statusCode = Number((error as { status?: number }).status) || 500
      response.end(JSON.stringify({ errors: [{ message: (error as Error).message }] }))
    }
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('missing loopback listener')
  return {
    ...fixture,
    url: `http://127.0.0.1:${address.port}`,
    async close() {
      server.close()
      await once(server, 'close')
    },
  }
}

export async function runInitializationCli(url: string, args: string[], token = 'fixture-only') {
  if (!url.startsWith('http://127.0.0.1:')) throw new Error('loopback URL required')
  const child = spawn(process.execPath, ['scripts/init-cms-content.mjs', ...args], {
    cwd: resolve(import.meta.dirname, '../..'),
    env: { PATH: process.env.PATH, DIRECTUS_URL: url, DIRECTUS_TOKEN: token },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', (chunk) => {
    output += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    output += chunk.toString()
  })
  const [code] = await once(child, 'exit')
  return { code, output }
}
