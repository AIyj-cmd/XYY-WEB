import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { BRAND_CLAIMS, CLAIM_TEXT, validateClaimRegistry } from '@/lib/claims'
import {
  claimLiteralViolations,
  hasTraceableBlockSource,
  isLocalWhitepaperFigure,
  type HistoricalWhitepaper,
} from '../helpers/whitepaper-claim-source'
import { WHITEPAPER_SOURCE_LAYOUTS } from '../helpers/whitepaper-source-pages'

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
const whitepaperDataDirectory = join(repositoryRoot, 'src', 'data', 'whitepapers')

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

  it('records the confirmed accuracy values with raw, display, unit and provenance fields', () => {
    for (const key of ['inventoryAccuracy', 'shippingAccuracy'] as const) {
      const claim = BRAND_CLAIMS[key]
      expect(claim).toMatchObject({
        rawValue: 100,
        unit: '%',
        sourceType: 'user_confirmation',
        sourceReference: '用户于2026-09-21确认。',
        verifiedBy: '用户',
        verifiedAt: '2026-09-21',
        periodStart: null,
        periodEnd: null,
      })
      expect(claim.displayValue).toBe(`${claim.rawValue}${claim.unit}`)
    }
  })

  it('keeps approved operational literals out of pages, seeds and ordinary tests', () => {
    const reviewedValues = [
      ...new Set(Object.values(BRAND_CLAIMS).map((claim) => claim.displayValue)),
    ]
    const violations = scannedRoots
      .flatMap(sourceFiles)
      .filter((path) => !explicitLiteralAllowlist.has(relative(repositoryRoot, path)))
      .flatMap((path) =>
        claimLiteralViolations(path, readFileSync(path, 'utf8'), reviewedValues, repositoryRoot)
      )

    expect(violations).toEqual([])
  })

  it('limits historical literal handling to verified whitepaper body and local figure fields', () => {
    const historicalClaim = ['99', '.99', '%'].join('')
    const path = join(whitepaperDataDirectory, '14.json')
    const article = JSON.parse(readFileSync(path, 'utf8')) as HistoricalWhitepaper
    const layout = WHITEPAPER_SOURCE_LAYOUTS[article.issue]!
    const traceableSource = article.sections
      .flatMap((section) => section.blocks)
      .find((block) => block.type === 'paragraph' && hasTraceableBlockSource(block, layout))?.source
    expect(traceableSource).toBeDefined()
    article.sections[0].blocks.push({
      type: 'paragraph',
      text: historicalClaim,
      source: traceableSource,
    })
    expect(
      claimLiteralViolations(path, JSON.stringify(article), [historicalClaim], repositoryRoot)
    ).toEqual([])

    delete article.sections[0].blocks.at(-1)?.source
    expect(
      claimLiteralViolations(path, JSON.stringify(article), [historicalClaim], repositoryRoot)
    ).toHaveLength(1)
    article.sections[0].blocks.at(-1)!.source = traceableSource

    const localFigure = article.sections
      .flatMap((section) => section.blocks)
      .find(
        (block) =>
          block.type === 'figure' &&
          hasTraceableBlockSource(block, layout) &&
          isLocalWhitepaperFigure(block, article.issue, repositoryRoot)
      )
    expect(localFigure).toBeDefined()
    article.sections[0].blocks.push({
      type: 'figure',
      alt: historicalClaim,
      caption: historicalClaim,
      src: localFigure!.src,
      source: localFigure!.source,
    })
    expect(
      claimLiteralViolations(path, JSON.stringify(article), [historicalClaim], repositoryRoot)
    ).toEqual([])
    article.sections[0].blocks.at(-1)!.src = '/images/supply-chain-whitepapers/14/missing.png'
    expect(
      claimLiteralViolations(path, JSON.stringify(article), [historicalClaim], repositoryRoot)
    ).toHaveLength(1)
    article.sections[0].blocks.at(-1)!.src =
      '/images/supply-chain-whitepapers/14/../13/source-context-01.png'
    expect(
      claimLiteralViolations(path, JSON.stringify(article), [historicalClaim], repositoryRoot)
    ).toHaveLength(1)
    article.sections[0].blocks.pop()

    article.sourceSha256 = '0'.repeat(64)
    expect(
      claimLiteralViolations(path, JSON.stringify(article), [historicalClaim], repositoryRoot)
    ).toHaveLength(1)

    article.sourceSha256 = createHash('sha256')
      .update(readFileSync(join(repositoryRoot, 'public', 'senlinqikan', 'pdf', '14.pdf')))
      .digest('hex')
    article.sourcePdf = ''
    expect(
      claimLiteralViolations(path, JSON.stringify(article), [historicalClaim], repositoryRoot)
    ).toHaveLength(1)

    article.sourcePdf = '/senlinqikan/pdf/14.pdf'
    article.title = historicalClaim
    expect(
      claimLiteralViolations(path, JSON.stringify(article), [historicalClaim], repositoryRoot)
    ).toHaveLength(1)
  })

  it('excludes CSS and SVG percentage syntax while retaining business-literal protection', () => {
    const percentage = BRAND_CLAIMS.inventoryAccuracy.displayValue
    const path = join(repositoryRoot, 'tests', 'fixtures', 'claim-literal-scan.astro')

    expect(
      claimLiteralViolations(
        path,
        `<style>.metric { width: ${percentage}; }</style><svg width="${percentage}"></svg>`,
        [percentage],
        repositoryRoot
      )
    ).toEqual([])
    expect(
      claimLiteralViolations(path, `<p>${percentage}</p>`, [percentage], repositoryRoot)
    ).toEqual([`tests/fixtures/claim-literal-scan.astro => ${percentage}`])
    expect(
      claimLiteralViolations(
        path,
        `getComputedStyle(node)\nconst copy = '<p>${percentage}</p>'`,
        [percentage],
        repositoryRoot
      )
    ).toEqual([`tests/fixtures/claim-literal-scan.astro => ${percentage}`])
  })
})
