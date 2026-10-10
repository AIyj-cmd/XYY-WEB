import { CMS_COLLECTION_CONTRACTS } from '../data/cms-contract-definitions.mjs'
import { CMS_SEEDS } from '../data/cms-seed-config.mjs'

export const INITIAL_CONTENT = CMS_COLLECTION_CONTRACTS.filter(
  ({ name, lifecycle, seedPolicy }) =>
    lifecycle === 'active' && seedPolicy === 'normal' && CMS_SEEDS[name]?.length
).map((definition) => ({ ...definition, seeds: CMS_SEEDS[definition.name] }))

export class CmsContentError extends Error {}

export const contentError = (reason, collection, detail = '') =>
  new CmsContentError(`cms_content_${reason} collection=${collection}${detail ? ` ${detail}` : ''}`)
export const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
export const validId = (value) =>
  (typeof value === 'string' && value.trim().length > 0) ||
  (Number.isSafeInteger(value) && value > 0)
export const identityOf = (record, definition) =>
  JSON.stringify(definition.identity.fields.map((field) => record[field]))

const empty = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (isRecord(value) && Object.keys(value).length === 0)
const metadata = new Set([
  'id',
  'status',
  'date_created',
  'date_updated',
  'user_created',
  'user_updated',
])

function validateRows(rows, definition, source) {
  const identities = new Set()
  const ids = new Set()
  for (const row of rows) {
    if (!isRecord(row)) throw contentError('invalid_response', definition.name)
    for (const field of definition.identity.fields) {
      const value = row[field]
      const expected = definition.seeds[0][field]
      if (typeof value !== typeof expected || !validId(value)) {
        throw contentError(`invalid_${source}_identity`, definition.name)
      }
    }
    const identity = identityOf(row, definition)
    if (identities.has(identity))
      throw contentError(`duplicate_${source}_identity`, definition.name)
    identities.add(identity)
    if (source === 'current') {
      if (!validId(row.id)) throw contentError('missing_record_id', definition.name)
      if (ids.has(String(row.id))) throw contentError('duplicate_record_id', definition.name)
      ids.add(String(row.id))
    }
  }
  return rows
}

export function validateSeedContracts() {
  for (const definition of INITIAL_CONTENT) validateRows(definition.seeds, definition, 'seed')
  const pageKeys = new Set(CMS_SEEDS.faq_pages.map(({ key }) => key))
  for (const faq of CMS_SEEDS.faqs) {
    if (!pageKeys.has(faq.faqPageKey)) throw contentError('invalid_seed_faq_mapping', 'faqs')
  }
}

export function normalizeContentRows(value, definition) {
  if (!definition.meta?.singleton) {
    if (!Array.isArray(value)) throw contentError('invalid_response', definition.name)
    return validateRows(value, definition, 'current')
  }
  const rows = Array.isArray(value) ? value : value === null ? [] : [value]
  if (rows.length > 1) throw contentError('multiple_singleton_records', definition.name)
  if (!rows.length) return []
  const row = rows[0]
  if (!isRecord(row)) throw contentError('invalid_response', definition.name)
  if (!Object.hasOwn(row, 'id') || row.id === undefined) {
    throw contentError('missing_record_id', definition.name)
  }
  if (row.id === null) {
    const fields = definition.identity.fields
    const hasContent = Object.entries(row).some(
      ([field, value]) => !metadata.has(field) && !fields.includes(field) && !empty(value)
    )
    const unexpectedIdentity = fields.some(
      (field) => !empty(row[field]) && row[field] !== definition.seeds[0][field]
    )
    if (hasContent || unexpectedIdentity)
      throw contentError('unpersisted_singleton_content', definition.name)
    return []
  }
  validateRows(rows, definition, 'current')
  if (identityOf(row, definition) !== identityOf(definition.seeds[0], definition)) {
    throw contentError('unexpected_singleton_identity', definition.name)
  }
  return rows
}

export function safeContentClient(directus) {
  return {
    async request(method, path, body) {
      try {
        return await directus.request(method, path, body, { requireData: method === 'GET' })
      } catch (error) {
        const reason = ['invalid_json', 'invalid_envelope'].includes(error?.code)
          ? error.code
          : 'request_failed'
        const status =
          Number.isInteger(error?.status) && error.status >= 100 && error.status <= 599
            ? `status=${error.status}`
            : ''
        throw contentError(reason, path.match(/^\/items\/([a-z_]+)/)?.[1] || 'unknown', status)
      }
    },
  }
}

export async function readContentCollection(client, definition) {
  const value = await client.request('GET', `/items/${definition.name}?limit=-1&fields=*`)
  return normalizeContentRows(value, definition)
}

export async function readInitialContent(client) {
  const snapshot = new Map()
  for (const definition of INITIAL_CONTENT) {
    snapshot.set(definition.name, await readContentCollection(client, definition))
  }
  validateFaqMappings(snapshot)
  return snapshot
}

export function validateFaqMappings(snapshot) {
  const pageById = new Map(snapshot.get('faq_pages').map((page) => [String(page.id), page.key]))
  const seedPageByKey = new Map(CMS_SEEDS.faqs.map((faq) => [faq.content_key, faq.faqPageKey]))
  for (const faq of snapshot.get('faqs')) {
    const key = pageById.get(String(faq.faq_page))
    if (
      !validId(faq.faq_page) ||
      !key ||
      (seedPageByKey.has(faq.content_key) && seedPageByKey.get(faq.content_key) !== key)
    ) {
      const seed = CMS_SEEDS.faqs.find(({ content_key }) => content_key === faq.content_key)
      throw contentError(
        'invalid_faq_mapping',
        'faqs',
        `field=faq_page${seed ? ` identity=${JSON.stringify([seed.content_key])}` : ''}`
      )
    }
  }
}
