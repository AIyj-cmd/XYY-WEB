import {
  getApprovedCaseClaim,
  getCaseClaimText,
  type CaseClaimKey,
  type CaseClaimPageScope,
} from '@/lib/claims/cases'

type EnglishCaseStat = {
  readonly label: string
  readonly claimKey: CaseClaimKey
}

export interface EnglishCaseCopy {
  readonly label: string
  readonly name: string
  readonly fullName: string
  readonly category: string
  readonly description: (pageScope: CaseClaimPageScope) => string
  readonly stats: readonly EnglishCaseStat[]
  readonly metrics: (pageScope: CaseClaimPageScope) => string
  readonly tags: (pageScope: CaseClaimPageScope) => readonly string[]
}

const claim = (key: CaseClaimKey, pageScope: CaseClaimPageScope) => getCaseClaimText(key, pageScope)

const metric = (label: string, key: CaseClaimKey, pageScope: CaseClaimPageScope) =>
  `${label} ${claim(key, pageScope)}`

export function resolveEnglishCaseStats(
  stats: readonly EnglishCaseStat[],
  pageScope: CaseClaimPageScope
) {
  return stats.map(({ label, claimKey }) => {
    const caseClaim = getApprovedCaseClaim(claimKey, pageScope)
    return { label, value: caseClaim.displayValue, unit: caseClaim.unit }
  })
}

