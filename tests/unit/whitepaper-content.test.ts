import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  getWhitepaper,
  getWhitepaperDirectory,
  getWhitepaperListings,
  getWhitepapers,
} from '@/data/whitepapers'
import type { PublicationIssue } from '@/data/publications'

const repositoryRoot = process.cwd()
const issue14 = getWhitepaper('14')!

describe('whitepaper content contract', () => {
  it('keeps all fourteen reading assets uniquely identified and source-traceable', () => {
    const articles = getWhitepapers()
    expect(
      articles.map((article) => article.issue).sort((left, right) => Number(left) - Number(right))
    ).toEqual(Array.from({ length: 14 }, (_, index) => String(index + 1)))

    for (const article of articles) {
      expect(article.originalTitle).toBeTruthy()
      expect(article.title).toBeTruthy()
      expect(article.description).toBeTruthy()
      expect(article.sourcePublishedLabel).toBeTruthy()
      expect(article.readingNotice).toBeTruthy()
      expect(article.title).not.toBe(article.originalTitle)
      expect(article.description).not.toBe(article.title)
      expect(article.sourcePdf).toBe(`/senlinqikan/pdf/${article.issue}.pdf`)

      const source = readFileSync(resolve(repositoryRoot, `public${article.sourcePdf}`))
      expect(article.sourceSha256).toBe(createHash('sha256').update(source).digest('hex'))
      expect(article.sections.length).toBeGreaterThan(0)

      for (const section of article.sections) {
        expect(section.title).toBeTruthy()
        expect(section.blocks.length).toBeGreaterThan(0)
        for (const block of section.blocks) {
          expect(block.source).toBeTruthy()
          expect(block.type).not.toBe('viewer')
          if (block.type === 'figure') {
            expect(block.src).toMatch(/^\/images\/supply-chain-whitepapers\/\d+\//)
            expect(block.alt).toBeTruthy()
            expect(block.width).toBeGreaterThan(0)
            expect(block.height).toBeGreaterThan(0)
            expect(
              readFileSync(resolve(repositoryRoot, 'public', block.src!.slice(1))).length
            ).toBeGreaterThan(1024)
          }
        }
      }

      expect(JSON.stringify(article).toLowerCase()).not.toMatch(/iframe|embed|viewer/)
    }
  })

  it('marks every section of issues 3–5 as explicitly unrecovered where source text is not published', () => {
    for (const issue of ['3', '4', '5']) {
      const article = getWhitepaper(issue)!
      expect(article.sections.length).toBeGreaterThan(0)
      for (const section of article.sections) {
        const notes = section.blocks.filter((block) => block.type === 'review-note')
        expect(notes.length, `issue ${issue} section ${section.title}`).toBeGreaterThan(0)
        expect(notes.some((note) => /未恢复|未转录|核对|PDF|原稿/.test(note.text ?? ''))).toBe(true)
      }
    }
  })

  it('keeps issue 14 as a complete, source-traceable 12-article reading asset', () => {
    expect(issue14.title).toBe('鞋服产品增长、跨境供应链与上海云仓实践')
    expect(issue14.sections).toHaveLength(12)
    expect(issue14.sections.map((section) => section.source.printedPage)).toEqual([
      2, 3, 8, 14, 20, 23, 27, 29, 31, 33, 35, 37,
    ])
    expect(issue14.sections.every((section) => section.blocks.length > 0)).toBe(true)
    expect(
      issue14.sections.flatMap((section) => section.blocks).every((block) => block.source)
    ).toBe(true)
    expect(
      issue14.sections[1].blocks.some((block) => block.text?.includes('文源自：中国服装协会'))
    ).toBe(true)
    expect(issue14.sections[2].blocks.some((block) => block.text?.includes('文：数字100'))).toBe(
      true
    )
    expect(
      issue14.sections.every((section) =>
        section.blocks.some((block) => block.type === 'paragraph')
      )
    ).toBe(true)
    expect(
      issue14.sections
        .flatMap((section) => section.blocks)
        .filter((block) => block.type === 'subheading').length
    ).toBeGreaterThan(12)
  })

  it('records the source PDF hash, historical-content notice, and local figure assets', () => {
    const source = readFileSync(resolve(repositoryRoot, 'public/senlinqikan/pdf/14.pdf'))
    expect(issue14.sourceSha256).toBe(createHash('sha256').update(source).digest('hex'))
    expect(issue14.readingNotice).toContain('历史语境')
    const figures = issue14.sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.type === 'figure')
    expect(figures.length).toBeGreaterThanOrEqual(5)
    for (const figure of figures) {
      expect(figure.src).toMatch(/^\/images\/supply-chain-whitepapers\/14\//)
      expect(figure.alt).toBeTruthy()
      expect(
        readFileSync(resolve(repositoryRoot, 'public', figure.src!.slice(1))).length
      ).toBeGreaterThan(1024)
    }
  })

  it('returns no article for unknown or malformed issue values', () => {
    expect(getWhitepaper('15')).toBeUndefined()
    expect(getWhitepaper('014')).toBeUndefined()
    expect(getWhitepaper('pdf')).toBeUndefined()
  })

  it('derives known reading links from actual JSON assets without dynamic missing imports', () => {
    const articles = getWhitepapers()
    const listings = getWhitepaperListings()
    expect(articles.map((article) => article.issue)).toEqual(
      listings.map((article) => article.issue)
    )
    expect(listings.every((article) => article.sourcePdf.startsWith('/senlinqikan/pdf/'))).toBe(
      true
    )
    expect(listings.every((article) => article.cover.endsWith(`/${article.issue}.jpg`))).toBe(true)
  })

  it('only exposes converted HTML reading pages returned by the CMS', () => {
    const cmsIssue14: PublicationIssue = {
      issue: 14,
      title: 'CMS 第14期标题',
      season: '',
      summary: 'CMS 摘要不替换已转换原刊摘要',
      cover: '/cms/14-cover.jpg',
      pdf: '/cms/14.pdf',
      date: '',
      isLatest: true,
    }
    const futurePdfOnly: PublicationIssue = {
      issue: 15,
      title: '未来 PDF 资料',
      season: '',
      summary: '仅 PDF',
      cover: '/cms/15-cover.jpg',
      pdf: '/cms/15.pdf',
      date: '',
      isLatest: false,
    }

    expect(getWhitepaperDirectory([])).toEqual({ whitepapers: [], pdfOnlyIssues: [] })

    const directory = getWhitepaperDirectory([futurePdfOnly, cmsIssue14])
    expect(directory.whitepapers).toHaveLength(1)
    expect(directory.whitepapers[0]).toMatchObject({
      issue: '14',
      title: issue14.title,
      description: issue14.description,
      sourcePdf: issue14.sourcePdf,
      cover: '/cms/14-cover.jpg',
    })
    expect(directory.pdfOnlyIssues).toEqual([futurePdfOnly])
  })

  it('keeps the audited reading sequence and leaves uncertain rosters as source figures', () => {
    const exportStory = issue14.sections[1].blocks.map((block) => block.text ?? '').join('\n')
    expect(exportStory.indexOf('形势综述')).toBeLessThan(exportStory.indexOf('贸易数据'))
    expect(exportStory.indexOf('贸易数据')).toBeLessThan(exportStory.indexOf('市场分析'))

    const productStory = issue14.sections[2].blocks.map((block) => block.text ?? '').join('\n')
    expect(productStory).toContain('过去几年，鞋服行业持续处于高频上新、快速迭代和竞争加剧的环境中')

    const collegeStory = issue14.sections[11].blocks.map((block) => block.text ?? '').join('\n')
    expect(collegeStory.indexOf('在供需见面会前夕')).toBeLessThan(collegeStory.indexOf('6月16日'))
    expect(collegeStory.indexOf('6月16日')).toBeLessThan(collegeStory.indexOf('此次合作与专场招聘'))

    const figures = issue14.sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.type === 'figure')
    expect(figures.some((figure) => figure.src?.endsWith('/rising-star-roster.png'))).toBe(true)
    expect(
      figures.filter((figure) => figure.src?.includes('/awards-')).length
    ).toBeGreaterThanOrEqual(6)
    expect(
      issue14.sections[9].blocks.some(
        (block) => block.type === 'review-note' && block.text?.includes('不依据碎片文字')
      )
    ).toBe(true)
  })
})
