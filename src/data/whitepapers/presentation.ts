import type { WhitepaperArticle, WhitepaperBlock } from './types'
import figureAssetManifest from '../whitepaper-figure-assets.json'

export type WhitepaperFigureAsset = {
  src: string
  width: number
  height: number
  displayWidth: number
  quality: 'enhanced' | 'source-limited'
  kind: 'diagram' | 'photo'
}

export type WhitepaperFigureAssets = Record<string, WhitepaperFigureAsset>

export type FigurePresentation = {
  src: string
  alt: string
  caption: string
  width: number
  height: number
  displayWidth: number
  kind: WhitepaperFigureAsset['kind']
  quality: WhitepaperFigureAsset['quality']
  largeViewHref?: string
}

const partialRecoveryIssues = new Set(['3', '4', '5'])
const figureAssets = figureAssetManifest as WhitepaperFigureAssets

function cleanFigureCopy(value: string | undefined): string {
  return (value ?? '')
    .replace(/[（(]原刊(?:印刷|物理)?第?\s*\d+\s*页局部[）)]/g, '')
    .replace(
      /原刊(?:(?:印刷|物理)?第?\s*\d+\s*页|(?:印刷|物理)页\s*\d+)(?:\s*(?:左侧|右侧|上半|下半))?(?:的)?/g,
      ''
    )
    .replace(/(?:PDF\s*)?physical page\s*\d+(?:\s*(?:left|right|full))?/gi, '')
    .replace(/[（(][^）)]*(?:OCR|bbox|文字层|转录)[^）)]*[）)]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[，、:：]\s*/, '')
    .trim()
}

function isLocatorOnlyCaption(value: string | undefined): boolean {
  return /^\s*(?:PDF\s*)?physical page\s*\d+\b/i.test(value ?? '')
}

export function getFigurePresentation(
  figure: WhitepaperBlock,
  assets: WhitepaperFigureAssets = figureAssets
): FigurePresentation {
  const asset = figure.src ? assets[figure.src] : undefined
  const src = asset?.src ?? figure.src ?? ''
  const fallbackCopy = cleanFigureCopy(figure.alt) || '原刊配图'
  const caption = isLocatorOnlyCaption(figure.caption)
    ? fallbackCopy
    : cleanFigureCopy(figure.caption) || fallbackCopy

  return {
    src,
    alt: cleanFigureCopy(figure.alt) || fallbackCopy,
    caption,
    width: asset?.width ?? figure.width ?? 0,
    height: asset?.height ?? figure.height ?? 0,
    displayWidth: asset?.displayWidth ?? figure.width ?? 0,
    kind: asset?.kind ?? 'photo',
    quality: asset?.quality ?? 'source-limited',
    largeViewHref: asset?.kind === 'diagram' ? src : undefined,
  }
}

export function getArticleReadingNotice(article: WhitepaperArticle): string | undefined {
  return partialRecoveryIssues.has(article.issue)
    ? '本期仅部分内容，完整内容请阅读 PDF 原版。'
    : undefined
}
