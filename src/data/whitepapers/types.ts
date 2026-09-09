export type WhitepaperBlock = {
  type: 'paragraph' | 'subheading' | 'list' | 'quote' | 'figure' | 'table' | 'review-note'
  text?: string
  alt?: string
  src?: string
  caption?: string
  width?: number
  height?: number
  source: {
    pdfPage: number
    printedPage: number | null
    side: 'left' | 'right' | 'full'
    bbox?: number[]
  }
}

export type WhitepaperSection = {
  title: string
  source: { pdfPage: number; printedPage: number | null; side: 'left' | 'right' | 'full' }
  blocks: WhitepaperBlock[]
}

export type WhitepaperArticle = {
  issue: string
  originalTitle: string
  title: string
  description: string
  sourcePdf: string
  sourceSha256: string
  sourcePublishedLabel: string
  readingNotice: string
  sections: WhitepaperSection[]
}

export type WhitepaperListing = Pick<
  WhitepaperArticle,
  'issue' | 'title' | 'description' | 'sourcePdf' | 'sourcePublishedLabel'
> & {
  cover: string
}
