import { SERVICE_PAGE_CONFIG } from '@/data/service-pages/config'
import { DIGITAL_OPERATIONS_CHINESE, DIGITAL_OPERATIONS_ENGLISH } from '@/i18n/digital-operations'
import { findLocalePair, type SiteLocale } from '@/i18n/routes'
import { ENGLISH_SERVICE_SOURCES } from '@/i18n/service-source-catalog'
import {
  getConversionContext,
  getServiceFinderContext,
  type ConversionService,
} from '@/lib/conversion/contact-source'

type ServiceSourceSlug = keyof typeof SERVICE_PAGE_CONFIG

function sourceSlug(pathname: string, sourceLocale: SiteLocale): ServiceSourceSlug | null {
  const chinesePath =
    sourceLocale === 'en' ? (findLocalePair(pathname, sourceLocale)?.[0] ?? '') : pathname
  const slug = chinesePath.slice(1)
  return Object.hasOwn(SERVICE_PAGE_CONFIG, slug) ? (slug as ServiceSourceSlug) : null
}

function sourceLabel(pathname: string, sourceLocale: SiteLocale, locale: SiteLocale) {
  if (pathname === '/wuliu-shuzihua' || pathname === '/en/digital-operations')
    return locale === 'en'
      ? DIGITAL_OPERATIONS_ENGLISH.breadcrumb
      : DIGITAL_OPERATIONS_CHINESE.breadcrumb

  const slug = sourceSlug(pathname, sourceLocale)
  if (!slug) return null
  if (locale === 'zh-CN') return SERVICE_PAGE_CONFIG[slug].breadcrumbLabel
  return ENGLISH_SERVICE_SOURCES[slug]?.english.breadcrumbLabel ?? null
}

export type ContactServiceContext = {
  preselectedService: ConversionService | null
  sourceLabel: string | null
}

export function getContactServiceContext(url: URL, locale: SiteLocale): ContactServiceContext {
  const conversion = getConversionContext(url)
  const finder = getServiceFinderContext(url)
  const conflictingServices =
    conversion !== null && finder !== null && conversion.service !== finder.service
  const preselectedService = conflictingServices
    ? null
    : (finder?.service ?? conversion?.service ?? null)

  return {
    preselectedService,
    sourceLabel:
      conversion && !conflictingServices
        ? sourceLabel(conversion.sourcePath, conversion.locale, locale)
        : null,
  }
}
