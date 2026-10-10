import { URL } from 'node:url'

export function createDirectusAdminClient({ baseUrl, token }) {
  const normalizedUrl = baseUrl.replace(/\/+$/, '')

  if (!normalizedUrl || !token) {
    throw new Error('Directus base URL and token are required')
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  async function request(method, path, body, options = {}) {
    const { allowStatuses = [], unwrapData = true, warnOnly = false, requireData = false } = options
    const response = await fetch(`${normalizedUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()
    let payload = null

    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        throw Object.assign(new Error(`${method} ${path}: Directus returned invalid JSON`), {
          status: response.status,
          code: 'invalid_json',
        })
      }
    }

    if (!response.ok && !allowStatuses.includes(response.status)) {
      const message = payload?.errors?.[0]?.message || `${response.status} ${response.statusText}`
      if (warnOnly) {
        console.warn(`  [warn] ${method} ${path} → ${message}`)
        return unwrapData && payload && Object.hasOwn(payload, 'data') ? payload.data : payload
      }
      throw Object.assign(new Error(`${method} ${path}: ${message}`), { status: response.status })
    }

    if (requireData && (!payload || !Object.hasOwn(payload, 'data'))) {
      throw Object.assign(new Error(`${method} ${path}: Directus data envelope is required`), {
        status: response.status,
        code: 'invalid_envelope',
      })
    }

    return unwrapData && payload && Object.hasOwn(payload, 'data') ? payload.data : payload
  }

  return {
    baseUrl: normalizedUrl,
    endpointLabel: new URL(normalizedUrl).host,
    request,
    readCollection(collection) {
      return request('GET', `/items/${collection}?limit=-1&sort=sort`)
    },
  }
}
