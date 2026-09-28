export const homeUiEn = {
  hero: {
    imageAlt: 'XINYIYUAN modern warehouse operation',
    eyebrow: 'APPAREL SUPPLY CHAIN · ESTABLISHED 2011',
    brand: 'XINYIYUAN APPAREL FULFILMENT',
    title: [
      'From inbound inspection to returns relisting,',
      'apparel fulfilment in one connected operation.',
    ],
    titleAria:
      'From inbound inspection to returns relisting, apparel fulfilment in one connected operation.',
    subtitle:
      'Warehousing, inspection, inventory, order fulfilment and returns handling for apparel brands across connected channels.',
    data: ['direct-operated warehouse space', 'partner brands', 'stores served', 'cities covered'],
    contact: 'Discuss your operation',
    services: 'Explore services →',
  },
  stats: {
    tag: 'OPERATIONS AT A GLANCE',
    heading: ['More than warehouse space:', 'an operating system for apparel supply chains.'],
    intro:
      'Warehouse management, quality inspection, order fulfilment and reverse operations are coordinated around the requirements of each apparel project.',
    notes: 'Data notes',
    basis: 'Basis of reporting',
    footnote:
      'These are public operating figures. Reporting periods and project scopes follow the relevant operating records.',
    disclaimer:
      'Warehouse area, inspection volume, inventory accuracy and repair results reflect operating statistics and public company information. Results vary by category, order profile, system connection and operating model.',
    tenure: {
      label: 'Operating experience',
      status: 'Warehouse network in coordination',
      aria: 'Fifteen years',
      experience: 'Apparel supply-chain experience',
      coverage: [
        'Warehouse management',
        'Order fulfilment',
        'Returns handling',
        'Inventory coordination',
      ],
      range: '2011 to 2026',
    },
    lifecycle: {
      aria: 'Product lifecycle loop',
      label: 'PRODUCT LIFECYCLE',
      heading: 'One operating system across the product lifecycle',
      steps: [
        'Brand onboarding',
        'Inbound receiving',
        'Inspection routing',
        'Inventory management',
        'Order fulfilment',
        'Returns handling',
        'Ready for resale',
      ],
    },
    cards: {
      warehouse: 'Warehouse scale',
      network: 'Service network',
      inspection: 'Inspection & fulfilment',
      accuracy: 'Inventory coordination',
      skuDetail: 'Management across product categories, styles, colours and sizes',
      accuracyDetail: 'Barcode control and coordinated system workflows',
      inbound: 'Inbound operations',
      returns: 'Returns flow',
    },
  },
  cases: {
    tag: 'SELECTED CASES',
    heading: (brands: string) => `Chosen by ${brands} partner brands`,
    intro:
      'Work spans apparel, lifestyle goods, beauty and accessories, with scenarios across inventory coordination, multi-channel fulfilment, returns inspection and domestic preparation.',
    gallery: 'Selected partner cases. Open a case for its operating context.',
    imageAlt: (name: string) => `${name} operating case`,
    open: 'Open case',
    all: 'View all cases →',
  },
  modal: { close: 'Close case', contact: 'Discuss a similar operation →' },
  fulfillment: {
    tag: 'FULFILMENT FLOW',
    heading: 'From order connection to delivery confirmation, with visible handoffs throughout.',
    intro:
      'Once orders enter the system, warehouse and logistics operations coordinate picking, verification, dispatch and delivery status.',
    steps: [
      ['Order connection', 'Marketplace, live-commerce and ERP orders enter one fulfilment queue.'],
      [
        'Warehouse allocation',
        'Inventory, distance, timing and warehouse workload inform the project route.',
      ],
      [
        'Wave picking',
        'System-created picking waves and location checks support accurate handling.',
      ],
      [
        'Dispatch verification',
        'Items, quantities, sizes and order information are checked before release.',
      ],
      [
        'Packing and handover',
        'Packing is arranged against the confirmed requirements before handover.',
      ],
      [
        'Logistics routing',
        'Logistics routing is coordinated around timing, price and risk requirements.',
      ],
      [
        'Delivery confirmation',
        'Tracking, exceptions and delivery status feed back into the fulfilment loop.',
      ],
    ],
  },
  faq: {
    tag: 'FREQUENTLY ASKED QUESTIONS',
    heading: ['More questions about', 'apparel fulfilment?'],
    intro:
      'Before working together, brands commonly start with service scope, fulfilment needs and operating arrangements.',
    authority:
      'Data notes: Service and operating data on this page draw on XINYIYUAN operating statistics. Details follow the relevant reporting period and operating records.',
    cta: {
      eyebrow: 'PLAN A CONVERSATION',
      heading: ['Shape a fulfilment plan', 'around your operation'],
      description:
        'Whether you are onboarding a new operation, revising an existing setup or improving returns handling, the conversation can start with your products, orders and channels.',
      action: 'Discuss your operation',
      preparationTitle: 'What we can map together',
      preparation: [
        [
          'Warehousing and fulfilment',
          'Discuss inventory control, picking, verification and dispatch against SKU volume, daily orders and peak forecasts.',
        ],
        [
          'Channels and network configuration',
          'Review warehouse needs across e-commerce, store replenishment and domestic preparation.',
        ],
        [
          'Returns and supporting services',
          'Map inspection, garment care, relisting and systems needs against the operating flow.',
        ],
      ],
      condition:
        'An initial outline is enough to begin; service scope and commercial terms are confirmed by project.',
    },
  },
  solutions: {
    tag: 'CORE SOLUTIONS',
    dashboard: 'OTD logistics operations platform · system interface',
    dashboardAlt: 'OTD order and fulfilment dashboard',
    qualityAria: 'Quality-inspection capability with Guangzhou Inspection Group',
    quality: [
      'Quality-control team in partnership with Guangzhou Inspection Group',
      'Inspection follows AQL 1.0–6.5; technicians receive training and certification from experienced Guangzhou Inspection Group instructors.',
    ],
    scenarios: 'Operating scenarios',
    fee: [
      'Commercial note:',
      'System access carries no separate usage fee; implementation, interface coordination and custom development are confirmed by project.',
    ],
    bySlug: {
      'cloud-warehouse': {
        badge: 'Apparel hanging storage',
        caption: ['Climate-controlled storage', 'Classified storage', 'Barcode control'],
        problem: 'As orders grow more complex, brands need fulfilment that understands apparel.',
        scenarios: ['Live commerce', 'Brand retail', 'Physical stores'],
        href: '/en/apparel-fulfillment',
        link: 'Explore apparel fulfilment →',
      },
      'quality-inspection': {
        badge: 'Returns inspection operations',
        caption: ['Appearance check', 'Interior check', 'Accessory check', 'Condition routing'],
        problem:
          'The challenge with a return is deciding whether it can enter the next saleable step.',
        scenarios: [
          'E-commerce returns',
          'Peak-period returns',
          'Store returns',
          'Supplier returns',
        ],
        href: '/en/returns-inspection',
        link: 'Explore returns inspection →',
      },
      'logistics-cloud': {
        badge: 'Digital operations centre',
        caption: [
          'Order fulfilment',
          'Inventory sync',
          'Logistics monitoring',
          'Exception alerts',
          'Delivery feedback',
        ],
        problem:
          'When platform, warehouse and logistics data are separate, fulfilment status is difficult to see clearly.',
        scenarios: [
          'Multi-platform orders',
          'Multi-warehouse coordination',
          'Logistics routing',
          'Exception alerts',
          'System connections',
        ],
        href: '/en/digital-operations',
        link: 'Explore digital operations →',
      },
    },
  },
  digital: {
    name: 'Yundao smart shipping platform',
    subtitle: 'Smart shipping coordination for retail stores',
    features: [
      'Unified carrier connection',
      'Route matching',
      'Forward and return-shipping coordination',
      'Tracking, exception handling and reporting',
    ],
    flow: 'Smart comparison | Nationwide coverage | Dedicated support | Reporting',
    badge: 'Smart shipping platform',
    problem:
      'Store-shipping channels can be fragmented and pricing opaque; teams need one way to coordinate transport resources.',
    description:
      'Information and operating data coordinate transport resources for stores, e-commerce platforms and organisations across outbound and reverse shipping.',
    fee: [
      'Commercial note:',
      'Route availability and quoted terms are confirmed for each shipment plan.',
    ],
    link: 'Explore smart shipping →',
    href: '/en/smart-shipping',
    visual: 'Smart shipping operations flow',
    interfaces: [
      'Logistics waybill management interface',
      'Order-connection interface',
      'Dispatch-alert interface',
      'Dispatch-report interface',
    ],
  },
} as const
