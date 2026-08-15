import { APPROVED_HOMEPAGE_STATS } from '../data/approved-homepage-stats.mjs'
import { createCmsMigrationValueHash } from './cms-migration-preconditions.mjs'

function matchesExpectedBefore(record, expectedBefore) {
  return Object.entries(expectedBefore).every(([field, value]) => record[field] === value)
}

const homepageClaimByLegacyId = new Map(
  APPROVED_HOMEPAGE_STATS.map(({ id, claimKey, label, detail }) => [
    id,
    { targetStableKey: claimKey, expectedBefore: { label, detail } },
  ])
)

export function planHomepageClaims(records, mappings, changes, issues) {
  for (const record of records) {
    if (!Array.isArray(record.stats) || record.stats.every((stat) => stat.claimKey)) continue
    const reviewed = mappings.homepage_content?.[String(record.id)]
    if (reviewed?.stats) {
      if (
        createCmsMigrationValueHash(record.stats) !== reviewed.expectedStatsBeforeSha256 ||
        !Array.isArray(reviewed.stats)
      ) {
        issues.push(
          `manual_mapping_required collection=homepage_content id=${record.id} reason=expected_before_mismatch`
        )
        continue
      }
      const reviewedByHash = new Map(
        reviewed.stats.map((item) => [item.sourceItemSha256, item.targetStableKey])
      )
      const usedHashes = new Set()
      let valid = true
      const stats = record.stats.map((stat) => {
        if (stat.claimKey) return stat
        const sourceHash = createCmsMigrationValueHash(stat)
        const targetStableKey = reviewedByHash.get(sourceHash)
        if (!targetStableKey || usedHashes.has(sourceHash)) {
          valid = false
          return stat
        }
        usedHashes.add(sourceHash)
        return { ...stat, claimKey: targetStableKey }
      })
      if (!valid || usedHashes.size !== reviewed.stats.length) {
        issues.push(
          `manual_mapping_required collection=homepage_content id=${record.id} reason=reviewed_stats_mismatch`
        )
        continue
      }
      changes.push({ collection: 'homepage_content', id: record.id, patch: { stats } })
      continue
    }
    let changed = false
    const stats = record.stats.map((stat) => {
      if (stat.claimKey) return stat
      if (stat.id === undefined || stat.id === null) {
        issues.push(
          `manual_mapping_required collection=homepage_content id=${record.id} stat=missing reason=stable_id_required`
        )
        return stat
      }
      const entry = homepageClaimByLegacyId.get(Number(stat.id))
      if (!entry || !matchesExpectedBefore(stat, entry.expectedBefore)) {
        issues.push(
          `manual_mapping_required collection=homepage_content id=${record.id} stat=${String(stat.id)} reason=expected_before_mismatch`
        )
        return stat
      }
      changed = true
      return { ...stat, claimKey: entry.targetStableKey }
    })
    if (changed) changes.push({ collection: 'homepage_content', id: record.id, patch: { stats } })
  }
}
