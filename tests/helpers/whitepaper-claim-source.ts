import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { WHITEPAPER_SOURCE_LAYOUTS, type SourcePageLayout } from './whitepaper-source-pages'

export type HistoricalWhitepaper = {
  issue: string
  originalTitle: string
  title: string
  description: string
  sourcePdf: string
  sourceSha256: string
  sourcePublishedLabel: string
  readingNotice: string
  sections: Array<{ blocks: Array<Record<string, unknown>> }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function hasValidSourceLocator(source: unknown, layout: SourcePageLayout): boolean {
  if (!isRecord(source)) return false
  const { pdfPage, side, bbox } = source
  if (
    !Number.isInteger(pdfPage) ||
    Number(pdfPage) < 1 ||
    Number(pdfPage) > layout.pageCount ||
    !['left', 'right', 'full'].includes(String(side))
  ) {
    return false
  }
  if (bbox === undefined) return true
  const pageHeight = layout.pageHeights?.[Number(pdfPage)] ?? layout.height
  return (
    Array.isArray(bbox) &&
    bbox.length === 4 &&
    bbox.every((value) => typeof value === 'number' && Number.isFinite(value)) &&
    bbox[0] >= 0 &&
    bbox[1] >= 0 &&
    bbox[2] > bbox[0] &&
    bbox[3] > bbox[1] &&
    bbox[2] <= layout.width &&
    bbox[3] <= pageHeight
  )
}

export function hasTraceableBlockSource(
  block: Record<string, unknown>,
  layout: SourcePageLayout
): boolean {
  return (
    isRecord(block.source) &&
    Array.isArray(block.source.bbox) &&
    hasValidSourceLocator(block.source, layout)
  )
}

export function isLocalWhitepaperFigure(
  block: Record<string, unknown>,
  issue: string,
  repositoryRoot: string
): boolean {
  if (typeof block.src !== 'string') return false
  const localAsset = new RegExp(
    `^/images/supply-chain-whitepapers/${issue}/[A-Za-z0-9][A-Za-z0-9._-]*\\.png$`
  )
  return localAsset.test(block.src) && existsSync(join(repositoryRoot, 'public', block.src))
}

function verifiedHistoricalWhitepaper(
  path: string,
  raw: string,
  repositoryRoot: string
): { article: HistoricalWhitepaper; layout: SourcePageLayout } | undefined {
  const match = /^src\/data\/whitepapers\/(?:([1-9]|1[0-4]))\.json$/.exec(
    relative(repositoryRoot, path)
  )
  if (!match) return undefined

  try {
    const article = JSON.parse(raw) as Partial<HistoricalWhitepaper>
    const issue = match[1]
    const layout = WHITEPAPER_SOURCE_LAYOUTS[issue]
    const expectedPdf = join(repositoryRoot, 'public', 'senlinqikan', 'pdf', `${issue}.pdf`)
    if (
      article.issue !== issue ||
      article.sourcePdf !== `/senlinqikan/pdf/${issue}.pdf` ||
      typeof article.sourceSha256 !== 'string' ||
      article.sourceSha256 !== layout?.sha256 ||
      typeof article.originalTitle !== 'string' ||
      (!article.originalTitle.includes('期刊') && !article.originalTitle.includes('双月刊')) ||
      typeof article.sourcePublishedLabel !== 'string' ||
      !article.sourcePublishedLabel.trim() ||
      typeof article.readingNotice !== 'string' ||
      !article.readingNotice.includes('历史语境') ||
      !Array.isArray(article.sections) ||
      !article.sections.every(
        (section) =>
          isRecord(section) &&
          Array.isArray(section.blocks) &&
          section.blocks.every((block) => isRecord(block))
      ) ||
      !existsSync(expectedPdf)
    ) {
      return undefined
    }
    const sourceHash = createHash('sha256').update(readFileSync(expectedPdf)).digest('hex')
    return sourceHash === layout.sha256
      ? { article: article as HistoricalWhitepaper, layout }
      : undefined
  } catch {
    return undefined
  }
}

function sourceForClaimLiteralScan(path: string, raw: string, repositoryRoot: string): string {
  const verified = verifiedHistoricalWhitepaper(path, raw, repositoryRoot)
  if (!verified) return withoutTechnicalPercentages(raw)

  const sanitized = JSON.parse(raw) as HistoricalWhitepaper
  for (const section of sanitized.sections) {
    for (const block of section.blocks) {
      if (
        ['paragraph', 'quote', 'list'].includes(String(block.type)) &&
        hasTraceableBlockSource(block, verified.layout)
      ) {
        delete block.text
      }
      if (
        block.type === 'figure' &&
        hasTraceableBlockSource(block, verified.layout) &&
        isLocalWhitepaperFigure(block, sanitized.issue, repositoryRoot)
      ) {
        delete block.alt
        delete block.caption
      }
    }
  }
  return withoutTechnicalPercentages(JSON.stringify(sanitized))
}

function withoutTechnicalPercentages(source: string): string {
  const withoutMarkupStyles = source
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, '')
    .replace(/\s(?:class|style)=(['"])[\s\S]*?\1/giu, '')
    .replace(/\s(?:width|height|x|y|x1|x2|y1|y2|cx|cy|r|rx|ry)=(['"])\d+%\1/giu, '')

  return withoutMarkupStyles
    .replace(/(\.toBe\(['"])\d+%\s+\d+%(['"]\))/gu, '$1$2')
    .replace(/(expect\(stylesheet\)\.toMatch\(\/width: min\\\()\d+%/gu, '$1')
}

export function claimLiteralViolations(
  path: string,
  raw: string,
  reviewedValues: string[],
  repositoryRoot: string
): string[] {
  const source = sourceForClaimLiteralScan(path, raw, repositoryRoot)
  return reviewedValues
    .filter((value) => source.includes(value))
    .map((value) => `${relative(repositoryRoot, path)} => ${value}`)
}
