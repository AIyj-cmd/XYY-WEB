import { execFile } from 'node:child_process'
import { createServer, type RequestListener, type Server } from 'node:http'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

const run = promisify(execFile)
const root = new URL('../..', import.meta.url)
const servers: Server[] = []
const policyId = 'policy-1'

type Permission = {
  id: string
  policy: string
  collection: string
  action: string
  fields: string[]
  permissions: Record<string, unknown> | null
  validation: Record<string, unknown> | null
  presets: Record<string, unknown> | null
}

async function serve(handler: RequestListener) {
  const server = createServer(handler)
  servers.push(server)
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('server did not bind')
  return `http://127.0.0.1:${address.port}`
}

function readBody(request: Parameters<RequestListener>[0]) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => (body += chunk))
    request.on('error', reject)
    request.on('end', () => resolve(JSON.parse(body)))
  })
}

function response(response: Parameters<RequestListener>[1], data: unknown) {
  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(JSON.stringify({ data }))
}

function permission(status: 'draft' | 'published' = 'draft'): Permission {
  return {
    id: 'permission-1',
    policy: policyId,
    collection: 'english_news',
    action: 'read',
    fields: ['*'],
    permissions: { status: { _eq: status } },
    validation: null,
    presets: null,
  }
}

async function apply(target: string) {
  return run(
    process.execPath,
    [
      'scripts/sync-english-news-read-policy.mjs',
      '--apply',
      `--target=${target}`,
      '--confirm-environment=test',
    ],
    {
      cwd: root.pathname,
      env: {
        ...process.env,
        DIRECTUS_URL: target,
        DIRECTUS_TOKEN: 't'.repeat(32),
        DIRECTUS_CONTENT_POLICY_ID: policyId,
        CONFIRM_ENGLISH_NEWS_READ_POLICY: `${target}:test`,
      },
    }
  )
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve())))
  )
})

describe('english_news scoped read policy CLI', () => {
  it('updates a draft rule and accepts equivalent nested keys on the readback', async () => {
    let current = permission()
    let writes = 0
    const target = await serve(async (request, reply) => {
      if (request.method === 'GET') return response(reply, [current])
      if (request.method === 'PATCH') {
        writes += 1
        const body = await readBody(request)
        current = {
          fields: ['*'],
          presets: null,
          validation: null,
          permissions: { status: { _eq: 'published' } },
          action: 'read',
          collection: 'english_news',
          policy: policyId,
          id: current.id,
          ...body,
        } as Permission
        return response(reply, current)
      }
      reply.writeHead(404).end()
    })

    await expect(apply(target)).resolves.toMatchObject({
      stdout: expect.stringContaining('"changed":1'),
    })
    expect(writes).toBe(1)
    await expect(apply(target)).resolves.toMatchObject({
      stdout: expect.stringContaining('"changed":0'),
    })
    expect(writes).toBe(1)
  })

  it('fails when the write does not produce a published read policy', async () => {
    let writes = 0
    const target = await serve(async (request, reply) => {
      if (request.method === 'GET') return response(reply, [permission()])
      if (request.method === 'PATCH') {
        writes += 1
        await readBody(request)
        return response(reply, permission())
      }
      reply.writeHead(404).end()
    })

    await expect(apply(target)).rejects.toMatchObject({
      stderr: expect.stringContaining('english_news_read_policy_readback_failed'),
    })
    expect(writes).toBe(1)
  })

  it('rejects a matching query result with another collection before writing', async () => {
    let writes = 0
    const target = await serve((request, reply) => {
      if (request.method === 'GET')
        return response(reply, [{ ...permission('published'), collection: 'news' }])
      writes += 1
      reply.writeHead(200).end()
    })

    await expect(apply(target)).rejects.toMatchObject({
      stderr: expect.stringContaining('english_news_read_policy_scope_mismatch'),
    })
    expect(writes).toBe(0)
  })
})
