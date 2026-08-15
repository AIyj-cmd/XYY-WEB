import { describe, expect, it, vi } from 'vitest'

import { verifyRuntimePermissions } from '../../scripts/verify-runtime-permissions.mjs'
import { CMS_LEGACY_COLLECTIONS } from '../../config/cms-collections.mjs'
import { CONTENT_COLLECTIONS } from '../../server/runtime-permissions.mjs'

const contentToken = 'content-token'
const contactToken = 'contact-token'
const runtimeCollections: string[] = CONTENT_COLLECTIONS

type PermissionPayloads = {
  content: { data: Record<string, Record<string, unknown>> }
  contact: { data: Record<string, Record<string, unknown>> }
}

function permissionEntry(actions: Record<string, unknown>) {
  return actions
}

function permissionsPayload(): PermissionPayloads {
  const content = Object.fromEntries(
    runtimeCollections.map((collection) => [
      collection,
      permissionEntry({
        read: { access: 'full' },
        create: { access: 'none' },
        update: { access: 'none' },
        delete: { access: 'none' },
        share: { access: 'none' },
      }),
    ])
  )
  const contact = {
    contact_leads: permissionEntry({
      create: { access: 'full', fields: ['*'] },
      read: { access: 'none' },
      update: { access: 'none' },
      delete: { access: 'none' },
      share: { access: 'none' },
    }),
  }
  return { content: { data: content }, contact: { data: contact } }
}

function auditFetch(
  forbiddenStatus: number | 'network' = 403,
  mutatePermissions?: (payloads: ReturnType<typeof permissionsPayload>) => void
) {
  const payloads = permissionsPayload()
  mutatePermissions?.(payloads)
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/permissions/me')) {
      const authorization = (init?.headers as Record<string, string>)?.Authorization
      return Response.json(
        authorization === `Bearer ${contentToken}` ? payloads.content : payloads.contact
      )
    }
    const isAllowedContentRead =
      (init?.headers as Record<string, string>)?.Authorization === `Bearer ${contentToken}` &&
      runtimeCollections.some((collection) => url.includes(`/items/${collection}?`))
    if (isAllowedContentRead) return Response.json({ data: [] })
    if (forbiddenStatus === 'network') throw new TypeError('connection refused')
    return new Response(null, { status: forbiddenStatus })
  })
}

function auditOptions(fetchImpl: typeof fetch) {
  return { directusUrl: 'https://directus.test', contentToken, contactToken, fetchImpl }
}

describe('runtime permission audit', () => {
  it('rejects missing or identical dedicated tokens before probing Directus', async () => {
    const fetchMock = vi.fn()
    await expect(
      verifyRuntimePermissions({
        directusUrl: 'https://directus.test',
        contentToken: '',
        contactToken,
        fetchImpl: fetchMock,
      })
    ).rejects.toThrow('runtime_tokens_missing')
    await expect(
      verifyRuntimePermissions({
        directusUrl: 'https://directus.test',
        contentToken: 'same-token',
        contactToken: 'same-token',
        fetchImpl: fetchMock,
      })
    ).rejects.toThrow('runtime_tokens_must_be_distinct')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts 401/403 refusals and reports application-enforced contact fields', async () => {
    await expect(verifyRuntimePermissions(auditOptions(auditFetch(403)))).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        fieldRestrictionMode: 'application_enforced',
      })
    )
  })

  it.each([200, 404])(
    'fails closed when a forbidden endpoint returns %s',
    async (forbiddenStatus) => {
      await expect(
        verifyRuntimePermissions(auditOptions(auditFetch(forbiddenStatus)))
      ).resolves.toEqual(
        expect.objectContaining({
          ok: false,
          failures: expect.arrayContaining([
            expect.stringContaining(`returned ${forbiddenStatus}`),
          ]),
        })
      )
    }
  )

  it('reports network errors as permission_verification_unreachable', async () => {
    await expect(verifyRuntimePermissions(auditOptions(auditFetch('network')))).rejects.toThrow(
      'permission_verification_unreachable'
    )
  })

  it('fails when the content token gains a write action', async () => {
    const fetchMock = auditFetch(403, (payloads) => {
      payloads.content.data.cases.create = { access: 'full' }
    })
    await expect(verifyRuntimePermissions(auditOptions(fetchMock))).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        failures: expect.arrayContaining(['content token unexpectedly has create access to cases']),
      })
    )
  })

  it('fails when the contact token gains read access to leads or content', async () => {
    const fetchMock = auditFetch(403, (payloads) => {
      payloads.contact.data.contact_leads.read = { access: 'full' }
      payloads.contact.data.cases = { read: { access: 'full' } }
    })
    const result = await verifyRuntimePermissions(auditOptions(fetchMock))

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        failures: expect.arrayContaining([
          'contact token unexpectedly has read access to contact_leads',
          'contact token unexpectedly has read access to cases',
        ]),
      })
    )
  })

  it('audits legacy collections as forbidden rather than runtime-readable', async () => {
    const fetchMock = auditFetch(403)
    await verifyRuntimePermissions(auditOptions(fetchMock))

    for (const collection of CMS_LEGACY_COLLECTIONS) {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/items/${collection}?`),
        expect.anything()
      )
    }
  })
})
