#!/usr/bin/env node
import { createDirectusAdminClient } from './lib/directus-admin.mjs'
import { runCmsContentInitialization } from './lib/cms-content-runtime.mjs'
import { CmsContentError } from './lib/cms-content-snapshot.mjs'
import { contentCredentials, parseCmsContentOptions } from './lib/cms-content-options.mjs'

try {
  const options = parseCmsContentOptions(process.argv.slice(2))
  if (options.help) {
    console.log(`Usage: node scripts/init-cms-content.mjs [--apply | --check | --help]
Default: GET-only preview of missing approved initial content.
--apply: explicitly create missing initial content, then read back and verify readiness.
--check: GET-only initial-content readiness check; incomplete content exits nonzero.
Requires explicit DIRECTUS_URL and DIRECTUS_TOKEN; does not load .env files.
Existing records, drafts, and empty fields are preserved. No schema or permission changes.
Writes are not transactional. Retry only after reviewing a partial failure.`)
  } else {
    const client = createDirectusAdminClient(contentCredentials(process.env))
    const report = await runCmsContentInitialization(client, options)
    console.log(JSON.stringify(report, null, 2))
    if (options.mode !== 'preview' && !report.ready) process.exitCode = 1
  }
} catch (error) {
  console.error(error instanceof CmsContentError ? error.message : 'cms_content_failed')
  if (Number.isInteger(error.writesAccepted)) {
    console.error(
      `writes_accepted=${error.writesAccepted}; readback_not_verified; partial_changes_may_exist`
    )
  }
  process.exitCode = 1
}
