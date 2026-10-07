import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { SERVICE_PAGE_SLUGS } from '../data/service-page-slugs.mjs'
import { parseVariable } from './source-seed-extractor.mjs'

export function loadRawServicePageConfig(root) {
  return Object.fromEntries(
    SERVICE_PAGE_SLUGS.map((slug) => [
      slug,
      parseVariable(
        readFileSync(resolve(root, `src/data/service-pages/${slug}.ts`), 'utf8'),
        `service-pages/${slug}.ts`,
        'RAW_SERVICE_PAGE_CONFIG'
      ),
    ])
  )
}
