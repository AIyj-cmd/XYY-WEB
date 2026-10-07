import { describe, expect, it } from 'vitest'

import { buildCmsContractMigrationPlan } from '../../scripts/lib/cms-contract-migration.mjs'

describe('legacy CMS migration scope', () => {
  it('never plans retained legacy stable identities or manual mappings', () => {
    const result = buildCmsContractMigrationPlan({
      homepage_stats: [{ id: 1 }],
      case_stats: [{ id: 2 }],
      service_stats: [{ id: 3 }],
      service_features: [{ id: 4 }],
    })
    expect(result.changes).toEqual([])
    expect(result.issues.join('\n')).not.toMatch(
      /homepage_stats|case_stats|service_stats|service_features/
    )
  })
})
