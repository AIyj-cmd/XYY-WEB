import { SERVICE_PAGE_CONFIG } from '@/data/service-pages/config'
import { DIGITAL_OPERATIONS_CHINESE, DIGITAL_OPERATIONS_ENGLISH } from '@/i18n/digital-operations'
import { findLocalePair, type SiteLocale } from '@/i18n/routes'
import { ENGLISH_SERVICE_SOURCES } from '@/i18n/service-source-catalog'
import { getContactServiceOption, type ContactServiceValue } from '@/lib/contact/service-options'
import {
  getConversionContext,
  getServiceFinderContext,
  type ServiceFinderContext,
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
  preselectedService: ContactServiceValue | null
  sourceLabel: string | null
}

function finderService(finder: ServiceFinderContext): ContactServiceValue {
  switch (finder.need) {
    case 'ecommerce-fulfilment':
      if (finder.region === 'east-china') return '华东鞋服云仓'
      if (finder.region === 'south-china') return '华南鞋服云仓'
      return '鞋服云仓'
    case 'store-replenishment':
      return 'B2B门店仓配'
    case 'returns-inspection':
      return '退货质检'
    case 'garment-care':
      return '后整修复'
    case 'livestream-fulfilment':
      return '直播电商仓配'
  }
}

export function getContactServiceContext(url: URL, locale: SiteLocale): ContactServiceContext {
  const conversion = getConversionContext(url)
  const finder = getServiceFinderContext(url)
  const conflictingServices =
    conversion !== null && finder !== null && conversion.service !== finder.service
  const sourceService = conversion
    ? (getContactServiceOption(sourceSlug(conversion.sourcePath, conversion.locale) ?? '')?.value ??
      null)
    : null
  const preselectedService = conflictingServices
    ? null
    : conversion
      ? sourceService
      : finder
        ? finderService(finder)
        : null

  return {
    preselectedService,
    sourceLabel:
      conversion && !conflictingServices
        ? sourceLabel(conversion.sourcePath, conversion.locale, locale)
        : null,
  }
}
