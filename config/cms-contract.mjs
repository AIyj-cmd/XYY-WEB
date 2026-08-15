export const CMS_SCHEMA_VERSION = '2026-08-phase3'

const policies = {
  homepage_stats: { lifecycle: 'legacy', identity: ['metric_key'], seedPolicy: 'migration_only' },
  homepage_content: { lifecycle: 'active', identity: ['key'], seedPolicy: 'normal' },
  faq_pages: { lifecycle: 'active', identity: ['key'], seedPolicy: 'normal' },
  services: { lifecycle: 'active', identity: ['slug'], seedPolicy: 'normal' },
  warehouses: { lifecycle: 'active', identity: ['content_key'], seedPolicy: 'normal' },
  cases: { lifecycle: 'active', identity: ['slug'], seedPolicy: 'normal' },
  news: { lifecycle: 'active', identity: ['slug'], seedPolicy: 'normal' },
  faqs: { lifecycle: 'active', identity: ['content_key'], seedPolicy: 'normal' },
  case_details: { lifecycle: 'legacy', identity: ['slug'], seedPolicy: 'migration_only' },
  case_stats: { lifecycle: 'legacy', identity: ['metric_key'], seedPolicy: 'migration_only' },
  publications: { lifecycle: 'active', identity: ['issue'], seedPolicy: 'normal' },
  service_pages: { lifecycle: 'active', identity: ['slug'], seedPolicy: 'normal' },
  service_stats: { lifecycle: 'legacy', identity: ['metric_key'], seedPolicy: 'migration_only' },
  service_features: {
    lifecycle: 'legacy',
    identity: ['content_key'],
    seedPolicy: 'migration_only',
  },
  about_content: { lifecycle: 'active', identity: ['key'], seedPolicy: 'normal' },
  about_history: { lifecycle: 'active', identity: ['content_key'], seedPolicy: 'normal' },
  about_honors: { lifecycle: 'active', identity: ['content_key'], seedPolicy: 'normal' },
  site_settings: { lifecycle: 'active', identity: ['key'], seedPolicy: 'normal' },
  contact_leads: { lifecycle: 'private', identity: ['id'], seedPolicy: 'never' },
}

export const CMS_COLLECTION_CONTRACTS = Object.entries(policies).map(([name, policy]) => ({
  name,
  lifecycle: policy.lifecycle,
  identity: { fields: [...policy.identity] },
  seedPolicy: policy.seedPolicy,
}))

export const CMS_CONTRACT_BY_COLLECTION = Object.fromEntries(
  CMS_COLLECTION_CONTRACTS.map((contract) => [contract.name, contract])
)

export function bindCmsCollectionDefinitions(definitions) {
  const definitionByName = new Map(definitions.map((definition) => [definition.name, definition]))
  const missingDefinitions = CMS_COLLECTION_CONTRACTS.filter(
    ({ name }) => !definitionByName.has(name)
  ).map(({ name }) => name)
  const unknownDefinitions = definitions
    .filter(({ name }) => !CMS_CONTRACT_BY_COLLECTION[name])
    .map(({ name }) => name)
  if (missingDefinitions.length || unknownDefinitions.length) {
    throw new Error(
      `CMS contract mismatch: missing=${missingDefinitions.join(',') || 'none'} unknown=${unknownDefinitions.join(',') || 'none'}`
    )
  }
  return CMS_COLLECTION_CONTRACTS.map((contract) => ({
    ...definitionByName.get(contract.name),
    ...contract,
    identity: { fields: [...contract.identity.fields] },
  }))
}

export const CMS_LEGACY_FIELD_ALLOWLIST = [
  {
    collection: 'cases',
    field: 'image_file',
    reason: '部分旧环境仍将案例封面保存为静态字符串路径。',
    removeWhen: '真实 CMS 案例封面完成 UUID 迁移并通过迁移后 verify。',
  },
  {
    collection: 'news',
    field: 'cover_image',
    reason: '部分旧环境仍将文章封面保存为静态字符串路径。',
    removeWhen: '真实 CMS 文章封面完成 UUID 迁移并通过迁移后 verify。',
  },
  {
    collection: 'publications',
    field: 'cover_file',
    reason: '部分旧环境仍将封面保存为静态字符串路径。',
    removeWhen: '真实 CMS 文件字段完成 UUID 迁移并通过迁移后 verify。',
  },
  {
    collection: 'publications',
    field: 'pdf_file',
    reason: '部分旧环境仍将 PDF 保存为静态字符串路径。',
    removeWhen: '真实 CMS 文件字段完成 UUID 迁移并通过迁移后 verify。',
  },
  {
    collection: 'service_pages',
    field: 'hero_image',
    reason: '部分旧环境仍将服务页图片保存为静态字符串路径。',
    removeWhen: '真实 CMS 服务页图片完成 UUID 迁移并通过迁移后 verify。',
  },
  {
    collection: 'about_history',
    field: 'image_file',
    reason: '部分旧环境仍将历程图片保存为静态字符串路径。',
    removeWhen: '真实 CMS 历程图片完成 UUID 迁移并通过迁移后 verify。',
  },
  {
    collection: 'about_honors',
    field: 'image_file',
    reason: '部分旧环境仍将荣誉图片保存为静态字符串路径。',
    removeWhen: '真实 CMS 荣誉图片完成 UUID 迁移并通过迁移后 verify。',
  },
]
