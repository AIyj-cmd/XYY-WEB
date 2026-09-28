export interface EnglishCaseCopy {
  readonly label: string
  readonly name: string
  readonly fullName: string
  readonly category: string
  readonly description: string
  readonly tags: readonly string[]
}

export const ENGLISH_CASE_COPY: Record<string, EnglishCaseCopy> = {
  ur: {
    label: 'Urban Revivo (UR)',
    name: 'UR',
    fullName: 'Urban Revivo (UR)',
    category: 'Fast-fashion womenswear',
    description:
      'Urban Revivo is a Chinese fast-fashion womenswear brand with an international retail presence. XINYIYUAN supports its apparel fulfilment operations.',
    tags: ['Fast-fashion womenswear', 'Apparel fulfilment'],
  },
  maxrieny: {
    label: 'MAXRIENY',
    name: 'MAXRIENY',
    fullName: 'MAXRIENY',
    category: 'Designer womenswear',
    description:
      'MAXRIENY is a Shenzhen designer womenswear brand serving urban professional and social occasions. Its product portfolio includes ready-to-wear, lifestyle and home lines.',
    tags: ['Designer womenswear', 'Inventory and order operations'],
  },
  xingmian: {
    label: 'Xingmian',
    name: 'Xingmian',
    fullName: 'Xingmian',
    category: 'Intimates and essentials',
    description:
      'Xingmian is a Chinese intimates and essentials brand. Its operation combines multi-channel order handling, inspection for new and returned goods, sample dispatch, tracking and returns routing.',
    tags: ['Intimates and essentials', 'Returns operations'],
  },
  meiyi: {
    label: 'MEIYI',
    name: 'MEIYI',
    fullName: 'MEIYI',
    category: 'Cross-border womenswear',
    description:
      'MEIYI is a cross-border womenswear brand. Its integrated B2B and B2C warehousing workflow covers receiving, inspection, preparation, putaway and dispatch.',
    tags: ['Cross-border womenswear', 'B2B and B2C fulfilment'],
  },
  'romi-studio': {
    label: 'ROMI STUDIO',
    name: 'ROMI STUDIO',
    fullName: 'ROMI STUDIO',
    category: 'Live-commerce womenswear',
    description:
      'ROMI STUDIO is a Shenzhen womenswear brand with e-commerce and live-commerce operations. The operation requires responsive replenishment and creator sample dispatch.',
    tags: ['Live-commerce womenswear', 'Flexible replenishment'],
  },
  inman: {
    label: 'Inman',
    name: 'Inman',
    fullName: 'Inman',
    category: 'Natural-fibre lifestyle apparel',
    description:
      'Inman is a natural-fibre lifestyle apparel brand with established online and offline operations. A shared inventory view supports coordinated fulfilment across sales channels.',
    tags: ['Natural-fibre lifestyle apparel', 'Shared inventory'],
  },
}

export const ENGLISH_CASE_FAQS = [
  {
    q: 'What brand scale can XINYIYUAN support? Is there a volume threshold?',
    a: 'There is no fixed volume threshold. Suitability depends on category fit, fulfilment complexity and the sustainability of the proposed collaboration. A growing brand can begin with one warehouse and one category, then expand capacity as its operation develops.',
  },
  {
    q: 'What do the service-timeliness and SLA references in these cases mean?',
    a: 'A service-level agreement sets project-specific service measures in the contract. These can include warehouse dispatch timing, inventory accuracy, returns handling, exception feedback and reporting periods. The final measures are agreed according to the category, order pattern, warehouse network and platform rules.',
  },
  {
    q: 'Where do the brand backgrounds and project data in the cases come from?',
    a: 'Brand names and logos are displayed in line with cooperation relationships. Brand background information comes from public materials, while operating information comes from collaboration records; some details are de-identified. Operational improvements are described against agreed business baselines and verified records where applicable.',
  },
  {
    q: 'How does XINYIYUAN assess whether a brand is suitable before onboarding?',
    a: 'The assessment covers category fit, the operating model, expected SKU and volume profile, and systems-integration feasibility. It considers whether the warehouse can support the required apparel operations, the applicable B2C, B2B, O2O or live-commerce workflow, and the OMS or ERP integration approach. A written proposal is prepared before contracting.',
  },
  {
    q: 'How are orders coordinated when a brand holds inventory at multiple warehouses?',
    a: 'The OTD platform can provide a shared inventory view and order-routing logic across warehouses. Orders are allocated according to agreed rules such as proximity and inventory priority, while inventory is displayed and deducted by warehouse. Operational teams can also help define transfer rules with records retained in the system.',
  },
  {
    q: 'Why do case brands choose XINYIYUAN instead of building their own warehouse or using another 3PL?',
    a: 'Brands commonly seek to avoid the fixed investment and management load of an in-house warehouse, need apparel-specific work such as inspection, repair and size-accurate picking, or require integration with multiple OMS platforms. XINYIYUAN combines apparel focus, its own system capabilities and project-based pricing discussions.',
  },
  {
    q: 'How long does it take for an operation to settle after go-live?',
    a: 'Go-live covers systems integration, inbound setup and process calibration, followed by an optimisation period that reviews order waves, SKU distribution and returns patterns. Once the operation is stable, SLA measures and efficiency indicators are monitored against the agreed project plan.',
  },
  {
    q: 'Can we discuss a case that is close to our own requirements?',
    a: 'Yes. The website displays brand names and logos in line with cooperation relationships; background information is public and operating information comes from collaboration records, with some details de-identified. Tell us about a comparable scenario through the contact form and the commercial team can explain relevant cases and solution scope within what may be shared.',
  },
] as const
