export const FOOTWEAR_ENGLISH_FEATURE_TITLES = {
  RFID智能识别: 'RFID-enabled item identification',
  精细库存管控: 'Detailed inventory control',
  全渠道一盘货: 'One inventory pool across channels',
  深度定制WMS: 'Configurable WMS integration',
  弹性产能机制: 'Flexible capacity planning',
  全程监控追溯: 'End-to-end operational traceability',
} as const

export const FOOTWEAR_ENGLISH_STAT_LABELS = {
  发货准确率: 'Dispatch accuracy',
  单仓峰值: 'Single-warehouse peak',
  截单时间: 'Daily order cut-off',
  合作品牌: 'Partner brands',
} as const

export const FOOTWEAR_ENGLISH_UI = {
  page: {
    pills: ['Style-colour-size control', 'Omnichannel dispatch', 'Returns to inventory'],
    unavailable: 'Service content is currently unavailable.',
  },
  hero: {
    crumb: 'Services',
    defaultStatement: 'Clear style, colour and size control. Smooth dispatch across channels.',
    pillsLabel: 'Apparel fulfilment priorities',
    contact: 'Discuss an apparel fulfilment plan',
    operations: 'See warehouse operations',
    videoLabel: 'service video',
  },
  goods: {
    label: 'Item management',
    heading: 'Clear style, colour and size control makes inventory usable.',
    visual: {
      label:
        'Illustration of style, colour and size item information. Colours and sizes are illustrative only and do not represent inventory or business data.',
      record: 'Item record',
      illustration: 'Illustration',
      style: 'Style',
      styleExample: 'Fit illustration',
      colour: 'Colour',
      size: 'Size',
    },
  },
  network: {
    label: 'One inventory pool',
    heading: 'Online sales and store replenishment draw from one coordinated inventory pool.',
    channels: [
      {
        label: 'B2C',
        title: 'E-commerce dispatch',
        desc: 'Orders from multiple platforms are consolidated for inventory checks and dispatch.',
      },
      {
        label: 'B2B',
        title: 'Stores and wholesale',
        desc: 'Store replenishment and bulk allocation follow the receiving arrangement.',
      },
      {
        label: 'O2O',
        title: 'Online and offline coordination',
        desc: 'Store inventory and online orders are connected within the agreed project scope.',
      },
    ],
  },
  fulfillment: {
    label: 'Fulfilment',
    heading: 'See how warehouse operations proceed after goods arrive.',
    tablist: 'Fulfilment stages',
    stage: 'Stage',
    outcome: 'Stage outcome',
    stages: [
      {
        label: 'Receiving and setup',
        title: 'Receiving, inspection and RFID put-away',
        outcome: 'Item records and storage locations are established.',
        steps: [
          ['Receiving', 'Items are received and quantities, SKUs and specifications are checked.'],
          [
            'Inbound inspection',
            'Sampling or full inspection follows the agreed project rules; issues are fed back promptly.',
          ],
          ['RFID put-away', 'Items are coded, recorded and put away with location control.'],
        ],
      },
      {
        label: 'Order operations',
        title: 'Order release, picking and verification',
        outcome: 'Orders are synchronised, split and verified.',
        steps: [
          [
            'Order release',
            'Orders from multiple platforms are synchronised and allocated in waves.',
          ],
          [
            'Picking and verification',
            'Electronic labels guide picking and RFID supports error-prevention checks.',
          ],
        ],
      },
      {
        label: 'Final check and dispatch',
        title: 'Quality check, packing and dispatch',
        outcome: 'Orders are packed and dispatched.',
        steps: [
          [
            'Quality check and packing',
            'Items are weighed, checked and packed to the agreed packing standard.',
          ],
          ['Dispatch', 'The dispatch timing follows the approved service-level rule.'],
        ],
      },
    ],
  },
  assurance: {
    label: 'Assurance',
    heading: 'Accurate daily dispatch, with preparation for peak periods.',
    daily: 'Daily operations',
    dailyHeading: 'Scan verification and dispatch planning',
    dailyNote:
      'Timing is affected by the project plan, warehouse capacity, carrier routes and the service scope agreed by both parties.',
    peak: 'Peak-period preparation',
    peakHeading: 'Volume, labour and packing materials prepared in advance',
  },
  returns: {
    label: 'Returns handling',
    heading: 'Classify returned items by condition before the next step.',
    description:
      'Returned items are verified and inspected, then listed again, finished or repaired according to the result so saleable items can return to inventory.',
    inspection: 'Returns inspection',
    inspectionDetail: 'Verification, inspection and next-step routing',
    care: 'Garment care and repair',
    careDetail: 'Arranged according to the condition of each item',
  },
  supplement: { label: 'Additional information', heading: 'More service information' },
  cta: {
    label: 'Prepare for a conversation',
    headingStart: 'Start with your items',
    headingEnd: 'and orders.',
    contact: 'Discuss apparel fulfilment requirements',
    cases: 'View cases',
    services: 'Explore services',
    preparation: [
      ['SKU and category', 'Product categories, styles and sizes'],
      ['Sales channels', 'Primary sales platforms and stores'],
      ['Daily and peak order volume', 'Typical volume and event forecast'],
    ],
    condition:
      'Storage, operations, system implementation and value-added services are confirmed around the requirements.',
  },
  faq: {
    label: 'Frequently asked questions',
    heading: 'More questions about apparel fulfilment.',
    description: 'Expand an item for platforms, peak periods, timing and cooperation arrangements.',
  },
} as const
