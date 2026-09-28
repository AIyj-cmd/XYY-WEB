import type { AssuranceIcon } from '@/data/product/care-assurance'
import { SERVICE_FACTS } from '@/lib/brand'
import { englishClaim } from './claims'
import type { SiteLocale } from './routes'

type ProductVideoCopy = {
  label: string
  headingPrefix: string
  headingValue: string
  description: string
  highlights: readonly string[]
  href: string
  link: string
}

export const ENGLISH_PRODUCT_VIDEO_COPY: readonly ProductVideoCopy[] = [
  {
    label: 'Apparel fulfilment',
    headingPrefix: 'Apparel fulfilment,',
    headingValue: ' one inventory pool across channels.',
    description:
      'For apparel with many styles, colours and sizes, we manage inventory and orders together. From e-commerce dispatch to store replenishment, receiving, storage, picking and dispatch are connected so stock can move across online and offline channels in an orderly way.',
    highlights: ['Style-colour-size control', 'Inventory coordination', 'Omnichannel dispatch'],
    href: '/en/apparel-fulfillment',
    link: 'Explore apparel fulfilment',
  },
  {
    label: 'Returns inspection',
    headingPrefix: 'Returns inspection,',
    headingValue: ' a clear destination for every item.',
    description:
      'Which returned items can be listed again, and which need care or repair? We unpack, verify, inspect and grade their condition, then arrange the next step to the standards confirmed by the brand while retaining traceable operating records.',
    highlights: ['Unpacking and verification', 'Inspection grading', 'Disposition routing'],
    href: '/en/returns-inspection',
    link: 'Explore returns inspection',
  },
  {
    label: 'Garment care',
    headingPrefix: 'Garment care,',
    headingValue: ' bring repairable items back into circulation.',
    description:
      'For confirmed issues involving stains, stitching, trims or labelling, cleaning, repair and finishing are arranged for the garment material. Items are inspected again after treatment; those meeting customer standards enter the next listing process.',
    highlights: ['Cleaning and finishing', 'Defect repair', 'Second inspection'],
    href: '/en/garment-care',
    link: 'Explore garment care',
  },
  {
    label: 'Cross-border warehouse operations',
    headingPrefix: 'Cross-border warehousing,',
    headingValue: ' connect domestic preparation with export handover.',
    description:
      'For cross-border apparel projects, we provide domestic warehousing, project inspection, relabelling, repacking and returns finishing. In-warehouse work follows confirmed product and packing requirements before handover to logistics resources under the project plan.',
    highlights: ['Domestic preparation', 'Project inspection', 'Relabelling and repacking'],
    href: '/en/services#04-cross-border',
    link: 'View related services',
  },
  {
    label: 'South China apparel fulfilment',
    headingPrefix: 'South China fulfilment,',
    headingValue: ' connect Pearl River Delta operations.',
    description:
      'For apparel brands in Guangzhou and the Pearl River Delta, we connect factory receiving, e-commerce dispatch, store replenishment and returns handling. Regional inventory and warehouse operations are organised around the project requirements to support South China operations.',
    highlights: ['Factory receiving', 'Regional fulfilment', 'Returns handling'],
    href: '/en/apparel-fulfillment',
    link: 'Explore apparel fulfilment',
  },
  {
    label: 'East China apparel fulfilment',
    headingPrefix: 'East China fulfilment,',
    headingValue: ' support regional orders and replenishment.',
    description:
      'For inventory placement across the Yangtze River Delta and East China, we provide e-commerce dispatch, store replenishment and returns inspection. Inventory can be coordinated with the South China warehouse network by project to arrange regional fulfilment and returns flows.',
    highlights: ['Regional fulfilment', 'Store replenishment', 'Multi-warehouse coordination'],
    href: '/en/services#06-east-china',
    link: 'View related services',
  },
  {
    label: 'Livestream commerce fulfilment',
    headingPrefix: 'Livestream fulfilment,',
    headingValue: ' manage concentrated order volume and returns.',
    description:
      'For brand-operated and agency-operated livestream teams, stock preparation and warehouse work are planned before each session. Multi-platform order coordination, wave picking and flexible capacity connect concentrated dispatch with returns handling after a session.',
    highlights: ['Session stock preparation', 'Flexible capacity', 'Returns handling'],
    href: '/en/services#07-live-commerce',
    link: 'View related services',
  },
  {
    label: 'B2B store distribution',
    headingPrefix: 'B2B store distribution,',
    headingValue: ' coordinate allocation and replenishment.',
    description:
      'For retail chains, wholesalers and franchise systems, allocation, verification and dispatch are organised by store and style-colour-size. Labels, allocation details and ERP coordination support seasonal rollouts and routine replenishment.',
    highlights: ['Store-level allocation', 'Labels and allocation details', 'ERP coordination'],
    href: '/en/retail-distribution',
    link: 'Explore retail distribution',
  },
]

export const PRODUCT_SEQUENCE_LABELS: Record<
  SiteLocale,
  Record<'navigation' | 'previous' | 'next', string>
> = {
  'zh-CN': { navigation: '页面分区导航', previous: '上一个区域', next: '下一个区域' },
  en: {
    navigation: 'Service section navigation',
    previous: 'Previous section',
    next: 'Next section',
  },
}

type AssurancePoint = { value: string; label: string; note: string }
type AssuranceMechanism = { title: string; note: string; icon: AssuranceIcon }

export const ENGLISH_ASSURANCE_COPY: {
  heading: string
  introduction: readonly string[]
  points: readonly AssurancePoint[]
  mechanismsHeading: string
  mechanisms: readonly AssuranceMechanism[]
} = {
  heading: 'Make service visible, reviewable and continuously improved.',
  introduction: [
    'From receiving through dispatch, each step has standards, records and feedback.',
    'This keeps the service process visible, results reviewable and improvements continuous.',
  ],
  points: [
    {
      value: englishClaim('inventoryAccuracy', 'product'),
      label: 'Inventory accuracy',
      note: 'Locations and inventory status are managed continuously.',
    },
    {
      value: SERVICE_FACTS.orderPickupCutoff,
      label: 'Daily order cut-off',
      note: 'Order rules follow the agreed project terms.',
    },
    {
      value: `By ${SERVICE_FACTS.orderDispatchDeadline}`,
      label: 'Eligible orders dispatched the same day',
      note: 'Specific conditions follow the agreed solution and order rules.',
    },
    {
      value: 'End to end',
      label: 'Traceable item status',
      note: 'Key milestones can be traced from receiving through delivery.',
    },
  ],
  mechanismsHeading: 'Service assurance mechanisms',
  mechanisms: [
    {
      title: 'Standard operating procedures',
      note: 'SOPs support consistent delivery.',
      icon: 'standard',
    },
    {
      title: 'Multiple inspection checks',
      note: 'Key steps are inspected to reduce error risk.',
      icon: 'check',
    },
    {
      title: 'System records retained',
      note: 'End-to-end records can be reviewed and traced.',
      icon: 'record',
    },
    {
      title: 'Fast exception response',
      note: 'Exceptions are identified and handled in a timely loop.',
      icon: 'alert',
    },
    {
      title: 'Continuous improvement',
      note: 'Operations are refined from data and feedback.',
      icon: 'improve',
    },
  ],
}
