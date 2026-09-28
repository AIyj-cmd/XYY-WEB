import { HOME_FAQS, HOME_SERVICE_FALLBACKS, HOME_STATS_FALLBACKS } from '@/data/home'
import { englishClaim } from '@/i18n/claims'
import {
  HOME_SERVICE_APPROVED_TEMPLATE_SOURCES,
  HOME_SERVICE_PUBLISHED_SOURCES,
} from '@/i18n/home-service-sources'
import type { FaqItem, HomepageStat, Service } from '@/lib/directus'

const reportHomeOmission = (scope: string, key: string) =>
  console.warn(`[i18n:home] omitted ${scope}: ${key}`)

const statCopy: Record<string, [string, string]> = {
  partnerBrands: ['Partner brands', 'Apparel and related consumer categories'],
  warehouseArea: [
    'Direct-operated warehouse space',
    'Warehouse network across South, East and Central China',
  ],
  coveredCities: ['Cities covered', 'Fulfilment and transport service network'],
  managedSkus: ['Managed SKUs', 'Style, colour and size control for apparel'],
  newGoodsInspectionAnnual: ['New-goods inspection', 'Inspection against confirmed project rules'],
  returnInspectionAnnual: ['Returns inspection', 'Inspection, routing and relisting support'],
  inventoryAccuracy: ['Inventory accuracy', 'Coordinated systems and warehouse workflows'],
  servedStores: ['Stores served', 'Chain and omnichannel retail operations'],
}

export function translateHomeStats(items: HomepageStat[]): HomepageStat[] {
  return items.flatMap((item) => {
    const source = HOME_STATS_FALLBACKS.find((candidate) => candidate.claimKey === item.claimKey)
    const copy = item.claimKey ? statCopy[item.claimKey] : undefined
    if (
      !source ||
      !copy ||
      source.id !== item.id ||
      source.value !== item.value ||
      source.unit !== item.unit ||
      source.label !== item.label ||
      source.detail !== item.detail
    ) {
      reportHomeOmission('stat', item.claimKey || String(item.id))
      return []
    }
    if (!source.claimKey) {
      reportHomeOmission('stat', String(item.id))
      return []
    }
    const presentation = englishClaim(source.claimKey, 'home')
    const match = presentation.match(/^([\d,]+\+?)(.*)$/)
    if (!match) {
      reportHomeOmission('stat', source.claimKey)
      return []
    }
    return [{ ...item, value: match[1], unit: match[2], label: copy[0], detail: copy[1] }]
  })
}

const serviceCopy: Record<
  string,
  Pick<Service, 'name' | 'subtitle' | 'description' | 'features'>
> = {
  'cloud-warehouse': {
    name: 'Apparel fulfilment',
    subtitle: 'One inventory pool across channels',
    description:
      'Receiving, inventory, order fulfilment and returns handling are coordinated for apparel projects.',
    features: [
      `Dispatch accuracy ${englishClaim('shippingAccuracy', 'home')}; inventory accuracy ${englishClaim('inventoryAccuracy', 'home')}`,
      englishClaim('shippingSla', 'home'),
      `Single-warehouse daily peak ${englishClaim('singleWarehousePeak', 'home')}`,
      'RFID, electronic labels and dispatch checks support style-colour-size control',
    ],
  },
  'quality-inspection': {
    name: 'Returns inspection and garment care',
    subtitle: `${englishClaim('recognizableAnomalies', 'home')} of apparel anomalies; returns inspection and relisting within ${englishClaim('returnTurnaround', 'home')}`,
    description:
      'Unpacking, condition grading, cleaning, repair and relisting are arranged against agreed brand requirements.',
    features: [
      `${englishClaim('recognizableAnomalies', 'home')} of apparel anomalies can be identified`,
      `Returns inspection and relisting within ${englishClaim('returnTurnaround', 'home')}`,
      `Repair success rate ${englishClaim('repairSuccessRate', 'home')}`,
      'Repair areas and reinspection follow brand standards',
    ],
  },
  'logistics-cloud': {
    name: 'Logistics operations coordination',
    subtitle: 'Six connected operating modules with the OTD logistics platform',
    description:
      'Orders, inventory, warehouse operations, logistics tracking and delivery data are coordinated for exception visibility and fulfilment review.',
    features: [
      'Connected order and inventory workflows',
      'Visible logistics milestones and exceptions',
      'Integration planning for Qimen, EDI, API and project interfaces',
      'Online work orders and operating reports for review',
    ],
  },
}

