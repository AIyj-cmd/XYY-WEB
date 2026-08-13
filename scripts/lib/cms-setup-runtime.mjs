import { collectionTranslations, fieldTranslations } from '../data/cms-admin-translations.mjs'

export function createCmsSetupRuntime(directus) {
  async function createNavigationGroup({ name, icon = 'folder', meta = {} }) {
    const collections = await directus.request('GET', '/collections')
    const exists = collections.some((collection) => collection.collection === name)
    const translations = collectionTranslations(name)
    const collectionMeta = {
      icon,
      collapse: 'open',
      ...meta,
      ...(translations && { translations }),
    }
    if (!exists) {
      await directus.request('POST', '/collections', {
        collection: name,
        schema: null,
        meta: collectionMeta,
      })
      return
    }
    await directus.request('PATCH', `/collections/${name}`, { meta: collectionMeta })
  }

  /**
   * @param {{
   *   name: string,
   *   icon?: string,
   *   meta?: Record<string, unknown>,
   *   fields?: Array<{
   *     field: string,
   *     type: string,
   *     meta?: Record<string, unknown>,
   *     schema?: Record<string, unknown>
   *   }>
   *   aliases?: Array<{
   *     field: string,
   *     type: 'alias',
   *     meta?: Record<string, unknown>
   *   }>
   *   relations?: Array<{
   *     collection: string,
   *     field: string,
   *     related_collection: string,
   *     schema?: Record<string, unknown>,
   *     meta?: Record<string, unknown>
   *   }>
   * }} definition
   */
  async function createCollection({
    name,
    icon = 'database',
    meta = {},
    fields = [],
    relations = [],
    aliases = [],
  }) {
    console.log(`\n[collection] ${name}`)
    const collections = await directus.request('GET', '/collections')
    const exists = collections.some((collection) => collection.collection === name)
    const translations = collectionTranslations(name)
    if (!exists) {
      await directus.request('POST', '/collections', {
        collection: name,
        schema: { name },
        meta: { icon, ...meta, ...(translations && { translations }) },
      })
    } else {
      await directus.request('PATCH', `/collections/${name}`, {
        meta: { icon, ...meta, ...(translations && { translations }) },
      })
    }

    const existingFields = exists
      ? new Set((await directus.request('GET', `/fields/${name}`)).map(({ field }) => field))
      : new Set()

    for (const definition of fields) {
      const { field, type, meta: fieldMeta = {}, schema = {} } = definition
      const translations = fieldTranslations(name, field)
      if (existingFields.has(field)) {
        await directus.request('PATCH', `/fields/${name}/${field}`, {
          meta: { ...fieldMeta, ...(translations && { translations }) },
        })
        continue
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
      const relationExists = existingRelations.some(
        ({ field, related_collection: relatedCollection }) =>
          field === relation.field && relatedCollection === relation.related_collection
      )
      if (relationExists) continue

      const relationField = collectionFields.find(({ field }) => field === relation.field)
      const incompatibleLegacyFileField =
        relation.related_collection === 'directus_files' &&
        relationField?.schema?.data_type &&
        relationField.schema.data_type !== 'uuid'
      if (incompatibleLegacyFileField) {
        console.warn(
          `  keeping legacy path field ${name}.${relation.field} without a directus_files foreign key`
        )
        continue
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

  async function seed(collection, items, { singleton = false } = {}) {
    console.log(`  seeding ${items.length} items into ${collection}...`)
    if (singleton && items[0]) {
      await directus.request('PATCH', `/items/${collection}`, {
        status: 'published',
        ...items[0],
      })
      return
    }
    for (const item of items) {
      await directus.request('POST', `/items/${collection}`, { status: 'published', ...item })
    }
  }

  async function seedMissing(collection, items, identityFields, options = {}) {
    if (!items.length) return
    const identityQuery = identityFields.length
      ? `?limit=-1&fields=${identityFields.map(encodeURIComponent).join(',')}`
      : '?limit=-1'
    const current = await directus.request('GET', `/items/${collection}${identityQuery}`)
    const currentItems = Array.isArray(current)
      ? current
      : current && Object.keys(current).length
        ? [current]
        : []
    const missing = items.filter(
      (item) =>
        !currentItems.some((record) =>
          identityFields.every((field) => record[field] === item[field])
        )
    )
    await seed(collection, missing, options)
  }

  return { createNavigationGroup, createCollection, seed, seedMissing }
}
