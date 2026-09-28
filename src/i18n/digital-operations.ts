export const DIGITAL_OPERATIONS_ENGLISH = {
  title: 'Logistics digital operations | Order, inventory and fulfilment coordination',
  description:
    'A logistics control layer that connects order, inventory, warehouse execution, tracking and delivery status for coordinated fulfilment.',
  breadcrumb: 'Digital operations',
  hero: {
    heading: ['Orders, inventory', 'and fulfilment, in sync.'],
    lead: 'Not another back office: a way to make existing order, warehouse and logistics information visible, connected and traceable.',
    action: 'Discuss a systems connection',
    actionAria: 'Discuss a systems connection',
    imageAlt: 'XINYIYUAN logistics control layer order and fulfilment dashboard',
    caption: 'Order, warehouse and logistics status dashboard',
  },
  modules: {
    heading: ['One fulfilment flow,', 'not a set of disconnected systems.'],
    intro:
      'Capability is arranged around the journey from an order entering the warehouse to completed delivery, reducing status gaps instead of adding tools.',
  },
  chain: {
    imageAlt: 'System architecture for coordinated logistics operations',
    heading: ['Keep operating status', 'moving continuously forward.'],
  },
  proof: {
    eyebrow: 'DIGITAL OPERATIONS',
    heading: ['Discuss your', 'integration needs'],
    description:
      'Connection method, data fields, permission scope and implementation timeline are confirmed against the operating flow and project plan.',
    action: 'Discuss a systems connection',
    preparationAria: 'Information to prepare for a systems connection discussion',
    preparation: [
      { label: 'Connection method', detail: 'Existing systems and interface arrangement' },
      { label: 'Data fields', detail: 'Data that needs to be connected' },
      {
        label: 'Permissions and implementation timeline',
        detail: 'Permission requirements and project arrangement',
      },
    ],
  },
  modulesList: [
    [
      '01',
      'Order coordination',
      'Bring platform, store and enterprise orders into one fulfilment queue.',
    ],
    [
      '02',
      'Inventory status',
      'Review inventory and saleable status by item, location and channel.',
    ],
    [
      '03',
      'Warehouse execution',
      'Connect receiving, put-away, picking, checking, packing and dispatch status.',
    ],
    [
      '04',
      'Logistics fulfilment',
      'Bring together waybills, tracking, delivery confirmation and exception status.',
    ],
    [
      '05',
      'Exception loop',
      'Keep identification, handling and feedback records in a traceable path.',
    ],
    [
      '06',
      'Interface configuration',
      'Support Qimen, EDI, API and project-confirmed custom interfaces.',
    ],
  ],
  chainSteps: [
    [
      'Order intake',
      'Orders from platforms, stores and business systems enter one fulfilment queue.',
    ],
    ['Warehouse execution', 'Inventory, operations and checking status update through processing.'],
    [
      'Logistics feedback',
      'Waybill, tracking, delivery and exception results return to the business flow.',
    ],
  ],
} as const