export function translateHomeServices(items: Service[]): Service[] {
  return items.flatMap((item) => {
    const source = [
      ...HOME_SERVICE_FALLBACKS,
      ...HOME_SERVICE_PUBLISHED_SOURCES,
      ...HOME_SERVICE_APPROVED_TEMPLATE_SOURCES,
    ].find(
      (candidate) =>
        candidate.slug === item.slug &&
        candidate.name === item.name &&
        candidate.subtitle === item.subtitle &&
        candidate.description === item.description &&
        candidate.features.length === item.features.length &&
        candidate.features.every((feature, index) => feature === item.features[index])
    )
    const copy = serviceCopy[item.slug]
    if (!source || !copy) {
      reportHomeOmission('service', item.slug)
      return []
    }
    return [{ ...item, ...copy }]
  })
}

const faqCopy: Record<string, [string, string]> = {
  'faq-home-01': [
    'Which apparel fulfilment services does XINYIYUAN provide?',
    'Apparel warehousing, inbound inspection, returns inspection, garment care, order fulfilment, store replenishment and logistics coordination can be configured around the project. B2C, B2B and O2O orders can be coordinated with agreed warehouse, system and returns workflows.',
  ],
  'faq-home-02': [
    'Which apparel brands are a fit?',
    'The service is designed for brands with multi-platform orders, style-colour-size SKUs, store replenishment, peak periods or returns requirements. The operating plan follows actual volume and channels.',
  ],
  'faq-home-03': [
    'How does this differ from a general cloud warehouse?',
    'The operating model is organised around apparel SKU complexity, returns and seasonality. Style-colour-size control, inspection grading, care, relisting and inventory coordination connect forward fulfilment with reverse operations.',
  ],
  'faq-home-04': [
    'Can returns be inspected, repaired and relisted?',
    `Yes. Returned items can be unpacked, graded, cleaned, repaired and prepared for relisting. ${englishClaim('recognizableAnomalies', 'home')} of apparel anomalies are identified under the approved inspection approach; returns inspection and relisting are completed within ${englishClaim('returnTurnaround', 'home')} under the service rule.`,
  ],
  'faq-home-05': [
    'Are marketplace, ERP and store orders supported?',
    'Platform, brand ERP, store and wholesale orders can enter one fulfilment queue. Inventory, timing and warehouse configuration inform dispatch, while integration requirements are confirmed by project.',
  ],
  'faq-home-06': [
    'Is single-item dispatch and domestic preparation for cross-border projects supported?',
    `Yes. After receiving and system connection, orders can be picked, verified, packed, dispatched and tracked individually. ${englishClaim('shippingSla', 'home')}. Cross-border projects can use domestic warehousing, inspection, relabelling, repacking and logistics coordination.`,
  ],
  'faq-home-07': [
    'Which operating data and cases can be reviewed?',
    `XINYIYUAN serves ${englishClaim('partnerBrands', 'home')} apparel and related brands, ${englishClaim('servedStores', 'home')} stores, with ${englishClaim('warehouseArea', 'home')} of direct-operated warehouse space. Figures follow their reporting period, project scope and operating records.`,
  ],
  'faq-home-08': [
    'How can I request a fulfilment plan and quotation?',
    'Share SKU volume, typical daily orders, sales channels, warehouse region and returns situation. The team can then assess warehouse, fulfilment and systems needs for a project-based recommendation.',
  ],
}

export function translateHomeFaqs(items: FaqItem[]): FaqItem[] {
  return items.flatMap((item) => {
    const source = HOME_FAQS.find((candidate) => candidate.q === item.q && candidate.a === item.a)
    const copy = source ? faqCopy[source.contentKey] : undefined
    if (!copy) {
      reportHomeOmission('faq', source?.contentKey || 'unknown')
      return []
    }
    return [{ q: copy[0], a: copy[1] }]
  })
}
