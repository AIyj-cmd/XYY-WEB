import { URLSearchParams } from 'node:url'

export async function directusRequest(baseUrl, token, pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const text = await response.text()
  let payload
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = text
  }
  if (!response.ok) {
    const detail = typeof payload === 'string' ? payload : JSON.stringify(payload)
    throw new Error(
      `${options.method || 'GET'} ${pathname} -> ${response.status}: ${detail.slice(0, 500)}`
    )
  }
  return payload
}

export async function readAllItems(baseUrl, token, collection) {
  const rows = []
  const pageSize = 100
  for (let page = 1; ; page += 1) {
    const query = new URLSearchParams({
      limit: String(pageSize),
      page: String(page),
      fields: '*',
    })
    const payload = await directusRequest(
      baseUrl,
      token,
      `/items/${encodeURIComponent(collection)}?${query}`
    )
    const batch = payload?.data || []
    rows.push(...batch)
    if (batch.length < pageSize) return rows
  }
}

export async function readFieldDefinitions(baseUrl, token, collection) {
  const payload = await directusRequest(baseUrl, token, `/fields/${encodeURIComponent(collection)}`)
  return payload?.data || []
}
