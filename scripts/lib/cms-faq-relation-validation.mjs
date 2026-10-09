const relationId = (value) => (typeof value === 'object' && value ? value.id : value)

export function validateFaqRelationTargets(contract, snapshot, errors) {
  if (contract.name !== 'faqs' || !(snapshot.records ?? []).length) return
  const targets = snapshot.relatedRecords?.faq_pages
  if (!Array.isArray(targets)) {
    errors.push('migration_required:relation_target_inventory collection=faqs field=faq_page')
    return
  }
  const targetIds = new Set(targets.map((record) => String(record.id)))
  for (const record of snapshot.records ?? []) {
    const value = relationId(record.faq_page)
    if (value === undefined || value === null || value === '') {
      errors.push(
        `migration_required:relation_missing collection=faqs id=${String(record.id)} field=faq_page`
      )
    } else if (!targetIds.has(String(value))) {
      errors.push(
        `migration_required:relation_target_missing collection=faqs id=${String(record.id)} field=faq_page target=${String(value)}`
      )
    }
  }
}
