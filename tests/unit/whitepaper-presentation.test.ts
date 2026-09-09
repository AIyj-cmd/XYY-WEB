import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { getWhitepapers } from '@/data/whitepapers'
import figureAssetManifest from '@/data/whitepaper-figure-assets.json'
import type { WhitepaperFigureAssets } from '@/data/whitepapers/presentation'
import { getArticleReadingNotice, getFigurePresentation } from '@/data/whitepapers/presentation'

const technicalReaderTerms = /\b(?:ocr|bbox|physical page)\b|文字层|转录|当前\s*kpi/i
const repositoryRoot = process.cwd()

function isFigureAssetManifest(value: unknown): value is WhitepaperFigureAssets {
  if (!value || typeof value !== 'object') return false

  return Object.values(value).every((asset) => {
    if (!asset || typeof asset !== 'object') return false
    const candidate = asset as Record<string, unknown>
    return (
      typeof candidate.src === 'string' &&
      typeof candidate.width === 'number' &&
      typeof candidate.height === 'number' &&
      typeof candidate.displayWidth === 'number' &&
      (candidate.quality === 'enhanced' || candidate.quality === 'source-limited') &&
      (candidate.kind === 'diagram' || candidate.kind === 'photo')
    )
  })
}

if (!isFigureAssetManifest(figureAssetManifest)) {
  throw new Error('Whitepaper figure asset manifest has an invalid entry')
}

const figureAssets = figureAssetManifest

