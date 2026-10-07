import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const expectedReviewNotes = 235
const historyPath = resolve(repositoryRoot, 'docs/data/whitepaper-review-history.json')

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const parseOutputDirectory = () => {
  const outputIndex = process.argv.indexOf('--output-dir')
  if (outputIndex === -1) return null
  const outputDirectory = process.argv[outputIndex + 1]
  if (!outputDirectory || outputDirectory.startsWith('-')) {
    throw new Error('Expected a directory after --output-dir')
  }
  return resolve(process.cwd(), outputDirectory)
}

const history = JSON.parse(readFileSync(historyPath, 'utf8'))
if (history.entries.length !== expectedReviewNotes) {
  throw new Error(
    `Expected ${expectedReviewNotes} frozen history entries, found ${history.entries.length}`
  )
}
const ids = new Set()
const entries = history.entries.map((entry) => {
  if (!entry.id || ids.has(entry.id))
    throw new Error(`Invalid or duplicate history ID: ${entry.id}`)
  ids.add(entry.id)
  if (sha256(entry.originalRecord) !== entry.originalRecordSha256) {
    throw new Error(`${entry.id}: frozen originalRecord SHA-256 mismatch`)
  }
  if (
    !entry.manualReview?.status ||
    !entry.manualReview?.outcome ||
    !entry.manualReview?.evidence?.crop
  ) {
    throw new Error(`${entry.id}: missing explicit manual review result or crop evidence`)
  }
  const currentPdfHash = sha256(readFileSync(resolve(repositoryRoot, entry.source.pdfPath)))
  if (currentPdfHash !== entry.pdfSha256) throw new Error(`${entry.id}: original PDF hash changed`)
  return entry
})
const issueIds = [...new Set(entries.map((entry) => entry.issue))].sort(
  (a, b) => Number(a) - Number(b)
)
const issueCounts = Object.fromEntries(
  issueIds.map((issue) => [issue, entries.filter((entry) => entry.issue === issue).length])
)
const currentReviewNotes = Object.fromEntries(
  issueIds.map((issue) => {
    const article = JSON.parse(
      readFileSync(resolve(repositoryRoot, `src/data/whitepapers/${issue}.json`), 'utf8')
    )
    const count = article.sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.type === 'review-note').length
    return [issue, count]
  })
)
const statusCounts = Object.fromEntries(
  [...new Set(entries.map((entry) => entry.manualReview.status))]
    .sort()
    .map((status) => [
      status,
      entries.filter((entry) => entry.manualReview.status === status).length,
    ])
)

const report = {
  generatedBy: 'scripts/audit-whitepaper-review-ledger.mjs',
  sourceOfTruth: {
    ledger: 'docs/whitepapers-manual-review.md',
    frozenHistory: 'docs/data/whitepaper-review-history.json',
    currentRecords: 'src/data/whitepapers/{1..14}.json review-note blocks',
    originalPdfs: 'public/senlinqikan/pdf/{1..14}.pdf',
  },
  expectedReviewNotes,
  issueCounts,
  currentReviewNotes,
  statusCounts,
  visualReviewEvidence: {
    cropManifest: 'evidence/F/crops/whitepaper-review-crops.json',
    contactSheets: 'evidence/F/contact-sheets/wp{01..14}-review-contact.jpg',
    method:
      'Each frozen history entry has one exact original-PDF crop. This audit reads the explicit persistent result; it does not infer treatment from note wording or current JSON count.',
  },
  entries,
}

const outputDirectory = parseOutputDirectory()
if (outputDirectory) {
  mkdirSync(outputDirectory, { recursive: true })
  writeFileSync(
    resolve(outputDirectory, 'whitepaper-review-ledger.json'),
    `${JSON.stringify(report, null, 2)}\n`
  )
  const markdown = [
    '# 白皮书 review-note 逐项台账',
    '',
    `本文件由 \`scripts/audit-whitepaper-review-ledger.mjs\` 生成，共 ${entries.length} 条冻结历史记录。每条均可回查原记录、原 PDF SHA-256、source locator 与独立裁切证据；当前 JSON review-note 数量不作为历史覆盖数。`,
    '',
    `状态汇总：${Object.entries(statusCounts)
      .map(([status, count]) => `${status}=${count}`)
      .join('；')}。`,
    '',
    '| ID | 期号 | 章节 | 页 / side / bbox | 人工处理状态 | 原记录 SHA-256 |',
    '| --- | ---: | --- | --- | --- | --- |',
    ...entries.map((entry) => {
      const { locator } = entry
      const bbox = locator.bbox ? `[${locator.bbox.join(', ')}]` : '无 bbox'
      return `| ${entry.id} | ${entry.issue} | ${entry.sectionTitle} | ${locator.pdfPage} / ${locator.side} / ${bbox} | ${entry.manualReview.status} | ${entry.originalRecordSha256} |`
    }),
    '',
  ]
  writeFileSync(resolve(outputDirectory, 'whitepaper-review-ledger.md'), markdown.join('\n'))
}

process.stdout.write(
  `${JSON.stringify({ expectedReviewNotes, frozenHistoryEntries: entries.length, issueCounts, currentReviewNotes, statusCounts, outputDirectory }, null, 2)}\n`
)
