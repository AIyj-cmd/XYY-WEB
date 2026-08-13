import type { AboutHistoryItem } from '@/data/about/types'
import type { CaseDetail } from '@/data/brand/case-details'
import type { Case } from './directus-types'
import type { PublicationIssue } from '@/data/publications/issues'
import type { FeatureItem, StatItem } from '@/data/service'
import { getDirectusAssetUrl, requestItems, requestSingleton } from './directus-client'
import { interpolateClaims } from './directus-interpolation'
import type {
  AboutContentRecord,
  AboutHistoryRecord,
  AboutHonorRecord,
  CaseDetailRecord,
  CaseStatRecord,
  PublicationRecord,
  ServiceFeatureRecord,
  ServicePageRecord,
  ServiceStatRecord,
  SiteSettingsRecord,
} from './directus-types'

const published = { status: { _eq: 'published' } }

function unifiedCaseDetail(item: Case, fallback: CaseDetail): CaseDetail {
  return {
    slug: item.slug || fallback.slug,
    name: item.name || item.label || fallback.name,
    fullName: item.full_name || item.label || fallback.fullName,
    category: item.category || fallback.category,
    image: item.img || fallback.image,
    accent: item.accent || fallback.accent,
    description: interpolateClaims(item.case_description || item.details || fallback.description),
    stats: item.stats?.length ? item.stats : fallback.stats,
  }
}

export async function getCaseDetail(
  slug: string,
  fallback: CaseDetail,
  caseItem?: Case
): Promise<CaseDetail> {
  if (caseItem) return unifiedCaseDetail(caseItem, fallback)
  try {
    const [details, stats] = await Promise.all([
      requestItems<CaseDetailRecord[]>('case_details', {
        filter: { slug: { _eq: slug }, ...published },
        limit: 1,
      }),
      requestItems<CaseStatRecord[]>('case_stats', {
        filter: { case_slug: { _eq: slug }, ...published },
        sort: ['sort'],
      }),
    ])
    const detail = details[0]
    if (!detail) return fallback
    return {
      slug: detail.slug,
      name: detail.name,
      fullName: detail.full_name,
      category: fallback.category,
      image: fallback.image,
      accent: detail.accent || fallback.accent,
      description: interpolateClaims(detail.description),
      stats: stats.length
        ? stats.map(({ label, value, unit }) => ({ label, value, unit }))
        : fallback.stats,
    }
  } catch {
    return fallback
  }
}

export async function getPublications(fallback: PublicationIssue[]): Promise<PublicationIssue[]> {
  try {
    const rows = await requestItems<PublicationRecord[]>('publications', {
      filter: published,
      sort: ['sort'],
    })
    return rows.length
      ? rows.map(
          ({
            issue,
            title,
            season,
            summary,
            cover,
            pdf,
            cover_file,
            pdf_file,
            date,
            is_latest,
          }) => ({
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
      : fallback
  } catch {
    return fallback
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
  stats: [StatItem, StatItem, StatItem, StatItem]
  features: FeatureItem[]
}

export async function getServicePageContent(slug: string, fallback: ServicePageContent) {
  try {
    const pages = await requestItems<ServicePageRecord[]>('service_pages', {
      filter: { slug: { _eq: slug }, ...published },
      limit: 1,
    })
    const page = pages[0]
    if (!page) return fallback
    let stats = page.stats || []
    let features = page.features || []
    if (!stats.length || !features.length) {
      const [legacyStats, legacyFeatures] = await Promise.all([
        !stats.length
          ? requestItems<ServiceStatRecord[]>('service_stats', {
              filter: { service_slug: { _eq: slug }, ...published },
              sort: ['sort'],
            })
          : Promise.resolve([]),
        !features.length
          ? requestItems<ServiceFeatureRecord[]>('service_features', {
              filter: { service_slug: { _eq: slug }, ...published },
              sort: ['sort'],
            })
          : Promise.resolve([]),
      ])
      if (!stats.length) stats = legacyStats
      if (!features.length) features = legacyFeatures
    }
    const displayStats = stats.map(({ stat, label, sub }) => ({
      stat: interpolateClaims(stat),
      label,
      sub: interpolateClaims(sub),
    }))
    return {
      title: interpolateClaims(page.title),
      description: interpolateClaims(page.description),
      breadcrumbLabel: page.breadcrumb_label,
      eyebrow: page.eyebrow,
      h1: page.h1,
      h1sub: interpolateClaims(page.h1sub),
      heroDesc: interpolateClaims(page.hero_desc),
      imgSrc: getDirectusAssetUrl(page.hero_image) || page.img_src,
      imgAlt: page.img_alt,
      contentDesc: interpolateClaims(page.content_desc),
      featuresLabel: page.features_label,
      stats:
        displayStats.length === 4 ? (displayStats as ServicePageContent['stats']) : fallback.stats,
      features: features.length
        ? features.map(({ title, desc }) => ({ title, desc: interpolateClaims(desc) }))
        : fallback.features,
    }
  } catch {
    return fallback
  }
}

export async function getAboutContent(fallback: { overview: string; heroDescription: string }) {
  try {
    const row = await requestSingleton<AboutContentRecord>('about_content')
    return row && row.status !== 'draft'
      ? {
          overview: interpolateClaims(row.overview),
          heroDescription: interpolateClaims(row.hero_description),
        }
      : fallback
  } catch {
    return fallback
  }
}

export async function getAboutHistory(fallback: AboutHistoryItem[]): Promise<AboutHistoryItem[]> {
  try {
    const rows = await requestItems<AboutHistoryRecord[]>('about_history', {
      filter: published,
      sort: ['sort'],
    })
    return rows.length
      ? rows.map(({ year, subtitle, text, img, image_file }) => ({
          year,
          subtitle,
          text,
          img: getDirectusAssetUrl(image_file) || img,
        }))
      : fallback
  } catch {
    return fallback
  }
}

export async function getAboutHonors(fallback: { title: string; image: string }[]) {
  try {
    const rows = await requestItems<AboutHonorRecord[]>('about_honors', {
      filter: published,
      sort: ['sort'],
    })
    return rows.length
      ? rows.map(({ title, image, image_file }) => ({
          title,
          image: getDirectusAssetUrl(image_file) || image,
        }))
      : fallback
  } catch {
    return fallback
  }
}

export async function getSiteSettings(fallback: Omit<SiteSettingsRecord, 'id' | 'status' | 'key'>) {
  try {
    const row = await requestSingleton<SiteSettingsRecord>('site_settings')
    return row && row.status !== 'draft'
      ? {
          phone: row.phone,
          headquarters_label: row.headquarters_label,
          headquarters_address: row.headquarters_address,
          icp: row.icp,
          footer_description: interpolateClaims(row.footer_description),
        }
      : fallback
  } catch {
    return fallback
  }
}
