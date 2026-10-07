import { Buffer } from 'node:buffer'

const minimumTokenBytes = 32

function tokenBytes(token) {
  return Buffer.byteLength(String(token ?? '').trim(), 'utf8')
}

export function buildNewsPermissionPreview() {
  return {
    writer: ['news:create'],
    content: ['news:read'],
    prohibitedWriterActions: ['news:read', 'news:update', 'news:delete'],
  }
}

export function preflightNewsTokens({ apiToken, writeToken, contentToken, writerPermissions }) {
  const tokens = [apiToken, writeToken, contentToken].map((token) => String(token ?? '').trim())
  const bytes = tokens.map(tokenBytes)
  if (bytes.some((size) => size < minimumTokenBytes))
    throw new Error('news_token_preflight:too_short')
  if (new Set(tokens).size !== tokens.length) throw new Error('news_token_preflight:not_distinct')
  const expected = buildNewsPermissionPreview().writer
  if (!Array.isArray(writerPermissions) || writerPermissions.length !== expected.length) {
    throw new Error('news_token_preflight:writer_permissions')
  }
  if (writerPermissions[0] !== expected[0])
    throw new Error('news_token_preflight:writer_permissions')
  return { tokenBytes: bytes, writerPermissions: [...expected] }
}

export function verifyNewsWriterPermissionPayload(payload) {
  const permissions = payload?.data
  const create = permissions?.news?.create
  const allowedFields = new Set(create?.fields ?? [])
  const requiredFields = [
    'title',
    'slug',
    'category',
    'summary',
    'content',
    'published_at',
    'status',
    'cover_image',
  ]
  if (!['full', 'partial'].includes(create?.access)) throw new Error('news_permission_audit:create')
  if (
    requiredFields.some(
      (field) => !allowedFields.has(field) || allowedFields.size !== requiredFields.length
    )
  ) {
    throw new Error('news_permission_audit:create_fields')
  }
  for (const [collection, actions] of Object.entries(permissions ?? {})) {
    for (const [action, value] of Object.entries(actions ?? {})) {
      if (collection !== 'news' || action !== 'create') {
        if (value?.access && value.access !== 'none')
          throw new Error('news_permission_audit:excess')
      }
    }
  }
  return { writerPermissions: ['news:create'], requiredFields }
}