describe('whitepaper presentation contract', () => {
  it('keeps all reader-visible figure copy free of conversion terminology', () => {
    const figures = getWhitepapers().flatMap((article) =>
      article.sections.flatMap((section) =>
        section.blocks.filter((block) => block.type === 'figure')
      )
    )

    expect(figures).toHaveLength(76)
    for (const figure of figures) {
      const presentation = getFigurePresentation(figure)
      const mappedAsset = figure.src ? figureAssets[figure.src] : undefined
      expect(`${presentation.alt}\n${presentation.caption}`).not.toMatch(technicalReaderTerms)
      expect(`${presentation.alt}\n${presentation.caption}`).not.toMatch(
        /原刊(?:(?:印刷|物理)?第?\s*\d+\s*页|(?:印刷|物理)页\s*\d+)/
      )
      expect(presentation.width).toBeGreaterThan(0)
      expect(presentation.height).toBeGreaterThan(0)
      expect(presentation.displayWidth).toBeGreaterThan(0)
      expect(presentation.displayWidth).toBeLessThanOrEqual(presentation.width)
      if (mappedAsset) {
        expect(presentation).toMatchObject(mappedAsset)
        expect(presentation.largeViewHref).toBe(mappedAsset.src)
      } else {
        expect(presentation.src).toBe(figure.src)
        expect(presentation.width).toBe(figure.width)
        expect(presentation.height).toBe(figure.height)
      }
    }
  })

  it('uses the audited enhanced asset manifest without calling source-limited figures high-definition', () => {
    const assets = Object.values(figureAssets)
    expect(assets).toHaveLength(31)
    expect(assets.filter((asset) => asset.quality === 'enhanced')).toHaveLength(28)
    expect(assets.filter((asset) => asset.quality === 'source-limited')).toHaveLength(3)
    expect(assets.every((asset) => asset.displayWidth <= asset.width)).toBe(true)
    expect(
      assets.every((asset) => asset.src.includes('/reading/') && asset.src.endsWith('.webp'))
    ).toBe(true)
  })

  it('removes the alternate printed-page prefix from issue 14 captions without dropping attribution', () => {
    const issue14 = getWhitepapers().find((article) => article.issue === '14')!
    const exportFigure = issue14.sections
      .flatMap((section) => section.blocks)
      .find((block) => block.src?.endsWith('/textile-export-bar-chart.png'))!
    const presentation = getFigurePresentation(exportFigure)

    expect(exportFigure.caption).toContain('原刊印刷页4的')
    expect(presentation.caption).not.toMatch(/原刊印刷页\s*\d+/)
    expect(presentation.caption).toContain('纺织服装出口金额及同比图')
    expect(presentation.caption).toContain('文源自中国服装协会')
  })

  it('removes confirmed locator-only captions without weakening the figure meaning', () => {
    const articleByIssue = new Map(getWhitepapers().map((article) => [article.issue, article]))
    const findFigure = (issue: string, filename: string) =>
      articleByIssue
        .get(issue)!
        .sections.flatMap((section) => section.blocks)
        .find((block) => block.src?.endsWith(`/${filename}`))!

    const earlyFigure = getFigurePresentation(findFigure('1', 'warehouse-six-principles.png'))
    expect(earlyFigure.caption).toBe('仓库六大守则现场照片')
    expect(earlyFigure.alt).toBe('仓库六大守则现场照片')

    const issue10Figure = getFigurePresentation(findFigure('10', 'ecommerce-warehouse.png'))
    expect(issue10Figure.caption).toBe('服装云仓货架与周转箱')
    expect(issue10Figure.alt).toBe('服装云仓货架与周转箱')

    const rosterFigure = getFigurePresentation(findFigure('14', 'rising-star-roster.png'))
    expect(rosterFigure.caption).toBe('22位储备干部培养名单图表')
    expect(rosterFigure.alt).toBe('22位储备干部培养名单图表')
  })

  it('keeps internal review notes data-only without reader-facing prompts or PDF page links', () => {
    const articles = getWhitepapers()
    const affectedSections = articles.flatMap((article) =>
      article.sections.filter((section) =>
        section.blocks.some((block) => block.type === 'review-note')
      )
    )
    const component = readFileSync(
      resolve(repositoryRoot, 'src/components/publications/WhitepaperArticle.astro'),
      'utf8'
    )
    const presentation = readFileSync(
      resolve(repositoryRoot, 'src/data/whitepapers/presentation.ts'),
      'utf8'
    )

    expect(articles).toHaveLength(14)
    expect(affectedSections).toHaveLength(122)
    expect(component).toContain("if (block.type === 'review-note') return null")
    expect(component).not.toMatch(
      /getSectionReadingNote|whitepaper-article__review-note|查看原版第/
    )
    expect(presentation).not.toContain('getSectionReadingNote')
    expect(presentation).not.toContain('本节部分图文未完整转为文字')
  })

  it('only shows the partial-recovery warning for issues 3 through 5', () => {
    for (const article of getWhitepapers()) {
      const notice = getArticleReadingNotice(article)
      if (['3', '4', '5'].includes(article.issue)) {
        expect(notice).toBe('本期仅部分内容，完整内容请阅读 PDF 原版。')
      } else {
        expect(notice).toBeUndefined()
      }
    }
  })

  it('renders the presentation helpers and keeps narrow figures centered at both breakpoints', () => {
    const component = readFileSync(
      resolve(repositoryRoot, 'src/components/publications/WhitepaperArticle.astro'),
      'utf8'
    )
    const stylesheet = readFileSync(resolve(repositoryRoot, 'src/styles/whitepapers.css'), 'utf8')

    expect(component).toContain('getArticleReadingNotice(article)')
    expect(component).toMatch(
      /\{readingNotice &&\s*<aside class="whitepaper-article__notice">\{readingNotice\}<\/aside>\}/
    )
    expect(component).toContain('getFigurePresentation(block)')
    expect(component).not.toContain('待核查：{block.text}')
    expect(component).not.toContain('高清')
    expect(stylesheet).not.toContain('.whitepaper-article__review-note')
    expect(stylesheet).toMatch(/width: min\(100%, var\(--whitepaper-figure-display-width\)\)/)
    expect(stylesheet).toContain('margin: 2rem auto')
    expect(stylesheet).toContain('margin: 1.5rem auto')
    expect(stylesheet).toContain('text-align: center')
  })
})
