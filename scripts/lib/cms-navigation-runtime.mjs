import { collectionTranslations } from '../data/cms-admin-translations.mjs'

const includesMetadata = (actual = {}, expected = {}) =>
  Object.entries(expected).every(([key, value]) => {
    const current = actual?.[key]
    if (value && typeof value === 'object') {
      return JSON.stringify(current) === JSON.stringify(value)
    }
    return current === value
  })

export const metadataIncludes = includesMetadata

export function createCmsNavigationRuntime(directus) {
  return async function createNavigationGroup({ name, icon = 'folder', meta = {} }) {
    const collections = await directus.request('GET', '/collections')
    const existing = collections.find((collection) => collection.collection === name)
    const translations = collectionTranslations(name)
    const collectionMeta = {
      icon,
      collapse: 'open',
      ...meta,
      ...(translations && { translations }),
    }
    if (!existing) {
      await directus.request('POST', '/collections', {
        collection: name,
        schema: null,
        meta: collectionMeta,
      })
      return
    }
    if (!metadataIncludes(existing.meta, collectionMeta)) {
      await directus.request('PATCH', `/collections/${name}`, { meta: collectionMeta })
    }
  }
}
