import { collectionTranslations, fieldTranslations } from '../data/cms-admin-translations.mjs'
import { CMS_LEGACY_FIELD_ALLOWLIST } from '../../config/cms-contract.mjs'
import { assertCollectionSnapshot } from './cms-contract-runtime.mjs'
import { createCmsNavigationRuntime, metadataIncludes } from './cms-navigation-runtime.mjs'
import { createCmsSeedRuntime } from './cms-seed-runtime.mjs'

export function createCmsSetupRuntime(directus) {
  const seedRuntime = createCmsSeedRuntime(directus)
  const createNavigationGroup = createCmsNavigationRuntime(directus)

  /**
   * @param {{
   *   name: string,
   *   icon?: string,
   *   meta?: Record<string, unknown>,
   *   fields?: Array<{field: string, type: string, meta?: Record<string, unknown>, schema?: Record<string, unknown>}>,
   *   aliases?: Array<{field: string, type: 'alias', meta?: Record<string, unknown>}>,
   *   relations?: Array<{collection: string, field: string, related_collection: string, schema?: Record<string, unknown>, meta?: Record<string, unknown>}>,
   *   lifecycle?: 'active' | 'legacy' | 'private',
   *   identity?: { fields: string[] },
   *   seedPolicy?: 'normal' | 'migration_only' | 'never'
   * }} definition
   */
  async function createCollection({
    name,
    icon = 'database',
    meta = {},
    fields = [],
    relations = [],
    aliases = [],
    lifecycle = 'active',
    identity = { fields: [] },
    seedPolicy = 'never',
  }) {
    console.log(`\n[collection] ${name}`)
    const collections = await directus.request('GET', '/collections')
    const existingCollection = collections.find((collection) => collection.collection === name)
    const exists = Boolean(existingCollection)
    const translations = collectionTranslations(name)
    const collectionMeta = { icon, ...meta, ...(translations && { translations }) }
    if (!exists) {
      await directus.request('POST', '/collections', {
        collection: name,
        schema: { name },
        meta: collectionMeta,
      })
    } else {
      assertCollectionSnapshot(
        { name, meta, fields: [], relations: [], identity, lifecycle, seedPolicy },
        { collection: existingCollection, fields: [], relations: [], records: [] },
        { validateLegacyAllowlist: false }
      )
      if (!metadataIncludes(existingCollection.meta, collectionMeta)) {
        await directus.request('PATCH', `/collections/${name}`, { meta: collectionMeta })
      }
    }

    const existingFieldRecords = exists ? await directus.request('GET', `/fields/${name}`) : []
    const existingFields = new Map(existingFieldRecords.map((field) => [field.field, field]))
    let existingItems

    for (const definition of fields) {
      const { field, type, meta: fieldMeta = {}, schema = {} } = definition
      const translations = fieldTranslations(name, field)
      const desiredMeta = { ...fieldMeta, ...(translations && { translations }) }
      if (existingFields.has(field)) {
        assertCollectionSnapshot(
          {
            name,
            meta,
            fields: [definition],
            relations: [],
            identity: { fields: [] },
            lifecycle,
            seedPolicy,
          },
          {
            collection: existingCollection,
            fields: [existingFields.get(field)],
            relations: [],
            records: [],
          },
          { validateLegacyAllowlist: false }
        )
        if (!metadataIncludes(existingFields.get(field)?.meta, desiredMeta)) {
          await directus.request('PATCH', `/fields/${name}/${field}`, { meta: desiredMeta })
        }
        continue
      }
      if (exists && identity.fields.includes(field) && fieldMeta.required && schema.is_unique) {
        existingItems ??= await directus.request('GET', `/items/${name}?limit=1`)
        const populated = Array.isArray(existingItems)
          ? existingItems.length > 0
          : Boolean(existingItems && Object.keys(existingItems).length)
        if (populated) {
          throw new Error(
            `migration_required:missing_identity_field collection=${name} field=${field}`
          )
        }
      }
      await directus.request('POST', `/fields/${name}`, {
        field,
        type,
        schema,
        meta: {
          interface: 'input',
          display: 'raw',
          ...fieldMeta,
          ...(translations && { translations }),
        },
      })
    }

    const collectionFields = relations.length
      ? await directus.request('GET', `/fields/${name}`)
      : []
    const existingRelations = exists ? await directus.request('GET', `/relations/${name}`) : []
    for (const relation of relations) {
      const existingRelation = existingRelations.find(({ field }) => field === relation.field)
      if (existingRelation) {
        assertCollectionSnapshot(
          {
            name,
            meta,
            fields: [],
            relations: [relation],
            identity: { fields: [] },
            lifecycle,
            seedPolicy,
          },
          {
            collection: existingCollection,
            fields: [],
            relations: [existingRelation],
            records: [],
          },
          { validateLegacyAllowlist: false }
        )
        continue
      }

      const relationField = collectionFields.find(({ field }) => field === relation.field)
      const incompatibleLegacyFileField =
        relation.related_collection === 'directus_files' &&
        relationField?.schema?.data_type &&
        relationField.schema.data_type !== 'uuid'
      const legacyAllowed = CMS_LEGACY_FIELD_ALLOWLIST.some(
        (entry) => entry.collection === name && entry.field === relation.field
      )
      if (incompatibleLegacyFileField && legacyAllowed) {
        console.warn(
          `  keeping legacy path field ${name}.${relation.field} without a directus_files foreign key`
        )
        continue
      }
      if (incompatibleLegacyFileField) {
        throw new Error(
          `migration_required:relation_type collection=${name} field=${relation.field}`
        )
      }
      await directus.request('POST', '/relations', relation)
    }

    if (aliases.length) {
      const fieldsAfterRelations = new Set(
        (await directus.request('GET', `/fields/${name}`)).map(({ field }) => field)
      )
      for (const definition of aliases) {
        if (fieldsAfterRelations.has(definition.field)) continue
        const translations = fieldTranslations(name, definition.field)
        await directus.request('POST', `/fields/${name}`, {
          field: definition.field,
          type: 'alias',
          schema: null,
          meta: {
            ...definition.meta,
            ...(translations && { translations }),
          },
        })
      }
    }
  }

  return { createNavigationGroup, createCollection, ...seedRuntime }
}
