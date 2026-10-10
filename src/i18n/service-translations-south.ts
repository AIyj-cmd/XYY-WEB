import { englishClaim } from './claims'
import type { ServicePageContent } from '@/lib/directus-content-queries'
import type { FaqItem } from '@/data/service'

const E = (key: Parameters<typeof englishClaim>[0]) =>
  englishClaim(key, 'service:huanan-xiefu-yuncang')

export const SOUTH_ENGLISH_CONTENT: ServicePageContent = {
  title: 'South China apparel fulfilment | Guangzhou, Dongguan, Foshan and Zhaoqing',
  description:
    'Apparel warehousing across Guangzhou, Dongguan, Foshan and Zhaoqing, supporting B2C, B2B, e-commerce dispatch, store replenishment and returns. Every warehouse has inspection capability.',
  eyebrow: 'South China apparel fulfilment · Pearl River Delta warehouse network',
  h1: 'South China fulfilment: Guangzhou, Dongguan, Foshan and Zhaoqing',
  h1sub: 'Coordinated regional inventory and apparel fulfilment',
  breadcrumbLabel: 'South China fulfilment',
  heroDesc:
    'Warehouses in Guangzhou, Dongguan, Foshan and Zhaoqing support B2C, B2B, omnichannel inventory coordination, returns inspection and regional distribution.',
  imgSrc: '/w-hanging1.webp',
  imgAlt: 'South China apparel warehouse network across four locations',
  contentDesc: `${E('shippingSla')}. Guangzhou same-city delivery can be as fast as 4 hours; next-day delivery is a reference for major Guangdong areas, and next-day to two-day delivery for major South China cities. Arrival times vary by delivery address, carrier and route; the agreed distribution plan applies.`,
  featuresLabel: 'South China warehouse services',
  stats: [
    {
      stat: '4 areas',
      label: 'South China network',
      sub: 'Guangzhou · Dongguan · Foshan · Zhaoqing',
    },
    { stat: 'Omnichannel', label: 'Fulfilment model', sub: 'B2C · B2B · returns handling' },
    { stat: 'Before 18:00', label: 'Order cut-off', sub: 'Dispatch before 24:00 the same day' },
    {
      stat: '300,000+ m²',
      label: 'Directly operated South China space',
      sub: 'Coordinated multi-warehouse network',
    },
  ],
  features: [
    {
      title: 'Guangzhou warehouses',
      desc: 'Serve apparel brands in Guangzhou and the Pearl River Delta with e-commerce dispatch, store replenishment and returns inspection.',
    },
    {
      title: 'Dongguan warehouses',
      desc: 'Connect Dongguan factories and brand stock with receiving, storage, order dispatch and returns inspection.',
    },
    {
      title: 'Foshan warehouses',
      desc: 'Provide storage, order dispatch and returns inspection for apparel brands in Foshan and nearby areas.',
    },
    {
      title: 'Zhaoqing warehouses',
      desc: 'Support apparel receiving, storage, dispatch and returns inspection. VIP JIT/JITX operations follow platform requirements.',
    },
    {
      title: 'Returns inspection at every warehouse',
      desc: `All South China warehouses have inspection capability, allowing returns to be checked and sorted nearby. Goods suitable for resale complete inspection and re-listing within ${E('returnTurnaround')} under the service agreement; care and repair are arranged according to item condition.`,
    },
    {
      title: 'Factory receiving and inventory planning',
      desc: 'Connect apparel supply from Guangzhou, Dongguan, Foshan and other locations with factory receiving, inventory management and order dispatch.',
    },
  ],
}

export const SOUTH_ENGLISH_FAQS: FaqItem[] = [
  {
    q: 'Which areas does the South China network cover?',
    a: 'The network covers Guangzhou, Dongguan, Foshan and Zhaoqing, with 300,000+ m² of directly operated South China warehouse space. Active warehouse locations, addresses, capacity and service scope are confirmed before each project starts.',
  },
  {
    q: 'What are dispatch and delivery timings from South China?',
    a: `${E('shippingSla')}. Guangzhou same-city delivery can be as fast as 4 hours; next-day delivery is a reference for major Guangdong areas, and next-day to two-day delivery for major South China cities. The applicable route SLA governs delivery timing.`,
  },
  {
    q: 'Does South China offer a regional cost advantage?',
    a: 'Storage and transfer costs are calculated for the selected warehouse locations, volumes and routes.',
  },
  {
    q: 'Which apparel brands are suited to the South China network?',
    a: 'It suits brands whose main inventory, suppliers or customer market are in South China and which need e-commerce dispatch, retail-chain replenishment, VIP JIT/JITX, returns inspection or domestic warehousing support for cross-border projects.',
  },
  {
    q: 'What scale of brand can the South China warehouses support?',
    a: `Shared storage, dedicated zones or multi-warehouse plans can be assessed against SKU counts, inventory, peak orders and value-added services. The company’s published regional operating peak is ${E('regionalPeak')}; project capacity must be confirmed against available warehouse space and resources.`,
  },
]
