import { queryToParams } from '@directus/sdk'
import { SITE_URL } from './site-config'
import type { DirectusCollection } from './directus-types'
import {
  classifyDirectusError,
  DirectusRequestError,
  invalidDirectusData,
  resetDirectusFallbackLogForTests,
} from './directus/request-state'

const DEFAULT_DIRECTUS_API_URL = 'http://127.0.0.1:8055'
export const DIRECTUS_REQUEST_TIMEOUT_MS = 3000

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

let runtimeEnvLoaded = false

function loadRuntimeEnv() {
  if (runtimeEnvLoaded || typeof process === 'undefined') return
  runtimeEnvLoaded = true
  try {
    process.loadEnvFile()
  } catch {
    // Production commonly injects variables without shipping a .env file.
  }
}

function serverEnv(name: string) {
  loadRuntimeEnv()
  return typeof process !== 'undefined' ? process.env[name] : undefined
}

export function getDirectusApiUrl() {
  return trimTrailingSlash(
    serverEnv('DIRECTUS_URL') || import.meta.env.DIRECTUS_URL || DEFAULT_DIRECTUS_API_URL
  )
}

export function getDirectusPublicUrl() {
  return trimTrailingSlash(import.meta.env.PUBLIC_DIRECTUS_URL || `${SITE_URL}/cms`)
}

export function getDirectusAssetUrl(fileId?: string | null) {
  return fileId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fileId)
    ? `${SITE_URL}/api/cms-assets/${fileId}`
    : ''
}

export function getDirectusContentToken() {
  return serverEnv('DIRECTUS_CONTENT_TOKEN') || ''
}

type DirectusRequester = (
  collection: DirectusCollection,
  query: Record<string, unknown>
) => Promise<unknown>

let requestOverride: DirectusRequester | null = null
let requestTimeoutMs = DIRECTUS_REQUEST_TIMEOUT_MS

export function __setDirectusRequesterForTests(requester: DirectusRequester | null) {
  requestOverride = requester
  if (requester === null) resetDirectusFallbackLogForTests()
}

export function __setDirectusTimeoutForTests(timeoutMs?: number) {
  requestTimeoutMs = timeoutMs ?? DIRECTUS_REQUEST_TIMEOUT_MS
}

type DirectusPayload = { data: unknown }

function isPayload(value: unknown): value is DirectusPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.hasOwnProperty.call(value, 'data')
  )
}

function isDirectusRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  )
}

function buildItemsUrl(collection: DirectusCollection, query: Record<string, unknown>) {
  const url = new URL(`${getDirectusApiUrl()}/items/${String(collection)}`)
  const params = queryToParams(query as Parameters<typeof queryToParams>[0])
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url
}

async function withinTimeout<T>(
  collection: DirectusCollection,
  operation: string,
  task: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(
        new DirectusRequestError({
          kind: 'unavailable',
          collection,
          operation,
          reason: 'timeout',
        })
      )
    }, requestTimeoutMs)
  })
  try {
    return await Promise.race([task(controller.signal), timeout])
  } catch (error) {
    throw classifyDirectusError(error, collection, operation)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function fetchData(
  collection: DirectusCollection,
  query: Record<string, unknown>,
  operation: string
) {
  return withinTimeout(collection, operation, async (signal) => {
    if (requestOverride) return requestOverride(collection, query)

    const token = getDirectusContentToken()
    const response = await fetch(buildItemsUrl(collection, query), {
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (response.status === 401 || response.status === 403) {
      throw Object.assign(new Error('Directus authorization failed'), { status: response.status })
    }
    if (response.status >= 500) {
      throw Object.assign(new Error('Directus server failed'), { status: response.status })
    }
    if (!response.ok) {
      throw Object.assign(new Error('Directus request failed'), { status: response.status })
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch (error) {
      throw invalidDirectusData(collection, operation, 'invalid_json', error)
    }
    if (!isPayload(payload)) throw invalidDirectusData(collection, operation, 'missing_data')
    return payload.data
  })
}

export async function requestItems<T>(
  collection: DirectusCollection,
  query: Record<string, unknown>
): Promise<T> {
  const operation = 'read_items'
  const data = await fetchData(collection, query, operation)
  if (!Array.isArray(data) || data.some((item) => !isDirectusRecord(item))) {
    throw invalidDirectusData(collection, operation, 'invalid_data')
  }
  return data as T
}

export async function requestSingleton<T>(
  collection: DirectusCollection,
  query: Record<string, unknown> = {}
): Promise<T | null> {
  const operation = 'read_singleton'
  const result = await fetchData(collection, query, operation)
  const data = Array.isArray(result) ? (result[0] ?? null) : result
  if (data === null) return null
  if (!isDirectusRecord(data)) throw invalidDirectusData(collection, operation, 'invalid_data')
  return data as T
}

export async function freshItems<T>(
  collection: DirectusCollection,
  query: Record<string, unknown>
): Promise<T[]> {
  return requestItems<T[]>(collection, query)
}
