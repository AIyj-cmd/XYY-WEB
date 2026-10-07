const recordsFor = (snapshot, collection) =>
  snapshot.records?.[collection] ?? snapshot[collection] ?? []
const relationId = (value) => (typeof value === 'object' && value ? value.id : value)

export function buildFaqPageKeyMigrationPlan(snapshot) {
  const pagesById = new Map()
  const pagesByKey = new Map()
  const changes = []
  const issues = []

  for (const page of recordsFor(snapshot, 'faq_pages')) {
    if (pagesById.has(String(page.id)) || pagesByKey.has(page.key)) {
      issues.push(
        `manual_mapping_required collection=faq_pages id=${String(page.id)} reason=duplicate_identity`
      )
      continue
    }
    pagesById.set(String(page.id), page)
    pagesByKey.set(page.key, page)
  }

  for (const faq of recordsFor(snapshot, 'faqs')) {
    const currentRelation = relationId(faq.faq_page)
    const relatedPage =
      currentRelation === undefined || currentRelation === null
        ? undefined
        : pagesById.get(String(currentRelation))
    const legacyPage = faq.page_key ? pagesByKey.get(faq.page_key) : undefined
    if (currentRelation !== undefined && currentRelation !== null && !relatedPage) {
      issues.push(
        `manual_mapping_required collection=faqs id=${String(faq.id)} reason=dangling_faq_page`
      )
      continue
    }
    if (!relatedPage && !legacyPage) {
      issues.push(
        `manual_mapping_required collection=faqs id=${String(faq.id)} reason=missing_faq_page_mapping`
      )
      continue
    }
    const authoritativePage = relatedPage ?? legacyPage
    const patch = {}
    if (!relatedPage) patch.faq_page = authoritativePage.id
    if (faq.page_key !== authoritativePage.key) patch.page_key = authoritativePage.key
    if (Object.keys(patch).length) changes.push({ collection: 'faqs', id: faq.id, patch })
  }

  return { changes, issues }
}

export async function readFaqPageKeyMigrationSnapshot(directus) {
  const [faqPages, faqs] = await Promise.all([
    directus.request('GET', '/items/faq_pages?limit=-1&fields=id,key'),
    directus.request('GET', '/items/faqs?limit=-1&fields=id,faq_page,page_key'),
  ])
  return {
    records: {
      faq_pages: Array.isArray(faqPages) ? faqPages : faqPages ? [faqPages] : [],
      faqs: Array.isArray(faqs) ? faqs : faqs ? [faqs] : [],
    },
  }
}

export async function applyFaqPageKeyMigrationPlan(directus, plan, { apply = false } = {}) {
  if (plan.issues.length) throw new Error(plan.issues.join('\n'))
  if (!apply) return { applied: 0 }
  for (const change of plan.changes) {
    await directus.request('PATCH', `/items/faqs/${change.id}`, change.patch)
  }
  return { applied: plan.changes.length }
}
