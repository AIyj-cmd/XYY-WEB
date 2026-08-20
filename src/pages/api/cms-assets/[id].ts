import type { APIRoute } from 'astro'

import { fetchPublishedDirectusAsset, isDirectusFileId } from '@/lib/directus-assets'

export const prerender = false

export const GET: APIRoute = async ({ params, request }) => {
  const fileId = params.id || ''
  if (!isDirectusFileId(fileId)) return new Response(null, { status: 404 })
  try {
    return await fetchPublishedDirectusAsset(fileId, request.headers)
  } catch {
    return new Response(null, { status: 503 })
  }
}
