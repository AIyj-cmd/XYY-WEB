import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const historyPath = resolve(repositoryRoot, 'docs/data/whitepaper-review-history.json')
const outputFlag = process.argv.indexOf('--output-dir')
if (outputFlag === -1 || !process.argv[outputFlag + 1]) {
  throw new Error('Usage: node scripts/render-whitepaper-review-crops.mjs --output-dir <directory>')
}

const outputDirectory = resolve(process.cwd(), process.argv[outputFlag + 1])
const sha256 = (value) => createHash('sha256').update(value).digest('hex')
mkdirSync(outputDirectory, { recursive: true })
const history = JSON.parse(readFileSync(historyPath, 'utf8'))
if (history.entries.length !== 235) {
  throw new Error(`Expected 235 frozen history records, got ${history.entries.length}`)
}
const entries = history.entries.map((record) => {
  const issueNumber = Number(record.issue)
  const issue = record.issue
  const pdfPath = resolve(repositoryRoot, record.source.pdfPath)
  const sourcePdfSha256 = sha256(readFileSync(pdfPath))
  if (sourcePdfSha256 !== record.pdfSha256) {
    throw new Error(`${record.id}: original PDF hash changed`)
  }
  const source = record.locator
  const earlyIssue = issueNumber <= 5
  const dpi = earlyIssue ? 300 : 180
  const scale = earlyIssue ? dpi / 200 : dpi / 72
  const reviewNumber = record.id.slice(-3)
  const filenameStem = [
    `wp${issue.padStart(2, '0')}`,
    `review-${reviewNumber}`,
    `p${String(source.pdfPage).padStart(2, '0')}`,
    source.bbox ? `bbox-${source.bbox.join('-')}` : 'full-page',
  ].join('-')
  const outputStem = resolve(outputDirectory, filenameStem)
  const args = ['-r', String(dpi), '-jpeg', '-jpegopt', 'quality=90', '-singlefile']

  if (source.bbox) {
    const [left, top, right, bottom] = source.bbox
    args.push(
      '-x',
      String(Math.max(0, Math.floor(left * scale))),
      '-y',
      String(Math.max(0, Math.floor(top * scale))),
      '-W',
      String(Math.max(1, Math.ceil((right - left) * scale))),
      '-H',
      String(Math.max(1, Math.ceil((bottom - top) * scale)))
    )
  }

  args.push('-f', String(source.pdfPage), '-l', String(source.pdfPage), pdfPath, outputStem)
  const result = spawnSync('pdftoppm', args, { encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(`Could not render ${record.id}: ${result.stderr || result.stdout}`)
  }

  return {
    id: record.id,
    issue,
    sectionTitle: record.sectionTitle,
    sourceJsonPath: record.source.jsonPath,
    sectionIndex: record.source.sectionIndex,
    blockIndex: record.source.blockIndex,
    originalRecord: record.originalRecord,
    sourcePdf: `/${record.source.pdfPath.replace(/^public\//, '')}`,
    sourcePdfSha256,
    locator: source,
    crop: `${filenameStem}.jpg`,
    coordinateUnit: earlyIssue ? 'ocr-pixels-200dpi' : 'pdf-points',
    dpi,
  }
})
writeFileSync(
  resolve(outputDirectory, 'whitepaper-review-crops.json'),
  `${JSON.stringify(entries, null, 2)}\n`
)
process.stdout.write(`${JSON.stringify({ rendered: entries.length, outputDirectory }, null, 2)}\n`)