export const ENGLISH_CASE_COPY: Record<string, EnglishCaseCopy> = {
  ur: {
    label: 'Urban Revivo (UR)',
    name: 'UR',
    fullName: 'Urban Revivo (UR)',
    category: 'Fast-fashion womenswear',
    description: (pageScope) =>
      `UR is a leading Chinese fast-fashion womenswear brand. During a Tmall Super Brand Day, its official flagship store grew ${claim('urFlagshipGrowth', pageScope)} year on year; in the mid-year promotion, it ranked ${claim('urMidYearRank', pageScope)}. It has ${claim('urGlobalStores', pageScope)} globally, including in Singapore, Thailand and the Philippines.`,
    stats: [
      { label: 'Total inventory', claimKey: 'urInventory' },
      { label: 'SKU count', claimKey: 'urSkus' },
      { label: 'Warehouse area', claimKey: 'urWarehouseArea' },
      { label: 'Average daily inbound', claimKey: 'urDailyInbound' },
      { label: 'Peak B2C', claimKey: 'urPeakB2c' },
      { label: 'Average daily B2C', claimKey: 'urDailyB2c' },
      { label: 'Average daily B2B', claimKey: 'urDailyB2b' },
      { label: 'Average daily returns', claimKey: 'urDailyReturns' },
    ],
    metrics: (pageScope) =>
      [
        metric('Inventory', 'urInventory', pageScope),
        metric('SKUs', 'urSkus', pageScope),
        metric('Warehouse area', 'urWarehouseArea', pageScope),
        metric('Peak B2C', 'urPeakB2c', pageScope),
      ].join(' · '),
    tags: (pageScope) => [
      `Cooperation since ${claim('urCooperationSince', pageScope)}`,
      'B2C + B2B all-channel operations',
      'Full RFID rollout',
      'Vipshop JIT/JITX',
    ],
  },
  maxrieny: {
    label: 'MAXRIENY',
    name: 'MAXRIENY',
    fullName: 'MAXRIENY',
    category: 'Designer womenswear',
    description: (pageScope) =>
      `MAXRIENY is a Shenzhen designer womenswear brand for independent, urban, highly educated women aged ${claim('maxrienyAudienceAge', pageScope)}. It focuses on refined workplace and social occasions, combining European medieval court fantasy, Baroque art and street style. Spring and summer pieces are priced at ${claim('maxrienySpringSummerPrice', pageScope)}, while autumn and winter pieces are priced at ${claim('maxrienyAutumnWinterPrice', pageScope)}. Its portfolio includes SARAWONG ready-to-wear, lifestyle and HOME lines.`,
    stats: [
      { label: 'Total inventory', claimKey: 'maxrienyInventory' },
      { label: 'SKU count', claimKey: 'maxrienySkus' },
      { label: 'Warehouse area', claimKey: 'maxrienyWarehouseArea' },
      { label: 'Average daily inbound', claimKey: 'maxrienyDailyInbound' },
      { label: 'Average daily B2C', claimKey: 'maxrienyDailyB2c' },
      { label: 'Peak B2C', claimKey: 'maxrienyPeakB2c' },
      { label: 'Average daily B2B', claimKey: 'maxrienyDailyB2b' },
      { label: 'Peak B2B', claimKey: 'maxrienyPeakB2b' },
    ],
    metrics: (pageScope) =>
      [
        metric('Inventory', 'maxrienyInventory', pageScope),
        metric('SKUs', 'maxrienySkus', pageScope),
        metric('Peak B2C', 'maxrienyPeakB2c', pageScope),
        metric('Peak B2B', 'maxrienyPeakB2b', pageScope),
      ].join(' · '),
    tags: () => ['Linked B2C + B2B operations', 'In-warehouse inspection and repair'],
  },
  xingmian: {
    label: 'Xingmian',
    name: 'Xingmian',
    fullName: 'Xingmian',
    category: 'Intimates and essentials',
    description: () =>
      'Xingmian is a representative Chinese intimates-and-essentials brand. XINYIYUAN provides an integrated workflow spanning multi-channel order aggregation, transport-platform connectivity, inspection for new and returned goods, creator sample dispatch, end-to-end order tracking and return-to-factory sorting for defective goods.',
    stats: [
      { label: 'Total inventory', claimKey: 'xingmianInventory' },
      { label: 'SKU count', claimKey: 'xingmianSkus' },
      { label: 'Warehouse area', claimKey: 'xingmianWarehouseArea' },
      { label: 'Average daily inbound', claimKey: 'xingmianDailyInbound' },
      { label: 'Average daily B2C', claimKey: 'xingmianDailyB2c' },
      { label: 'Peak B2C', claimKey: 'xingmianPeakB2c' },
      { label: 'Average daily returns', claimKey: 'xingmianDailyReturns' },
    ],
    metrics: (pageScope) =>
      [
        metric('Inventory', 'xingmianInventory', pageScope),
        metric('SKUs', 'xingmianSkus', pageScope),
        metric('Warehouse area', 'xingmianWarehouseArea', pageScope),
        metric('Peak B2C', 'xingmianPeakB2c', pageScope),
      ].join(' · '),
    tags: () => ['Multi-channel integration', 'Creator sample dispatch', 'Returns inspection'],
  },
  meiyi: {
    label: 'MEIYI',
    name: 'MEIYI',
    fullName: 'MEIYI',
    category: 'Cross-border womenswear',
    description: () =>
      'MEIYI is an apparel brand focused on cross-border, full-category womenswear. XINYIYUAN provides integrated B2B and B2C warehousing, covering receiving and acceptance, new-goods inspection, packing preparation, inventory putaway and dispatch.',
    stats: [
      { label: 'Annual dispatch', claimKey: 'meiyiAnnualDispatch' },
      { label: 'Annual inspection', claimKey: 'meiyiAnnualInspection' },
      { label: 'Annual putaway', claimKey: 'meiyiAnnualPutaway' },
      { label: 'Annual packing', claimKey: 'meiyiAnnualPacking' },
    ],
    metrics: (pageScope) =>
      [
        metric('Annual dispatch', 'meiyiAnnualDispatch', pageScope),
        metric('Annual inspection', 'meiyiAnnualInspection', pageScope),
        metric('Annual putaway', 'meiyiAnnualPutaway', pageScope),
        metric('Annual packing', 'meiyiAnnualPacking', pageScope),
      ].join(' · '),
    tags: () => ['Cross-border operations', 'Inspection + packing + putaway'],
  },
  'romi-studio': {
    label: 'ROMI STUDIO',
    name: 'ROMI STUDIO',
    fullName: 'ROMI STUDIO',
    category: 'Live-commerce womenswear',
    description: (pageScope) =>
      `ROMI STUDIO is a Chinese minimalist, accessible-luxury womenswear brand founded in ${claim('romiFounded', pageScope)} and headquartered in Shenzhen. It entered e-commerce in ${claim('romiEcommerceEntry', pageScope)}. The published case records ${claim('romiDouyinGmv', pageScope)} on Douyin in ${claim('romiDouyinGmvYear', pageScope)}, when it ranked ${claim('romiDouyinRank', pageScope)}.`,
    stats: [
      { label: 'Average daily outbound', claimKey: 'romiDailyOutbound' },
      { label: 'Fulfilment capability', claimKey: 'romiReplenishment' },
      { label: 'Livestream service', claimKey: 'romiSampleDispatch' },
    ],
    metrics: (pageScope) =>
      [
        metric('Average daily outbound', 'romiDailyOutbound', pageScope),
        claim('romiReplenishment', pageScope),
        claim('romiSampleDispatch', pageScope),
      ].join(' · '),
    tags: () => ['Live-commerce', 'Fast replenishment', 'Creator sample dispatch'],
  },
  toyouth: {
    label: 'TOYOUTH',
    name: 'TOYOUTH',
    fullName: 'TOYOUTH',
    category: 'Original designer womenswear',
    description: (pageScope) =>
      `TOYOUTH is a popular Chinese original-designer womenswear brand founded in ${claim('toyouthFounded', pageScope)} and part of Huimei Group. It is known for an independent design style and denim collections with innovative tiered design.`,
    stats: [
      { label: 'Inventory management', claimKey: 'toyouthInventoryManagement' },
      { label: 'Brand operations', claimKey: 'toyouthBrandOperation' },
    ],
    metrics: () =>
      'Unified all-channel inventory management · Synchronized multi-platform dispatch',
    tags: () => ['All-channel unified inventory pool', 'Online and offline integration'],
  },
  inman: {
    label: 'Inman',
    name: 'Inman',
    fullName: 'Inman',
    category: 'Natural-fibre lifestyle apparel',
    description: () =>
      'Inman is a natural-fibre lifestyle apparel brand with established online and offline operations. A shared inventory view supports coordinated fulfilment across sales channels.',
    stats: [
      { label: 'Inventory management', claimKey: 'inmanInventoryManagement' },
      { label: 'Fulfilment capability', claimKey: 'inmanFulfilment' },
    ],
    metrics: (pageScope) =>
      [claim('inmanInventoryManagement', pageScope), claim('inmanFulfilment', pageScope)].join(
        ' · '
      ),
    tags: () => ['Natural-fibre lifestyle apparel'],
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
