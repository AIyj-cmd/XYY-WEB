import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { BRAND_CLAIMS, isBrandClaimKey } from '@/lib/claims'
import { interpolateClaims } from '@/lib/directus-interpolation'
import { APPROVED_FAQ_SEEDS } from '../../scripts/data/approved-faq-seeds.mjs'
import { APPROVED_HOMEPAGE_STATS } from '../../scripts/data/approved-homepage-stats.mjs'
import { APPROVED_SERVICES } from '../../scripts/data/approved-services.mjs'
import { assertKnownClaimReferences } from '../../scripts/lib/claim-reference-validation.mjs'

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

describe('generated CMS claim references', () => {
  it('stores homepage facts as claimKey references without value or unit copies', () => {
    for (const stat of APPROVED_HOMEPAGE_STATS) {
      expect(isBrandClaimKey(stat.claimKey)).toBe(true)
      expect(stat).not.toHaveProperty('value')
      expect(stat).not.toHaveProperty('unit')
    }
  })

  it('generates only known FAQ and service placeholders', () => {
    expect(() =>
      assertKnownClaimReferences(
        { APPROVED_FAQ_SEEDS, APPROVED_SERVICES },
        {
          root: repositoryRoot,
          source: 'claims.test',
        }
      )
    ).not.toThrow()
  })

  it('fails generation validation for an unknown claim reference', () => {
    expect(() =>
      assertKnownClaimReferences(
        { answer: '{{unknownClaim}}' },
        {
          root: repositoryRoot,
          source: 'claims.test.fixture',
        }
      )
    ).toThrow(/unknown claimKey.*unknownClaim/i)
  })

  it('fully resolves every generated FAQ placeholder in its page scope', () => {
    for (const faq of APPROVED_FAQ_SEEDS) {
      const answer = interpolateClaims(faq.answer, {
        pageScope: faq.page_key,
        source: { collection: 'faqs', recordId: faq.sort, field: 'answer' },
      })
      expect(answer).not.toMatch(/\{\{[^}]+\}\}/)
    }
  })

  it('interpolates both confirmed accuracy claim tokens for public content', () => {
    const template = '{{inventoryAccuracy}}｜{{shippingAccuracy}}'
    expect(
      interpolateClaims(template, {
        pageScope: 'product',
        source: { collection: 'services', recordId: 'claims-regression', field: 'description' },
      })
    ).toBe(
      `${BRAND_CLAIMS.inventoryAccuracy.displayValue}｜${BRAND_CLAIMS.shippingAccuracy.displayValue}`
    )
  })
})
