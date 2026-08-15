import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CMS_COLLECTION_DEFINITIONS } from '../../scripts/data/cms-collection-definitions.mjs'
import {
  CMS_ALL_COLLECTIONS,
  CMS_CONTENT_COLLECTIONS,
  CMS_LEGACY_COLLECTIONS,
  CMS_PRIVATE_COLLECTIONS,
  deriveRuntimeReadCollections,
} from '../../config/cms-collections.mjs'
import {
  CONTENT_COLLECTIONS,
  hasAllowedContactCreateFields,
  hasContactCreatePermission,
  hasContentReadPermission,
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
    expect(runtimeSources).not.toContain("serverEnv('DIRECTUS_TOKEN')")
    expect(runtimeSources).not.toContain('process.env.DIRECTUS_TOKEN')
  })

  it('keeps private contact leads out of the public content collection set', () => {
    expect(CONTENT_COLLECTIONS).toContain('faqs')
    expect(CONTENT_COLLECTIONS).not.toContain('contact_leads')
    expect(CONTENT_COLLECTIONS).toEqual(CMS_CONTENT_COLLECTIONS)
    expect(CMS_PRIVATE_COLLECTIONS).toEqual(['contact_leads'])
    expect(CMS_LEGACY_COLLECTIONS).not.toEqual([])
    expect(CONTENT_COLLECTIONS).not.toEqual(expect.arrayContaining(CMS_LEGACY_COLLECTIONS))
  })

  it('derives runtime reads from the main CMS contract and excludes explicit opt-outs', () => {
    expect(
      deriveRuntimeReadCollections([
        { name: 'visible', lifecycle: 'active', runtimeRead: true },
        { name: 'active_opt_out', lifecycle: 'active', runtimeRead: false },
        { name: 'legacy', lifecycle: 'legacy', runtimeRead: true },
        { name: 'private', lifecycle: 'private', runtimeRead: true },
      ])
    ).toEqual(['visible'])
  })

  it('keeps the CMS schema and runtime collection contract synchronized', () => {
    const definitionNames = CMS_COLLECTION_DEFINITIONS.map((definition) => definition.name)

    expect(definitionNames).toHaveLength(new Set(definitionNames).size)
    expect(new Set(definitionNames)).toEqual(new Set(CMS_ALL_COLLECTIONS))
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
      error: null,
    })
  })

  it('never exposes the legacy shared token to the web runtime', () => {
    expect(resolveRuntimeTokens({ DIRECTUS_TOKEN: 'legacy-token' })).toEqual({
      contentToken: '',
      contactToken: '',
      error: 'runtime_tokens_missing',
    })
  })

  it('rejects identical dedicated runtime tokens without exposing their values', () => {
    expect(
      resolveRuntimeTokens({
        DIRECTUS_CONTENT_TOKEN: 'same-token',
        DIRECTUS_CONTACT_TOKEN: 'same-token',
      })
    ).toEqual({
      contentToken: 'same-token',
      contactToken: 'same-token',
      error: 'runtime_tokens_must_be_distinct',
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

  it('accepts collection-scoped read access with or without licensed item filters', () => {
    expect(
      hasContentReadPermission({ data: { cases: { read: { access: 'partial' } } } }, 'cases')
    ).toBe(true)
    expect(
      hasContentReadPermission({ data: { cases: { read: { access: 'full' } } } }, 'cases')
    ).toBe(true)
    expect(
      hasContentReadPermission({ data: { cases: { read: { access: 'none' } } } }, 'cases')
    ).toBe(false)
  })

  it('accepts exact form fields or Directus Community full-field create access', () => {
    expect(
      hasAllowedContactCreateFields({
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
      hasAllowedContactCreateFields({
        data: { contact_leads: { create: { access: 'full', fields: ['*'] } } },
      })
    ).toBe(true)
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
