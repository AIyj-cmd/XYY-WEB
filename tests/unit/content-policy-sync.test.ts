import { describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_CONTENT_POLICY_NAME,
  syncContentReadPermissions,
} from '../../scripts/lib/content-policy-sync.mjs'

describe('Directus content policy synchronization', () => {
  it('updates existing reads and creates missing collection permissions', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path.startsWith('/policies?')) {
        return [{ id: 'policy-1', name: DEFAULT_CONTENT_POLICY_NAME }]
      }
      if (method === 'GET' && path.startsWith('/permissions?')) {
        return [{ id: 7, policy: 'policy-1', collection: 'homepage_stats', action: 'read' }]
      }
      return {}
    })

    const result = await syncContentReadPermissions(
      { request },
      { collections: ['homepage_stats', 'cases'] }
    )

    expect(result).toMatchObject({ created: 1, updated: 1, total: 2 })
    expect(request).toHaveBeenCalledWith(
      'PATCH',
      '/permissions/7',
      expect.objectContaining({
        collection: 'homepage_stats',
        action: 'read',
        permissions: null,
      })
    )
    expect(request).toHaveBeenCalledWith(
      'POST',
      '/permissions',
      expect.objectContaining({ collection: 'cases', fields: ['*'] })
    )
  })

  it('uses published-only item rules only when the Directus license supports them', async () => {
    const request = vi.fn(async (method: string, path: string) => {
      if (method === 'GET' && path.startsWith('/policies?')) {
        return [{ id: 'policy-1', name: DEFAULT_CONTENT_POLICY_NAME }]
      }
      if (method === 'GET' && path.startsWith('/permissions?')) return []
      return {}
    })

    await syncContentReadPermissions({ request }, { collections: ['cases'], publishedOnly: true })

    expect(request).toHaveBeenCalledWith(
      'POST',
      '/permissions',
      expect.objectContaining({ permissions: { status: { _eq: 'published' } } })
    )
  })

  it('fails closed when the named policy does not exist', async () => {
    const request = vi.fn(async () => [])

    await expect(
      syncContentReadPermissions({ request }, { collections: ['cases'] })
    ).rejects.toThrow('Expected one Directus policy')
  })
})
