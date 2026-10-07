import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const repositoryRoot = process.cwd()
const history = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'docs/data/whitepaper-review-history.json'), 'utf8')
)

describe('whitepaper review history', () => {
  it('keeps all 235 frozen source records with explicit, crop-bound manual outcomes', () => {
    expect(history.entries).toHaveLength(235)
    expect(new Set(history.entries.map((entry: { id: string }) => entry.id)).size).toBe(235)

    for (const entry of history.entries) {
      expect(entry.id).toMatch(/^WP\d{2}-\d{3}$/)
      expect(createHash('sha256').update(entry.originalRecord).digest('hex')).toBe(
        entry.originalRecordSha256
      )
      expect(entry.locator.pdfPage).toBeGreaterThan(0)
      expect(entry.manualReview.status).toBeTruthy()
      expect(entry.manualReview.outcome).toBeTruthy()
      expect(entry.manualReview.evidence.crop).toMatch(/^evidence\/F\/crops\/wp\d{2}-review-/)
    }
  })

  it('uses the static history rather than deriving a treatment from review-note wording', () => {
    const audit = readFileSync(
      resolve(repositoryRoot, 'scripts/audit-whitepaper-review-ledger.mjs'),
      'utf8'
    )

    expect(audit).toContain('docs/data/whitepaper-review-history.json')
    expect(audit).toContain('entry.manualReview.status')
    expect(audit).not.toContain('const treatmentFor')
    expect(audit).not.toContain('/低清|不可.*OCR')
  })

  it('renders crops from frozen history so restored current JSON notes do not change coverage', () => {
    const renderer = readFileSync(
      resolve(repositoryRoot, 'scripts/render-whitepaper-review-crops.mjs'),
      'utf8'
    )

    expect(renderer).toContain('docs/data/whitepaper-review-history.json')
    expect(renderer).toContain('history.entries.length !== 235')
    expect(renderer).toContain('record.originalRecord')
    expect(renderer).not.toContain("block.type !== 'review-note'")
  })
})
