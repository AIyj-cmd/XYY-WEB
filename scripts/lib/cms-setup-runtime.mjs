export function createCmsSetupRuntime(directus) {
  const api = (method, path, body) =>
    directus.request(method, path, body, {
      allowStatuses: [409],
      unwrapData: false,
      warnOnly: true,
    })

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
   * }} definition
   */
  async function createCollection({ name, icon = 'database', meta = {}, fields = [] }) {
    console.log(`\n[collection] ${name}`)
    await api('POST', '/collections', {
      collection: name,
      schema: { name },
      meta: { icon, ...meta },
    })

    for (const definition of fields) {
      const { field, type, meta: fieldMeta = {}, schema = {} } = definition
      await api('POST', `/fields/${name}`, {
        field,
        type,
        schema,
        meta: { interface: 'input', display: 'raw', ...fieldMeta },
      })
    }
  }

  async function seed(collection, items) {
    console.log(`  seeding ${items.length} items into ${collection}...`)
    for (const item of items) {
      await api('POST', `/items/${collection}`, { status: 'published', ...item })
    }
  }

  return { createCollection, seed }
}
