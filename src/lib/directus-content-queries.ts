import type { AboutHistoryItem } from '@/data/about/types'
import type { CaseDetail } from '@/data/brand/case-details'
import type { Case } from './directus-types'
import type { PublicationIssue } from '@/data/publications/issues'
import type { FeatureItem, StatItem } from '@/data/service'
import { getDirectusAssetUrl, requestItems, requestSingleton } from './directus-client'
import { interpolateClaims } from './directus-interpolation'
import { fallbackForUnavailable } from './directus/request-state'
import type {
  AboutContentRecord,
  AboutHistoryRecord,
  AboutHonorRecord,
  PublicationRecord,
  ServicePageRecord,
  SiteSettingsRecord,
} from './directus-types'

const published = { status: { _eq: 'published' } }

function cmsValue(value: string | null | undefined) {
  return typeof value === 'string' ? value : ''
}

function cmsText(value: string | null | undefined) {
  return interpolateClaims(cmsValue(value))
}

function unifiedCaseDetail(item: Case, fallback: CaseDetail): CaseDetail {
  return {
    slug: item.slug || fallback.slug,
    name: item.name || item.label || '',
    fullName: item.full_name || item.label || '',
    category: item.category || '',
    image: item.img || '',
    accent: item.accent || '#2563EB',
    description: interpolateClaims(item.case_description || item.details || ''),
    stats: item.stats || [],
  }
}

export async function getCaseDetail(
  slug: string,
  fallback: CaseDetail,
  caseItem?: Case
): Promise<CaseDetail> {
  if (caseItem) return unifiedCaseDetail(caseItem, fallback)
  return { ...fallback, slug }
}

export async function getPublications(fallback: PublicationIssue[]): Promise<PublicationIssue[]> {
  try {
    const rows = await requestItems<PublicationRecord[]>('publications', {
      filter: published,
      sort: ['sort'],
    })
    return rows.map(
      ({ issue, title, season, summary, cover, pdf, cover_file, pdf_file, date, is_latest }) => ({
        issue,
        title,
        season,
        summary,
        cover: getDirectusAssetUrl(cover_file) || cover,
        pdf: getDirectusAssetUrl(pdf_file) || pdf,
        date,
        isLatest: is_latest,
      })
    )
  } catch (error) {
    return fallbackForUnavailable(error, fallback)
  }
}

export interface ServicePageContent {
  title: string
  description: string
  breadcrumbLabel: string
  eyebrow: string
  h1: string
  h1sub: string
  heroDesc: string
  imgSrc: string
  imgAlt: string
  contentDesc: string
  featuresLabel: string
  stats: readonly StatItem[]
  features: FeatureItem[]
}

const emptyServicePageContent = (): ServicePageContent => ({
  title: '',
  description: '',
  breadcrumbLabel: '',
  eyebrow: '',
  h1: '',
  h1sub: '',
  heroDesc: '',
  imgSrc: '',
  imgAlt: '',
  contentDesc: '',
  featuresLabel: '',
  stats: [],
  features: [],
})

export async function getServicePageContent(slug: string, fallback: ServicePageContent) {
  try {
    const pages = await requestItems<ServicePageRecord[]>('service_pages', {
      filter: { slug: { _eq: slug }, ...published },
      limit: 1,
    })
    const page = pages[0]
    if (!page) return emptyServicePageContent()
    const stats = page.stats || []
    const features = page.features || []
    const displayStats = stats.map(({ stat, label, sub }) => ({
      stat: interpolateClaims(stat),
      label,
      sub: interpolateClaims(sub),
    }))
    return {
      title: cmsText(page.title),
      description: cmsText(page.description),
      breadcrumbLabel: cmsText(page.breadcrumb_label),
      eyebrow: cmsText(page.eyebrow),
      h1: cmsText(page.h1),
      h1sub: cmsText(page.h1sub),
      heroDesc: cmsText(page.hero_desc),
      imgSrc: getDirectusAssetUrl(page.hero_image) || cmsValue(page.img_src),
      imgAlt: cmsText(page.img_alt),
      contentDesc: cmsText(page.content_desc),
      featuresLabel: cmsText(page.features_label),
      stats: displayStats,
      features: features.map(({ title, desc }) => ({ title, desc: interpolateClaims(desc) })),
    }
  } catch (error) {
    return fallbackForUnavailable(error, fallback)
  }
}

export async function getAboutContent(fallback: { overview: string; heroDescription: string }) {
  try {
    const row = await requestSingleton<AboutContentRecord>('about_content')
    return row && row.status !== 'draft'
      ? {
          overview: cmsText(row.overview),
          heroDescription: cmsText(row.hero_description),
        }
      : { overview: '', heroDescription: '' }
  } catch (error) {
    return fallbackForUnavailable(error, fallback)
  }
}

export async function getAboutHistory(fallback: AboutHistoryItem[]): Promise<AboutHistoryItem[]> {
  try {
    const rows = await requestItems<AboutHistoryRecord[]>('about_history', {
      filter: published,
      sort: ['sort'],
    })
    return rows.map(({ year, subtitle, text, img, image_file }) => ({
      year,
      subtitle,
      text,
      img: getDirectusAssetUrl(image_file) || img,
    }))
  } catch (error) {
    return fallbackForUnavailable(error, fallback)
  }
}

export async function getAboutHonors(fallback: { title: string; image: string }[]) {
  try {
    const rows = await requestItems<AboutHonorRecord[]>('about_honors', {
      filter: published,
      sort: ['sort'],
    })
    return rows.map(({ title, image, image_file }) => ({
      title,
      image: getDirectusAssetUrl(image_file) || image,
    }))
  } catch (error) {
    return fallbackForUnavailable(error, fallback)
  }
}

export async function getSiteSettings(fallback: Omit<SiteSettingsRecord, 'id' | 'status' | 'key'>) {
  try {
    const row = await requestSingleton<SiteSettingsRecord>('site_settings')
    return row && row.status !== 'draft'
      ? {
          phone: cmsValue(row.phone),
          headquarters_label: cmsValue(row.headquarters_label),
          headquarters_address: cmsValue(row.headquarters_address),
          icp: cmsValue(row.icp),
          footer_description: cmsText(row.footer_description),
        }
      : {
          phone: '',
          headquarters_label: '',
          headquarters_address: '',
          icp: '',
          footer_description: '',
        }
  } catch (error) {
    return fallbackForUnavailable(error, fallback)
  }
}
