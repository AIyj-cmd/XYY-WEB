import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CMS_COLLECTION_DEFINITIONS } from '../../scripts/data/cms-collection-definitions.mjs'
import {
  CONTENT_COLLECTIONS,
  hasRestrictedContactCreateFields,
  hasContactCreatePermission,
  resolveRuntimeTokens,
} from '../../server/runtime-permissions.mjs'

describe('Directus runtime permission contracts', () => {
  it('never reads secret Directus tokens from build-time import.meta.env', () => {
    const root = resolve(import.meta.dirname, '../..')
    const runtimeSources = [
      readFileSync(resolve(root, 'src/lib/directus-client.ts'), 'utf8'),
      readFileSync(resolve(root, 'src/lib/contact/storage.ts'), 'utf8'),
    ].join('\n')

    expect(runtimeSources).not.toMatch(/import\.meta\.env\.DIRECTUS_(?:CONTENT_|CONTACT_)?TOKEN/)
  })

  it('keeps private contact leads out of the public content collection set', () => {
    expect(CONTENT_COLLECTIONS).toContain('faqs')
    expect(CONTENT_COLLECTIONS).not.toContain('contact_leads')
  })

  it('prefers split least-privilege tokens', () => {
    expect(
      resolveRuntimeTokens({
        DIRECTUS_CONTENT_TOKEN: 'content-token',
        DIRECTUS_CONTACT_TOKEN: 'contact-token',
        DIRECTUS_TOKEN: 'legacy-token',
      })
    ).toEqual({
      contentToken: 'content-token',
      contactToken: 'contact-token',
      usingLegacyToken: false,
    })
  })

  it('temporarily supports the legacy shared token during rollout', () => {
    expect(resolveRuntimeTokens({ DIRECTUS_TOKEN: 'legacy-token' })).toEqual({
      contentToken: 'legacy-token',
      contactToken: 'legacy-token',
      usingLegacyToken: true,
    })
  })

  it('recognizes create access without granting read access', () => {
    expect(
      hasContactCreatePermission({
        data: {
          contact_leads: {
            create: { access: 'full', fields: ['*'] },
            read: { access: 'none', fields: [] },
          },
        },
      })
    ).toBe(true)

    expect(
      hasContactCreatePermission({
        data: { contact_leads: { create: { access: 'none', fields: [] } } },
      })
    ).toBe(false)
  })

  it('requires the contact token to expose only website form fields', () => {
    expect(
      hasRestrictedContactCreateFields({
        data: {
          contact_leads: {
            create: {
              access: 'full',
              fields: ['name', 'phone', 'company', 'email', 'service', 'message'],
            },
          },
        },
      })
    ).toBe(true)
    expect(
      hasRestrictedContactCreateFields({
        data: { contact_leads: { create: { access: 'full', fields: ['*'] } } },
      })
    ).toBe(false)
  })

  it('keeps lead provenance and workflow status server-controlled', () => {
    const contactLeads = CMS_COLLECTION_DEFINITIONS.find(
      (definition) => definition.name === 'contact_leads'
    )

    expect(contactLeads?.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'status', schema: { default_value: 'new' } }),
        expect.objectContaining({ field: 'source', schema: { default_value: 'website' } }),
      ])
    )
  })
})
