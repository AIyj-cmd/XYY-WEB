import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { CMS_SCHEMA_VERSION } from '../../config/cms-contract.mjs'
import {
  probeLocalHealth,
  probeLocalVersion,
  requestLocalProbe,
} from '../../scripts/lib/local-probe.mjs'

const identity = {
  schemaVersion: 1,
  gitSha: 'a'.repeat(40),
  gitShortSha: 'aaaaaaa',
  releaseId: '20261015T120000Z-aaaaaaa',
  buildTime: '2026-10-15T12:00:00.000Z',
  environment: 'staging',
  cmsSchemaVersion: CMS_SCHEMA_VERSION,
}
const baseUrl = 'http://127.0.0.1:4399'

function response(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('requestLocalProbe', () => {
  it('uses trusted loopback headers and manual redirects', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ status: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)

    await requestLocalProbe({ baseUrl, path: '/healthz' })

    expect(fetchMock).toHaveBeenCalledWith(
      new URL(`${baseUrl}/healthz`),
      expect.objectContaining({
        redirect: 'manual',
        headers: { 'x-forwarded-proto': 'https', 'x-forwarded-for': '127.0.0.1' },
      })
    )
  })

  it('rejects a redirect instead of treating it as a healthy response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response('', 308, { location: 'https://56xyy.com/' }))
    )

    await expect(requestLocalProbe({ baseUrl, path: '/' })).rejects.toThrow(
      'local probe unexpectedly redirected: 308'
    )
  })

  it.each([
    ['https://56xyy.com/', baseUrl],
    ['http://localhost:4399/', baseUrl],
    ['http://127.0.0.1:4399/path', baseUrl],
    ['http://127.0.0.1:4399/?x=1', baseUrl],
    ['http://user:pass@127.0.0.1:4399/', baseUrl],
  ])('rejects a non-loopback or non-origin base URL: %s', async (invalidBase) => {
    await expect(requestLocalProbe({ baseUrl: invalidBase, path: '/' })).rejects.toThrow(
      'LOCAL_PROBE_URL must be a loopback HTTP origin'
    )
  })

  it.each(['//external.example/path', 'https://external.example/path', '\\external.example/path'])(
    'rejects an origin/path escape: %s',
    async (path) => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      await expect(requestLocalProbe({ baseUrl, path })).rejects.toThrow(
        'local probe path must be origin-relative'
      )
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )

  it('rejects a slash-backslash path that resolves to another origin', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(requestLocalProbe({ baseUrl, path: '/\\evil.example' })).rejects.toThrow(
      'local probe path must not change origin'
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows a backslash path when URL parsing keeps it on the loopback origin', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ status: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)

    await requestLocalProbe({ baseUrl, path: '/safe\\escape' })

    expect(fetchMock).toHaveBeenCalledWith(new URL(`${baseUrl}/safe/escape`), expect.any(Object))
  })

  it('propagates an abort or timeout from the local request', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new DOMException('timed out', 'AbortError'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(requestLocalProbe({ baseUrl, path: '/healthz', timeoutMs: 10 })).rejects.toThrow(
      'timed out'
    )
  })
})

describe('probeLocalHealth', () => {
  it('accepts the complete healthy dependency payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        response({
          status: 'ok',
          dependencies: { cmsContent: 'ok', contactStorage: 'ok' },
        })
      )
    )

    await expect(probeLocalHealth({ baseUrl })).resolves.toBeUndefined()
  })

  it('fails closed for an HTTP error or an incomplete dependency payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response({ status: 'degraded', dependencies: { cmsContent: 'unreachable' } }, 503)
        )
    )
    await expect(probeLocalHealth({ baseUrl })).rejects.toThrow('health HTTP 503')

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response({ status: 'ok', dependencies: { cmsContent: 'ok', contactStorage: 'missing' } })
        )
    )
    await expect(probeLocalHealth({ baseUrl })).rejects.toThrow('contact storage is not healthy')
  })
})

describe('probeLocalVersion', () => {
  it('requires exact release identity fields from the local version endpoint', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'xyy-local-probe-'))
    try {
      const manifestPath = resolve(directory, 'release-manifest.json')
      await writeFile(manifestPath, `${JSON.stringify(identity)}\n`)
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(identity)))

      await expect(
        probeLocalVersion({ baseUrl, manifestPath, timeoutMs: 2_000 })
      ).resolves.toBeUndefined()

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(response({ ...identity, releaseId: 'wrong-release' }))
      )
      await expect(probeLocalVersion({ baseUrl, manifestPath, timeoutMs: 2_000 })).rejects.toThrow(
        'release_identity_invalid: releaseId'
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
