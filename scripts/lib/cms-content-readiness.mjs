import { INITIAL_CONTENT, identityOf, isRecord } from './cms-content-snapshot.mjs'

const text = (value) => typeof value === 'string' && value.trim().length > 0
const texts = (value) => Array.isArray(value) && value.length > 0 && value.every(text)
const objects = (value, fields) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => isRecord(item) && fields.every((field) => text(item[field])))
const fileId = (value) =>
  typeof value === 'string' && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value)
const requiredText = {
  faq_pages: ['name'],
  services: ['name', 'subtitle', 'description'],
  warehouses: ['name', 'city', 'address'],
  cases: ['category', 'label', 'metrics', 'details', 'name', 'full_name', 'case_description'],
  faqs: ['question', 'answer'],
  publications: ['title', 'summary'],
  service_pages: [
    'title',
    'description',
    'breadcrumb_label',
    'h1',
    'hero_desc',
    'img_alt',
    'content_desc',
    'features_label',
  ],
  about_content: ['overview', 'hero_description'],
  about_history: ['year', 'subtitle', 'text'],
  about_honors: ['title'],
  site_settings: [
    'phone',
    'headquarters_label',
    'headquarters_address',
    'icp',
    'footer_description',
  ],
}
const imageAlternatives = {
  cases: [['img', 'image_file']],
  publications: [
    ['cover', 'cover_file'],
    ['pdf', 'pdf_file'],
  ],
  service_pages: [['img_src', 'hero_image']],
  about_history: [['img', 'image_file']],
  about_honors: [['image', 'image_file']],
}

function contentIssues(record, seed, definition) {
  const invalid = []
  if (record.status !== 'published') invalid.push(['status', 'not_published'])
  for (const field of requiredText[definition.name] || []) {
    if (!text(record[field])) invalid.push([field, 'missing_text'])
  }
  for (const [path, file] of imageAlternatives[definition.name] || []) {
    if (!text(record[path]) && !fileId(record[file]))
      invalid.push([`${path}|${file}`, 'missing_asset'])
  }
  const list = (field, valid) => {
    if (!valid) invalid.push([field, 'invalid_list'])
  }
  if (definition.name === 'homepage_content') {
    const expected = seed.stats.map(({ claimKey }) => claimKey)
    const actual = Array.isArray(record.stats) ? record.stats.map((item) => item?.claimKey) : []
    list(
      'stats',
      objects(record.stats, ['claimKey', 'label', 'detail']) &&
        new Set(actual).size === actual.length &&
        expected.every((key) => actual.includes(key)) &&
        actual.every((key) => expected.includes(key))
    )
  }
  if (definition.name === 'services') list('features', texts(record.features))
  if (definition.name === 'cases') {
    list('tags', texts(record.tags))
    list('stats', objects(record.stats, ['label', 'value']))
  }
  if (definition.name === 'service_pages') {
    list('stats', objects(record.stats, ['stat', 'label', 'sub']))
    list('features', objects(record.features, ['title', 'desc']))
  }
  return invalid
}

export function reportInitialContent(snapshot, { mode, before = snapshot } = {}) {
  const issues = []
  const collections = INITIAL_CONTENT.map((definition) => {
    const records = new Map(
      snapshot.get(definition.name).map((row) => [identityOf(row, definition), row])
    )
    const original = new Set(before.get(definition.name).map((row) => identityOf(row, definition)))
    const counts = {
      collection: definition.name,
      required: definition.seeds.length,
      created: 0,
      existing: 0,
      missing: 0,
    }
    for (const seed of definition.seeds) {
      const identity = identityOf(seed, definition)
      const record = records.get(identity)
      if (!record) {
        counts.missing++
        issues.push({
          collection: definition.name,
          identity,
          field: 'identity',
          reason: 'missing_record',
        })
        continue
      }
      if (original.has(identity)) counts.existing++
      if (mode === 'apply' && !original.has(identity)) counts.created++
      for (const [field, reason] of contentIssues(record, seed, definition)) {
        issues.push({ collection: definition.name, identity, field, reason })
      }
    }
    return counts
  })
  const totals = { required: 0, created: 0, existing: 0, missing: 0 }
  for (const row of collections) for (const key of Object.keys(totals)) totals[key] += row[key]
  return { mode, ready: issues.length === 0, totals, collections, issues }
}
