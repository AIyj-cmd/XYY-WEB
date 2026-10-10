import { englishClaim } from './claims'
import type { ServicePageContent } from '@/lib/directus-content-queries'
import type { FaqItem } from '@/data/service'

const E = (key: Parameters<typeof englishClaim>[0]) => englishClaim(key, 'service:zhibo-cangpei')

export const LIVE_ENGLISH_CONTENT: ServicePageContent = {
  title: 'Livestream fulfilment | Peak capacity, inventory and returns',
  description: `Multi-platform order coordination and flexible capacity for livestream commerce, with a reported single-warehouse daily peak of ${E('singleWarehousePeak')}. ${E('shippingSla')}. Returns inspection and re-listing are also available.`,
  eyebrow: 'Livestream fulfilment · flexible capacity and inventory synchronisation',
  h1: 'Livestream fulfilment: manage order peaks, inventory and returns',
  h1sub: 'Multi-platform order coordination and flexible fulfilment',
  breadcrumbLabel: 'Livestream fulfilment',
  heroDesc: `Flexible capacity and multi-platform inventory synchronisation support major livestream commerce platforms. A dynamic labour pool can be allocated on an hourly basis, with a reported single-warehouse daily peak of ${E('singleWarehousePeak')}, supporting fulfilment for brands and livestream agencies.`,
  imgSrc: '/w-live-commerce.webp',
  imgAlt: 'Flexible warehouse dispatch for livestream order peaks',
  contentDesc: `For apparel livestream hosts and brand-operated teams on major platforms. Concentrated orders, inventory synchronisation and returns are key challenges. A dynamic labour pool supports hourly allocation; inventory can be synchronised in real time by project to reduce overselling risk. Returns inspection and re-listing are completed within ${E('returnTurnaround')}.`,
  featuresLabel: 'Livestream fulfilment capabilities',
  stats: [
    {
      stat: E('singleWarehousePeak'),
      label: 'Single-warehouse daily peak',
      sub: 'Hourly allocation from a dynamic labour pool',
    },
    { stat: 'Before 18:00', label: 'Order cut-off', sub: 'Dispatch before 24:00 the same day' },
    {
      stat: E('inventoryAccuracy'),
      label: 'Inventory accuracy',
      sub: 'RFID and real-time multi-platform synchronisation',
    },
    {
      stat: 'Major platforms',
      label: 'Livestream commerce coordination',
      sub: 'Interface scope confirmed by project',
    },
  ],
  features: [
    {
      title: 'Flexible capacity for order peaks',
      desc: `Staffing is scheduled before major livestream sessions, with hourly allocation through a dynamic labour pool. The reported single-warehouse daily peak is ${E('singleWarehousePeak')}.`,
    },
    {
      title: 'Multi-platform inventory synchronisation',
      desc: 'Order and inventory interfaces with livestream platforms or brand systems can be implemented by project to reduce overselling caused by delayed stock updates. Available interfaces are confirmed through integration testing.',
    },
    {
      title: 'Picking-wave allocation',
      desc: 'After livestream orders arrive, the system creates work waves. RFID location and verification workflows organise batch picking; capacity is confirmed in the session plan.',
    },
    { title: E('shippingSla'), desc: E('shippingSla') },
    {
      title: 'Fast handling of high return volumes',
      desc: `Livestream returns are routed to nearby Guangzhou or South China warehouses. Unpacking checks, inspection grading, repair preparation and re-listing are completed within ${E('returnTurnaround')} to replenish saleable stock.`,
    },
    {
      title: 'Multi-brand plans for livestream agencies',
      desc: 'Shared-warehouse plans for MCNs and livestream service providers use separate brand zones, isolated system permissions, individual dispatch notes and reports to support multiple clients.',
    },
  ],
}

export const LIVE_ENGLISH_FAQS: FaqItem[] = [
  {
    q: 'How does livestream fulfilment differ from ordinary e-commerce fulfilment?',
    a: 'There are three main differences: orders may arrive in a short burst, requiring flexible capacity; inventory synchronisation must reduce the delay between platform stock and physical warehouse stock; and returns usually need coordination with forward fulfilment. XINYIYUAN organises its workflows around capacity, inventory and returns.',
  },
  {
    q: 'Which livestream platforms can be connected?',
    a: 'Major livestream commerce platforms are supported, with order, inventory, dispatch and returns data integration assessed by project. Platform authorisation, interface availability, field scope and integration timing follow project confirmation and current platform rules.',
  },
  {
    q: 'Can the warehouse handle a major livestream order surge?',
    a: `Capacity is assessed for each session. Before promotions or livestream events, projected volume is used to plan warehouse space, labour, packing materials and logistics channels. A dynamic labour pool, multi-warehouse coordination and wave operations support additional capacity; the reported single-warehouse daily peak is ${E('singleWarehousePeak')}. Brands should provide session and stock plans early so the project arrangements can be confirmed.`,
  },
  {
    q: 'How is overselling during a livestream handled?',
    a: `Overselling can result from inventory sync delays, stock reserved for platform campaigns, cancelled-order restocking or manual adjustments. Inventory synchronisation, order checks, stock alerts and exception controls can reduce risk. Published inventory accuracy is ${E('inventoryAccuracy')}. Exception handling follows platform rules and the agreed project plan.`,
  },
  {
    q: 'Can MCNs and livestream agencies use multi-brand warehousing?',
    a: 'Yes. Multi-brand shared-warehouse plans provide separate storage zones, account permissions that limit each brand to its own stock and orders, and separate dispatch notes and bills for reconciliation. Settlement can be centralised through the agency or handled separately by each brand. Plans are tailored to brand count and SKU scale.',
  },
]
