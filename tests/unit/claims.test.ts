import { readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { BRAND_CLAIMS, CLAIM_TEXT, isBrandClaimKey, validateClaimRegistry } from '@/lib/claims'
import { interpolateClaims } from '@/lib/directus-interpolation'
import { APPROVED_FAQ_SEEDS } from '../../scripts/data/approved-faq-seeds.mjs'
import { APPROVED_HOMEPAGE_STATS } from '../../scripts/data/approved-homepage-stats.mjs'
import { APPROVED_SERVICES } from '../../scripts/data/approved-services.mjs'
import { assertKnownClaimReferences } from '../../scripts/lib/claim-reference-validation.mjs'

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))
const claimRoot = join(repositoryRoot, 'src', 'lib', 'claims')
const scannedRoots = [
  join(repositoryRoot, 'src'),
  join(repositoryRoot, 'scripts'),
  join(repositoryRoot, 'tests'),
]
const allowedExtensions = new Set(['.astro', '.ts', '.tsx', '.mjs', '.json'])
const explicitLiteralAllowlist = new Set([
  relative(repositoryRoot, join(claimRoot, 'fulfillment-scale.ts')),
  relative(repositoryRoot, join(claimRoot, 'fulfillment-performance.ts')),
  relative(repositoryRoot, join(claimRoot, 'quality.ts')),
  'src/scripts/home-capability-motion.ts',
])

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (['archive', 'dist', 'build', 'node_modules', 'backups'].includes(entry.name)) return []
      return sourceFiles(path)
    }
    return allowedExtensions.has(extname(entry.name)) ? [path] : []
  })
}

describe('public business claim registry', () => {
  it('validates every reviewed claim and canonical key exactly once', () => {
    expect(() => validateClaimRegistry(BRAND_CLAIMS)).not.toThrow()
    expect(new Set(Object.values(BRAND_CLAIMS).map((claim) => claim.claimKey)).size).toBe(
      Object.keys(BRAND_CLAIMS).length
    )
  })

  it('keeps the compatibility text export limited to globally allowed claims', () => {
    const globalKeys = Object.entries(BRAND_CLAIMS)
      .filter(([, claim]) => claim.allowedPages.includes('*'))
      .map(([key]) => key)
      .sort()
    expect(Object.keys(CLAIM_TEXT).sort()).toEqual(globalKeys)
  })

  it('keeps approved operational literals out of pages, seeds and ordinary tests', () => {
    const reviewedValues = [
      ...new Set(Object.values(BRAND_CLAIMS).map((claim) => claim.displayValue)),
    ]
    const violations = scannedRoots
      .flatMap(sourceFiles)
      .filter((path) => !explicitLiteralAllowlist.has(relative(repositoryRoot, path)))
      .flatMap((path) => {
        const source = readFileSync(path, 'utf8')
        return reviewedValues
          .filter((value) => source.includes(value))
          .map((value) => `${relative(repositoryRoot, path)} => ${value}`)
      })

    expect(violations).toEqual([])
  })
})

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
})
