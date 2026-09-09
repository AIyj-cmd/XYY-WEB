import type { WhitepaperArticle, WhitepaperListing } from './types'
import type { PublicationIssue } from '@/data/publications/issues'

export interface WhitepaperDirectory {
  whitepapers: WhitepaperListing[]
  pdfOnlyIssues: PublicationIssue[]
}

const modules = import.meta.glob('./*.json', { eager: true, import: 'default' }) as Record<
  string,
  unknown
>

function isWhitepaperArticle(value: unknown): value is WhitepaperArticle {
  if (!value || typeof value !== 'object') return false
  const article = value as Partial<WhitepaperArticle>
  return (
    typeof article.issue === 'string' &&
    /^(?:[1-9]|1[0-4])$/.test(article.issue) &&
    typeof article.title === 'string' &&
    typeof article.description === 'string' &&
    typeof article.sourcePdf === 'string' &&
    Array.isArray(article.sections)
  )
}

const whitepapers = Object.values(modules)
  .filter(isWhitepaperArticle)
  .sort((left, right) => Number(right.issue) - Number(left.issue))

const byIssue = new Map(whitepapers.map((article) => [article.issue, article]))

export function getWhitepaper(issue: string | undefined) {
  if (!issue || !/^(?:[1-9]|1[0-4])$/.test(issue)) return undefined
  return byIssue.get(issue)
}

export function getWhitepapers(): WhitepaperArticle[] {
  return whitepapers
}

export function getWhitepaperListings(): WhitepaperListing[] {
  return whitepapers.map((article) => ({
    issue: article.issue,
    title: article.title,
    description: article.description,
    sourcePdf: article.sourcePdf,
    sourcePublishedLabel: article.sourcePublishedLabel,
    cover: `/senlinqikan/covers/${article.issue}.jpg`,
  }))
}

/**
 * CMS availability is authoritative for the directory. A converted reading page is
 * only offered when its corresponding publication is returned by the CMS; otherwise
 * an empty successful CMS response must remain empty.
 */
export function getWhitepaperDirectory(cmsIssues: PublicationIssue[]): WhitepaperDirectory {
  const listingsByIssue = new Map(
    getWhitepaperListings().map((article) => [article.issue, article])
  )
  const directory: WhitepaperListing[] = []
  const pdfOnlyIssues: PublicationIssue[] = []

  for (const cmsIssue of cmsIssues) {
    const converted = listingsByIssue.get(String(cmsIssue.issue))
    if (!converted) {
      pdfOnlyIssues.push(cmsIssue)
      continue
    }

    directory.push({
      ...converted,
      cover: cmsIssue.cover || converted.cover,
    })
  }

  directory.sort((left, right) => Number(right.issue) - Number(left.issue))
  return { whitepapers: directory, pdfOnlyIssues }
}
