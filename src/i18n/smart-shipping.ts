import type { SiteLocale } from './routes'

const english = {
  signature: {
    code: 'DELIVERY OPERATIONS',
    kicker: 'Smart shipping coordination desk',
    heading: 'Coordinate shipping from request through delivery and exception follow-up',
    summary:
      'Carrier choices, waybills, tracking, delivery confirmation, exceptions and reporting are coordinated through one operating entry instead of separate lookup tools.',
  },
  hero: {
    videoAria: 'Smart shipping platform service video',
    primaryAction: 'Discuss a shipping plan',
    secondaryAction: 'Explore services',
  },
  delivery: {
    consoleLabel: 'Waybill management / operating interface',
    imageAlt: 'Smart shipping platform waybill-management interface',
    caption:
      'Query carrier, source platform, transport status and latest tracking event in one place',
  },
  experience: {
    detailTitle:
      'Keep carrier selection, shipping status and exception handling in one operating flow',
    linksAria: 'Related services',
    linksHeading: 'Explore next',
    links: [
      { href: '/en/services', label: 'Services overview' },
      { href: '/en/cases', label: 'Selected cases' },
      { href: '/en/contact', label: 'Contact the team' },
    ],
    faqHeading: 'Smart shipping platform FAQs',
    useConversion: {
      eyebrow: 'START A CONVERSATION',
      heading: ['Turn smart shipping', 'into an operating plan'],
      description:
        'Share store count, shipping routes and typical volume so a shipping-coordination plan can be assessed.',
      action: 'Discuss a shipping plan',
      preparationTitle: 'Useful starting information',
      preparationAria: 'Information to prepare for a smart shipping discussion',
      preparation: [
        { label: 'Current shipping flow', detail: 'Current carriers and operating constraints' },
        {
          label: 'Routes and volume',
          detail: 'Typical routes, shipment types and expected volume',
        },
        {
          label: 'Objectives and timing',
          detail: 'Coordination priorities and intended start timing',
        },
      ],
    },
  },
  operations: {
    heading: ['What an operator needs to see is', 'where each shipment is now.'],
    intro:
      'Orders, waybills, tracking, delivery confirmation and exceptions no longer sit across separate lookup points; the interface supports daily work while the flow carries each result forward.',
    figures: [
      [
        'Shipment and request information in one place',
        'Exception events visible sooner',
        'Shipping results retained as reporting',
      ],
      [
        'Smart shipping platform order-information interface',
        'Smart shipping platform dispatch-alert interface',
        'Smart shipping platform reporting interface',
      ],
    ],
    flow: {
      heading: 'How does a shipment move through the flow?',
      note: 'From request intake to retained results, six stages represent distinct operating states.',
      steps: [
        [
          '01',
          'Request intake',
          'A store or organisation submits a shipping, transfer or return-to-warehouse request.',
        ],
        [
          '02',
          'Information check',
          'Confirm address, volume, service type and operating requirements.',
        ],
        [
          '03',
          'Plan matching',
          'Match a carrier plan around route, quoted terms and timing requirements.',
        ],
        ['04', 'Booking and handover', 'Create the waybill and complete pickup or handover.'],
        [
          '05',
          'Status tracking',
          'Follow tracking, delivery confirmation and transport exceptions.',
        ],
        ['06', 'Result record', 'Retain work orders and shipping data for later review.'],
      ],
    },
    scenarios: {
      heading: 'Three common connection scenarios',
      items: [
        [
          'Chain stores',
          'Daily shipping, store transfers, seasonal return-to-warehouse and multi-store coordination.',
        ],
        [
          'E-commerce operations',
          'Platform dispatch, after-sales returns and coordination across outbound and reverse logistics.',
        ],
        [
          'Organisations',
          'Documents, samples, materials and batch-shipping requests handled through one flow.',
        ],
      ],
    },
  },
} as const

export const smartShippingCopy = (locale: SiteLocale) => (locale === 'en' ? english : undefined)
