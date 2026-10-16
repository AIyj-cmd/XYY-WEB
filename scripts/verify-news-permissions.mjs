#!/usr/bin/env node

import { URL } from 'node:url'

import {
  buildNewsPermissionPreview,
  verifyNewsWriterPermissionPayload,
} from './lib/news-token-preflight.mjs'
import { assertOperationTarget } from './lib/remote-target-policy.mjs'

const suppliedTarget = process.argv.find((argument) => argument.startsWith('--target='))?.slice(9)
const check = process.argv.includes('--check')
if (!suppliedTarget) throw new Error('target_required_for_news_permission_preview')
const target = assertOperationTarget(suppliedTarget, 'news_permission_target')
if (!check)
  console.log(
    JSON.stringify({ target, mode: 'preview', permissions: buildNewsPermissionPreview() })
  )
if (check) {
  const token = String(process.env.DIRECTUS_NEWS_WRITE_TOKEN ?? '').trim()
  if (!token) throw new Error('writer_token_required_for_read_only_permission_check')
  const response = await fetch(new URL('/permissions/me', target), {
    headers: { Authorization: `Bearer ${token}` },
    redirect: 'error',
  })
  if (!response.ok) throw new Error(`news_permission_audit_http_${response.status}`)
  const result = verifyNewsWriterPermissionPayload(await response.json())
  console.log(
    JSON.stringify({ target, mode: 'read-only-check', writerPermissions: result.writerPermissions })
  )
}
