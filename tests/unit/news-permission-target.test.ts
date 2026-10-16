import { execFile } from 'node:child_process'
import { createServer, type RequestListener, type Server } from 'node:http'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { LOOPBACK_CMS, RETIRED_ORIGIN } from './helpers/remote-target-fixtures'

const run = promisify(execFile)
const root = new URL('../..', import.meta.url)
const servers: Server[] = []

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

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve())))
  )
})

describe('news permission target boundary', () => {
  it('produces a local preview without any network request', async () => {
    await expect(
      run(process.execPath, ['scripts/verify-news-permissions.mjs', `--target=${LOOPBACK_CMS}`], {
        cwd: root.pathname,
      })
    ).resolves.toMatchObject({
      stdout: expect.stringContaining('"target":"http://127.0.0.1:4399/cms"'),
    })
  })

  it('checks a loopback permission payload and refuses to follow a local redirect', async () => {
    let primaryRequests = 0
    let redirectRequests = 0
    const permissionPayload = {
      data: {
        news: {
          create: {
            access: 'full',
            fields: [
              'title',
              'slug',
              'category',
              'summary',
              'content',
              'published_at',
              'status',
              'cover_image',
            ],
          },
        },
      },
    }
    const redirectTarget = await serve((_request, response) => {
      redirectRequests += 1
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(permissionPayload))
    })
    const target = await serve((_request, response) => {
      primaryRequests += 1
      response.writeHead(302, { location: `${redirectTarget}/permissions/me` })
      response.end()
    })
    await expect(
      run(
        process.execPath,
        ['scripts/verify-news-permissions.mjs', `--target=${target}`, '--check'],
        {
          cwd: root.pathname,
          env: { ...process.env, DIRECTUS_NEWS_WRITE_TOKEN: 't'.repeat(32) },
        }
      )
    ).rejects.toMatchObject({ stderr: expect.stringContaining('TypeError') })
    expect(primaryRequests).toBe(1)
    expect(redirectRequests).toBe(0)
  })

  it('performs the read-only check against a loopback mock when the payload is valid', async () => {
    const target = await serve((_request, response) => {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          data: {
            news: {
              create: {
                access: 'full',
                fields: [
                  'title',
                  'slug',
                  'category',
                  'summary',
                  'content',
                  'published_at',
                  'status',
                  'cover_image',
                ],
              },
            },
          },
        })
      )
    })
    await expect(
      run(
        process.execPath,
        ['scripts/verify-news-permissions.mjs', `--target=${target}`, '--check'],
        {
          cwd: root.pathname,
          env: { ...process.env, DIRECTUS_NEWS_WRITE_TOKEN: 't'.repeat(32) },
        }
      )
    ).resolves.toMatchObject({ stdout: expect.stringContaining('"mode":"read-only-check"') })
  })

  it('rejects retired and public unknown targets before the permission fetch', async () => {
    for (const target of [RETIRED_ORIGIN, 'https://cms.example.com', 'https://8.138.148.180']) {
      await expect(
        run(
          process.execPath,
          ['scripts/verify-news-permissions.mjs', `--target=${target}`, '--check'],
          {
            cwd: root.pathname,
            env: { ...process.env, DIRECTUS_NEWS_WRITE_TOKEN: 'test-token' },
          }
        )
      ).rejects.toMatchObject({
        stderr: expect.stringContaining('news_permission_target_unapproved'),
      })
    }
  })
})
