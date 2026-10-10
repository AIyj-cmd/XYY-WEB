import { englishClaim } from './claims'
import type { ServicePageContent } from '@/lib/directus-content-queries'
import type { FaqItem } from '@/data/service'

const turnaround = englishClaim('returnTurnaround', 'service:huadong-xiefu-yuncang')

export const EAST_ENGLISH_CONTENT: ServicePageContent = {
  title: 'East China apparel fulfilment | Shanghai, Kunshan and Hefei',
  description:
    'Apparel warehousing across Shanghai, Kunshan and Hefei for e-commerce dispatch, store replenishment, inventory coordination and returns inspection. Every warehouse has inspection capability.',
  eyebrow: '',
  h1: 'East China apparel fulfilment',
  h1sub: '',
  breadcrumbLabel: 'East China fulfilment',
  heroDesc:
    'Warehouses across Shanghai, Kunshan and Hefei support e-commerce dispatch, store replenishment and returns inspection.',
  imgSrc: '/w-hq.webp',
  imgAlt: 'East China apparel warehousing services',
  contentDesc:
    'Dispatch arrangements and charges are confirmed against the goods, order destinations and required services.',
  featuresLabel: 'East China fulfilment services',
  stats: [
    { stat: '3 areas', label: 'East China network', sub: 'Shanghai · Kunshan · Hefei' },
    { stat: 'Omnichannel', label: 'Fulfilment model', sub: 'B2C · B2B · returns handling' },
    { stat: 'Before 18:00', label: 'Order cut-off', sub: 'Dispatch before 24:00 the same day' },
    {
      stat: 'No fee',
      label: 'System usage',
      sub: 'Interface implementation and customisation follow the agreed plan',
    },
  ],
  features: [
    {
      title: 'East China warehouse locations',
      desc: 'The Shanghai, Kunshan and Hefei network arranges fulfilment around inventory and order requirements. Every warehouse has inspection capability.',
    },
    {
      title: 'East China e-commerce dispatch',
      desc: 'Supports orders from Tmall, JD, Pinduoduo, Douyin commerce, Kuaishou and other platforms, with dispatch arranged against stock and agreed terms.',
    },
    {
      title: 'East China store replenishment',
      desc: 'Goods are organised by store, supporting full-case dispatch, split-case picking and replenishment delivery.',
    },
    {
      title: 'East China returns inspection',
      desc: `Each warehouse can inspect returns. Goods suitable for resale complete inspection and re-listing within ${turnaround} under the service agreement; goods requiring repair are handled separately.`,
    },
    {
      title: 'East and South China inventory coordination',
      desc: 'A shared view of East and South China inventory supports dispatch, replenishment and reconciliation according to order region, available stock and agreed rules.',
    },
    {
      title: 'Local team coordination',
      desc: 'Discuss East China warehouse requirements around the goods, order destinations and replenishment schedule.',
    },
  ],
}

export const EAST_ENGLISH_FAQS: FaqItem[] = [
  {
    q: 'Where are the East China warehouses, and which brands do they suit?',
    a: 'The network covers Shanghai, Kunshan and Hefei, with Shanghai Qingpu as one core node. It suits apparel brands with supply chains or key customer markets in East China that need regional inventory and store-replenishment coordination. The Shanghai warehouse address is B-3-3, No. 3939 Waiqingsong Highway, Baihe Town, Qingpu District, Shanghai. Active locations, capacity and operating scope are confirmed before project launch.',
  },
  {
    q: 'How long does delivery to major Yangtze River Delta cities take?',
    a: 'Transit timing depends on the active warehouse, destination, order cut-off, carrier and available route. XINYIYUAN verifies routes during project assessment and records the applicable scope and SLA in the mutually agreed service plan.',
  },
  {
    q: 'Can East China and Guangzhou warehouses share inventory management?',
    a: 'Yes. The OMS supports unified multi-warehouse management: inventory is visible across Guangzhou and Shanghai; configured proximity-based routing sends East China orders to Shanghai and South China orders to Guangzhou; reporting and reconciliation are unified without separate system logins; and warehouse replenishment alerts help prevent a stock shortage at one warehouse from disrupting dispatch.',
  },
  {
    q: 'Can East China warehouses handle promotional order peaks?',
    a: 'Shanghai Qingpu is one core node in the East China network. Flexible staffing can adjust capacity during promotions, while brands can plan inventory across Kunshan, Hefei and the South China network. Contact the commercial team to assess specific warehouse capacity.',
  },
  {
    q: 'Do East China warehouse charges differ from Guangzhou?',
    a: 'Charges typically comprise storage, handling, system implementation and value-added services. Unit prices depend on the active warehouses, SKU counts, throughput and service scope. Brands can provide operating data for a project quotation from the commercial team.',
  },
]
