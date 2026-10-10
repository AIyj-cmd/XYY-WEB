import { englishClaim } from './claims'
import type { ServicePageContent } from '@/lib/directus-content-queries'
import type { FaqItem } from '@/data/service'

const turnaround = englishClaim('returnTurnaround', 'service:kuajing-yuncang')

export const CROSSBORDER_ENGLISH_CONTENT: ServicePageContent = {
  title: 'Cross-border fulfilment | Domestic warehousing, inspection and packing',
  description:
    'Domestic warehousing, project-specific inspection, relabelling, repacking and returns preparation for cross-border apparel projects. Transport and customs responsibilities follow the contract.',
  eyebrow: 'Cross-border fulfilment · domestic warehousing and supporting services',
  h1: 'Domestic fulfilment support for cross-border apparel',
  h1sub: 'Domestic warehousing · project inspection · relabelling and repacking',
  breadcrumbLabel: 'Cross-border fulfilment',
  heroDesc:
    'With Guangzhou as its South China hub, XINYIYUAN supports domestic preparation and dispatch for cross-border platforms such as Tmall Global and Amazon, plus domestic processing of cross-border returns. The Urbanic project handles 18–23 million units annually.',
  imgSrc: '/w-crossborder-cloud-hero.webp',
  imgAlt: 'Domestic warehousing and dispatch for cross-border commerce',
  contentDesc:
    'For cross-border apparel projects needing domestic warehousing, inspection, relabelling, repacking and returns preparation. Guangzhou is the core warehouse node, with EMS and cross-border line-haul resources coordinated where agreed. Export declarations, customs clearance and transport responsibilities follow the project contract. The Urbanic case involves annual handling in the tens of millions of units.',
  featuresLabel: 'Cross-border services',
  stats: [
    { stat: '10m+ units', label: 'Handling scale', sub: 'Urbanic cooperation case' },
    {
      stat: turnaround,
      label: 'Domestic returns processing',
      sub: 'Inspection and secondary handling',
    },
    {
      stat: 'AQL 1.0–6.5',
      label: 'Partner QC team',
      sub: 'Customer and destination-market standards',
    },
    {
      stat: 'EMS and more',
      label: 'Logistics coordination',
      sub: 'Including cross-border line-haul resources',
    },
  ],
  features: [
    {
      title: 'Domestic stock preparation',
      desc: 'Supports domestic preparation, inspection, relabelling and repacking for Tmall Global, Amazon, Shopee and other cross-border projects, followed by logistics handover under the agreed plan.',
    },
    {
      title: 'Project-specific inspection',
      desc: 'Inspection follows standards confirmed by the customer and destination market. The QC team working with Guangzhou Inspection Group performs AQL 1.0–6.5 sampling and provides reports as agreed for the project.',
    },
    {
      title: 'Relabelling and repacking',
      desc: 'Multilingual care labels, outer packaging and barcodes such as FNSKU/EAN can be replaced to the destination-market specifications supplied and approved by the brand. Compliance responsibilities follow the contract.',
    },
    {
      title: 'Cross-border returns handling',
      desc: `After parcels reach the XINYIYUAN domestic warehouse, inspection and secondary handling are completed within ${turnaround}. Grading and disposition standards are confirmed for the cross-border project and customer.`,
    },
    {
      title: 'Logistics resource coordination',
      desc: 'EMS and cross-border line-haul resources can be coordinated, with available tracking information returned. Export declarations, customs clearance and transport responsibilities follow the project contract.',
    },
    {
      title: 'Cross-border project support',
      desc: 'Workflows can combine domestic stock preparation, warehouse packing and reverse logistics for overseas returns. Both parties confirm the service scope.',
    },
  ],
}

export const CROSSBORDER_ENGLISH_FAQS: FaqItem[] = [
  {
    q: 'Which cross-border platforms can XINYIYUAN support?',
    a: 'Domestic warehousing, stock preparation and returns requirements can be assessed for Tmall Global, Amazon, Shopee, Lazada, AliExpress, Temu and other platforms. Interfaces, labels, packaging and inspection follow current platform requirements and the project specifications supplied by the brand.',
  },
  {
    q: 'How are returns handled after arriving from overseas?',
    a: `After parcels reach the domestic warehouse, the project can include unpacking and receiving, order and SKU checks, inspection grading, repair routing and re-listing. Inspection and secondary handling are completed within ${turnaround}. This warehouse timing excludes cross-border transport, export declarations and customs clearance; responsibilities follow the contract. Grading and disposition follow the project and customer requirements.`,
  },
  {
    q: 'What needs to be confirmed before relabelling or repacking?',
    a: 'The brand first provides label and packing specifications for the destination market, platform and goods. XINYIYUAN follows approved templates for multilingual care labels, FNSKU/EAN barcodes and outer packaging, retaining processing records. Regulatory assessment, product compliance and final label content remain with the responsible party specified in the contract.',
  },
  {
    q: 'How do cross-border and domestic warehousing charges differ?',
    a: 'Both use a storage-volume and handling-volume fee structure. Additional cross-border services, such as multilingual relabelling, English AQL reports and logistics integration, are charged separately. Pricing depends on product category, handling volume and the service combination; contact the commercial team for a project quotation.',
  },
  {
    q: 'Is there a published cross-border customer case?',
    a: 'Urbanic, a cross-border fast-fashion business serving India and the UK, is a published XINYIYUAN case. Its scope includes B2B and B2C warehousing, inspection, packing, putaway, inventory management and dispatch packing. Published annual figures are 18–23 million units dispatched, 8–14 million inspected and 15–20 million packed; definitions follow the case materials.',
  },
]
