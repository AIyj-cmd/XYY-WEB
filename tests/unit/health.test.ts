import { afterEach, describe, expect, it, vi } from 'vitest'
import { randomBytes } from 'node:crypto'

import { cmsContentStatus, contactStorageStatus } from '../../server/health.mjs'
import { CONTENT_COLLECTIONS } from '../../server/runtime-permissions.mjs'

const runtimeCollections: string[] = CONTENT_COLLECTIONS
const integrationToken = randomBytes(32).toString('base64url')

const env = {
  DIRECTUS_URL: 'https://directus.test',
  DIRECTUS_CONTENT_TOKEN: 'content-token',
  XIANSUO_API_URL: 'https://xs.test',
  XIANSUO_INGEST_TOKEN: integrationToken,
}

function contentPermissions(excludedCollection?: string) {
  return {
    data: Object.fromEntries(
      runtimeCollections.map((collection) => [
        collection,
        { read: { access: collection === excludedCollection ? 'none' : 'partial' } },
      ])
    ),
  }
}

describe('split web health status', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('checks Directus CMS content separately from Xiansuo contact storage', async () => {
    const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
      if (input === 'https://directus.test/server/ping') return new Response('pong')
      if (input === 'https://directus.test/permissions/me') {
        expect(init?.headers).toEqual({ Authorization: 'Bearer content-token' })
        return Response.json(contentPermissions())
      }
      if (input === 'https://xs.test/api/integrations/website-leads/health') {
        expect(init?.headers).toEqual({ Authorization: `Bearer ${integrationToken}` })
        return Response.json({ code: 0, data: { status: 'ok' } })
      }
      throw new Error(`unexpected URL ${input}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(cmsContentStatus(env)).resolves.toBe('ok')
    await expect(contactStorageStatus(env)).resolves.toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('contact_leads'),
      expect.anything()
    )
  })

  it('does not require a Directus contact token for CMS content health', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        if (input.endsWith('/server/ping')) return new Response('pong')
        return Response.json(contentPermissions())
      })
    )

    await expect(
      cmsContentStatus({
        DIRECTUS_URL: 'https://directus.test',
        DIRECTUS_CONTENT_TOKEN: 'content-token',
      })
    ).resolves.toBe('ok')
  })

  it('fails CMS content health when a required collection is forbidden', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        if (input.endsWith('/server/ping')) return new Response('pong')
        return Response.json(contentPermissions('news'))
      })
    )

    await expect(cmsContentStatus(env)).resolves.toBe('incomplete')
  })

  it.each([
    [{}, 'missing'],
    [{ XIANSUO_API_URL: 'https://xs.test', XIANSUO_INGEST_TOKEN: 'short' }, 'missing'],
    [{ XIANSUO_API_URL: 'http://xs.test', XIANSUO_INGEST_TOKEN: integrationToken }, 'missing'],
    [{ ...env, XIANSUO_API_URL: 'https://xs.test' }, 'unreachable'],
  ] as const)(
    'fails closed when Xiansuo contact health is unavailable',
    async (value, expected) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('{}', { status: 503 }))
      )
      await expect(contactStorageStatus(value)).resolves.toBe(expected)
    }
  )

  it('rejects a successful but malformed Xiansuo health payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ code: 0, data: {} }))
    )
    await expect(contactStorageStatus(env)).resolves.toBe('incomplete')
  })
})
