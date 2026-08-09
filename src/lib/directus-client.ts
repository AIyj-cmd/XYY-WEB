import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { SITE_URL } from './site-config'
import type { DirectusCollection, DirectusSchema } from './directus-types'

const DEFAULT_DIRECTUS_API_URL = 'http://127.0.0.1:8055'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export function getDirectusApiUrl() {
  return trimTrailingSlash(import.meta.env.DIRECTUS_URL || DEFAULT_DIRECTUS_API_URL)
}

export function getDirectusPublicUrl() {
  return trimTrailingSlash(import.meta.env.PUBLIC_DIRECTUS_URL || `${SITE_URL}/cms`)
}

export function getDirectusAssetUrl(fileId?: string | null) {
  return fileId ? `${getDirectusPublicUrl()}/assets/${fileId}` : ''
}

const getClient = () => {
  const token = import.meta.env.DIRECTUS_TOKEN || ''
  return createDirectus<DirectusSchema>(getDirectusApiUrl()).with(staticToken(token)).with(rest())
}

type DirectusRequester = (
  collection: DirectusCollection,
  query: Record<string, unknown>
) => Promise<unknown>

let requestOverride: DirectusRequester | null = null

export function __setDirectusRequesterForTests(requester: DirectusRequester | null) {
  requestOverride = requester
}

export async function requestItems<T>(
  collection: DirectusCollection,
  query: Record<string, unknown>
): Promise<T> {
  if (requestOverride) return (await requestOverride(collection, query)) as T
  return getClient().request(readItems(collection as any, query as any)) as Promise<T>
}

export async function freshItems<T>(
  collection: DirectusCollection,
  query: Record<string, unknown>
): Promise<T[]> {
  try {
    return await requestItems<T[]>(collection, query)
  } catch (error) {
    console.error(
      '[directus] fetch failed for',
      collection,
      error instanceof Error ? error.message : String(error)
    )
    return []
  }
}
