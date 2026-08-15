import { readFile } from 'node:fs/promises'

import { validateReleaseIdentity } from '../config/release-contract.mjs'

const unavailable = Object.freeze({
  status: 'unavailable',
  error: 'release_identity_unavailable',
})

export async function loadReleaseIdentity({ manifestPath }) {
  if (!manifestPath) throw new Error('release identity manifest path is required')
  const content = await readFile(manifestPath, 'utf8')
  return validateReleaseIdentity(JSON.parse(content))
}

export function createVersionHandler({ manifestPath }) {
  return async function versionHandler(_request, response) {
    response.set('Cache-Control', 'no-store')
    response.set('Content-Type', 'application/json')
    try {
      const identity = await loadReleaseIdentity({ manifestPath })
      return response.status(200).json(identity)
    } catch {
      return response.status(503).json(unavailable)
    }
  }
}
