export function createCmsSeedRuntime(directus) {
  const singletonMetadataFields = new Set([
    'id',
    'status',
    'date_created',
    'date_updated',
    'user_created',
    'user_updated',
  ])

  const isEmptyValue = (value) =>
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      value !== null &&
      Object.keys(value).length === 0)

  const singletonError = (collection, expectedIdentity, actualIdentity, reason) =>
    new Error(
      `singleton_migration_required collection=${collection}` +
        `${reason ? ` reason=${reason}` : ''}` +
        `${expectedIdentity ? ` expected_identity=${JSON.stringify(expectedIdentity)}` : ''}` +
        `${actualIdentity ? ` actual_identity=${JSON.stringify(actualIdentity)}` : ''}`
    )

  const identitySignature = (item, identityFields, collection) => {
    const values = identityFields.map((field) => item[field])
    if (values.some((value) => value === undefined || value === null || value === '')) {
      throw new Error(`missing seed identity for ${collection}: ${identityFields.join(',')}`)
    }
    return JSON.stringify(values)
  }

  const assertUniqueIdentities = (items, identityFields, collection, source) => {
    const seen = new Set()
    for (const item of items) {
      const signature = identitySignature(item, identityFields, collection)
      if (seen.has(signature)) throw new Error(`duplicate ${source} identity in ${collection}`)
      seen.add(signature)
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
    if (!identityFields?.length) throw new Error(`missing identity contract for ${collection}`)
    assertUniqueIdentities(items, identityFields, collection, 'seed')
    if (options.singleton) {
      if (items.length !== 1) {
        throw singletonError(collection, null, null, 'invalid_seed_count')
      }
      const seedItem = items[0]
      const managedFields = Object.keys(seedItem).filter(
        (field) => !singletonMetadataFields.has(field) && !identityFields.includes(field)
      )
      const requestedFields = [
        ...new Set([...identityFields, ...managedFields, ...singletonMetadataFields]),
      ]
      const query = `?limit=-1&fields=${requestedFields.map(encodeURIComponent).join(',')}`
      const current = await directus.request('GET', `/items/${collection}${query}`)
      if (Array.isArray(current) && current.length > 1) {
        throw singletonError(collection, null, null, 'multiple_records')
      }
      const record = Array.isArray(current) ? current[0] : current
      if (record !== undefined && record !== null && typeof record !== 'object') {
        throw singletonError(collection, null, null, 'invalid_response')
      }

      const expectedIdentity = identityFields.map((field) => seedItem[field])
      const actualIdentity = identityFields.map((field) => record?.[field])
      const populatedIdentity = actualIdentity.some((value) => !isEmptyValue(value))
      if (
        populatedIdentity &&
        actualIdentity.some(
          (value, index) => !isEmptyValue(value) && typeof value !== typeof expectedIdentity[index]
        )
      ) {
        throw singletonError(collection, expectedIdentity, actualIdentity, 'invalid_identity')
      }
      if (
        populatedIdentity &&
        identityFields.every((_, index) => actualIdentity[index] === expectedIdentity[index])
      ) {
        return
      }
      if (populatedIdentity) {
        throw singletonError(collection, expectedIdentity, actualIdentity)
      }

      const hasManagedContent = managedFields.some((field) => !isEmptyValue(record?.[field]))
      if (hasManagedContent) {
        throw singletonError(collection, expectedIdentity, actualIdentity)
      }
      await seed(collection, items, options)
      return
    }

    const query = `?limit=-1&fields=${identityFields.map(encodeURIComponent).join(',')}`
    const current = await directus.request('GET', `/items/${collection}${query}`)
    const currentItems = Array.isArray(current)
      ? current
      : current && Object.keys(current).length
        ? [current]
        : []
    assertUniqueIdentities(currentItems, identityFields, collection, 'current')
    const missing = items.filter(
      (item) =>
        !currentItems.some((record) =>
          identityFields.every((field) => record[field] === item[field])
        )
    )
    await seed(collection, missing, options)
  }

  async function resolveFaqSeedRelations(items) {
    const pages = await directus.request('GET', '/items/faq_pages?limit=-1&fields=id,key')
    const pageByKey = new Map()
    for (const page of pages) {
      if (pageByKey.has(page.key)) throw new Error(`duplicate FAQ page key: ${page.key}`)
      pageByKey.set(page.key, page.id)
    }
    return items.map(({ faqPageKey, ...item }) => {
      const pageId = pageByKey.get(faqPageKey)
      if (pageId === undefined) throw new Error(`unknown FAQ page key: ${faqPageKey}`)
      return { ...item, faq_page: pageId }
    })
  }

  return { seed, seedMissing, resolveFaqSeedRelations }
}
