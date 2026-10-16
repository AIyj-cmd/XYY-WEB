import { readFile } from 'node:fs/promises'

import { validateReleaseIdentity } from '../../config/release-contract.mjs'
import { assertWebHealthPayload } from './health-contract.mjs'

const LOCAL_PROXY_HEADERS = Object.freeze({
  'x-forwarded-proto': 'https',
  'x-forwarded-for': '127.0.0.1',
})

function requireLocalBaseUrl(value) {
  const url = new globalThis.URL(value)
  if (
    url.protocol !== 'http:' ||
    url.hostname !== '127.0.0.1' ||
    url.pathname !== '/' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('LOCAL_PROBE_URL must be a loopback HTTP origin')
  }
  return url
}

export async function requestLocalProbe({ baseUrl, path, timeoutMs = 2_000 }) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
    throw new Error('local probe path must be origin-relative')
  }
  const localBaseUrl = requireLocalBaseUrl(baseUrl)
  const url = new globalThis.URL(path, localBaseUrl)
  if (url.origin !== localBaseUrl.origin) {
    throw new Error('local probe path must not change origin')
  }
  const response = await fetch(url, {
    headers: LOCAL_PROXY_HEADERS,
    redirect: 'manual',
    signal: globalThis.AbortSignal.timeout(timeoutMs),
  })
  if (response.status >= 300 && response.status < 400) {
    throw new Error(
      `local probe unexpectedly redirected: ${response.status} ${response.headers.get('location')}`
    )
  }
  return response
}

export async function probeLocalHealth(options) {
  const response = await requestLocalProbe({ ...options, path: '/healthz' })
  if (!response.ok) throw new Error(`health HTTP ${response.status}`)
  assertWebHealthPayload(await response.json())
}

export async function probeLocalVersion({ baseUrl, manifestPath, timeoutMs }) {
  const expected = validateReleaseIdentity(JSON.parse(await readFile(manifestPath, 'utf8')))
  const response = await requestLocalProbe({ baseUrl, path: '/version', timeoutMs })
  if (!response.ok) throw new Error(`version HTTP ${response.status}`)
  const actual = validateReleaseIdentity(await response.json())
  for (const key of ['gitSha', 'releaseId', 'environment', 'cmsSchemaVersion']) {
    if (actual[key] !== expected[key]) throw new Error(`release identity mismatch: ${key}`)
  }
}
