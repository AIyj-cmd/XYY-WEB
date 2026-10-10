import { createCmsSeedRuntime } from './cms-seed-runtime.mjs'
import {
  INITIAL_CONTENT,
  contentError,
  identityOf,
  readContentCollection,
  readInitialContent,
  safeContentClient,
  validateSeedContracts,
} from './cms-content-snapshot.mjs'
import { reportInitialContent } from './cms-content-readiness.mjs'

export async function runCmsContentInitialization(directus, { mode = 'preview' } = {}) {
  if (!['preview', 'apply', 'check'].includes(mode))
    throw contentError('invalid_mode', 'initial_content')
  validateSeedContracts()
  const client = safeContentClient(directus)
  const before = await readInitialContent(client)
  if (mode !== 'apply') return reportInitialContent(before, { mode })

  const runtime = createCmsSeedRuntime(client)
  let pages = before.get('faq_pages')
  let writesAccepted = 0
  try {
    for (const definition of INITIAL_CONTENT) {
      // Recheck immediately before this collection's writes to protect intervening edits.
      const current = await readContentCollection(client, definition)
      before.set(definition.name, current)
      const identities = new Set(current.map((row) => identityOf(row, definition)))
      for (const seed of definition.seeds) {
        if (identities.has(identityOf(seed, definition))) continue
        let item = seed
        if (definition.name === 'faqs') {
          const { faqPageKey, ...fields } = seed
          const page = pages.find(({ key }) => key === faqPageKey)
          if (!page) throw contentError('missing_faq_page_after_write', 'faq_pages')
          item = { ...fields, faq_page: page.id }
        }
        await runtime.seed(definition.name, [item], {
          singleton: Boolean(definition.meta?.singleton),
        })
        writesAccepted++
      }
      if (definition.name === 'faq_pages') pages = await readContentCollection(client, definition)
    }
    const after = await readInitialContent(client)
    return reportInitialContent(after, { mode, before })
  } catch (error) {
    // API writes are not transactional; accepted requests are not proof of persisted content.
    error.writesAccepted = writesAccepted
    throw error
  }
}
