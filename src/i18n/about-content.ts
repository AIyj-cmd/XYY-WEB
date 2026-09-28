import { ABOUT_FAQS, ABOUT_HISTORY } from '@/data/about'
import { HONOR_CMS_SOURCE } from '@/data/brand/organization'
import type { AboutHistoryItem } from '@/data/about'
import type { FaqItem } from '@/lib/directus'
import { CLAIM_TEXT } from '@/lib/claims'
import { englishClaim } from '@/i18n/claims'

const reportAboutOmission = (scope: string, key: string) =>
  console.warn(`[i18n:about] omitted ${scope}: ${key}`)

export const ABOUT_OVERVIEW_SOURCE =
  '新亦源供应链总部位于广州，是专注鞋服垂直领域的云仓服务商。公司以鞋服为核心，延伸服务潮玩、美妆、箱包、IT电子、快消、医药、安防、智能家居等行业，围绕鞋服质检中心、鞋服仓配中心和商圈寄件平台“运到”构建一体化服务能力。'
export const ABOUT_OVERVIEW_EN =
  'Based in Guangzhou, XINYIYUAN Supply Chain focuses on warehousing, inspection, fulfilment and returns operations for apparel. Its operating scope also supports adjacent consumer categories through apparel quality control, fulfilment and smart-shipping coordination.'

export const ABOUT_CONTENT_FALLBACK = {
  overview: `${ABOUT_OVERVIEW_SOURCE}目前合作品牌${CLAIM_TEXT.partnerBrands}、服务门店${CLAIM_TEXT.servedStores}、覆盖${CLAIM_TEXT.coveredCities}城市、管理SKU ${CLAIM_TEXT.managedSkus}。`,
  heroDescription: `从仓储质检到履约交付，我们为鞋服品牌提前解决出货链路中的复杂问题。\n15年、${CLAIM_TEXT.employeeCount}名员工、${CLAIM_TEXT.warehouseArea}直营仓储，只为一件事：让发货更准确、高效、快捷。`,
}

const historyCopy: Record<string, [string, string]> = {
  'history-team-founded': [
    'Starting point · Team founded',
    'The team was founded in Guangzhou and began focusing on apparel logistics and fulfilment.',
  ],
  'history-angel-investment': [
    'Foundation · Angel investment',
    'Angel investment supported specialised logistics operations for apparel customers.',
  ],
  'history-strategic-positioning': [
    'Focus · Strategic positioning',
    'The company established its apparel warehouse focus and standard fulfilment procedures.',
  ],
  'history-series-a': [
    'Growth · Series A',
    'Series A funding supported a national logistics-centre layout and connected online and offline operations.',
  ],
  'history-three-pillars': [
    'Coordination · Three operating pillars',
    'The business developed vertically integrated capabilities and regional after-sales inspection services.',
  ],
  'history-pre-a': [
    'Growth · Pre-A',
    'A Pre-A round and listed-company participation launched the Morning Star management programme.',
  ],
  'history-otd-launch': [
    'Upgrade · OTD launch',
    'The OTD operations platform launched, with workforce and store-distribution tools upgraded.',
  ],
  'history-digital-upgrade': [
    'Focus · Digital upgrade',
    'The company deepened its apparel focus and advanced digital warehouse operations.',
  ],
  'history-cross-border': [
    'Expansion · Digital-intelligence upgrade',
    'Cross-border preparation and a management-development system became part of the operating plan.',
  ],
  'history-huawei-management': [
    'Progress · Management upgrade',
    'Huawei management practices were introduced to strengthen operating management for long-term development.',
  ],
}

export function translateAboutHistory(items: AboutHistoryItem[]): AboutHistoryItem[] {
  return items.flatMap((item) => {
    const source = ABOUT_HISTORY.find(
      (candidate) =>
        candidate.year === item.year &&
        candidate.subtitle === item.subtitle &&
        candidate.text === item.text
    )
    const copy = source?.contentKey ? historyCopy[source.contentKey] : undefined
    if (!source || !copy) {
      reportAboutOmission('history', item.contentKey || item.year)
      return []
    }
    return [{ ...item, subtitle: copy[0], text: copy[1] }]
  })
}

const honorCopy: Record<string, string> = {
  'honor-cflp-council-member': 'CFLP Apparel Logistics Branch · First Council Member Unit',
  'honor-cflp-industry-contribution':
    'CFLP · Apparel Logistics Industry Contribution Enterprise (2019)',
  'honor-zhangjiang-association':
    'Shanghai Zhangjiang Labour and Personnel Association · Member Unit',
  'honor-cflp-thank-you': 'CFLP Apparel Logistics Branch · First Council Letter of Appreciation',
  'honor-textile-chamber-member':
    'All-China Federation of Industry and Commerce Textile and Apparel Chamber · Member Unit',
  'honor-footwear-supply-chain-contribution':
    'Global Footwear and Apparel Supply Chain & Logistics Technology Seminar · Outstanding Contribution Award',
  'honor-cmb-payroll':
    'China Merchants Bank Guangzhou Branch · 2024 Payroll and Benefits Model Enterprise',
  'honor-haier-gold-supplier': 'Haier Smart Home · 2019 Gold Supply Chain Operator',
  'honor-guangdong-digitalization':
    'Guangdong Logistics Association · Outstanding Information-technology Enterprise',
  'honor-ctta-recommended':
    'China Communications and Transportation Association · Recommended Enterprise Award',
  'honor-footwear-logistics-provider':
    'Global Footwear and Apparel Supply Chain & Logistics Seminar · Outstanding Logistics Service Provider',
  'honor-cflp-logistics-council':
    'CFLP China Federation of Logistics and Purchasing Apparel Logistics Branch · Council Member Unit',
  'honor-fashion-logistics-support':
    'Fashion Logistics Alliance · Strong Support for the 2017 Double 11 China Tour',
  'honor-tax-credit-a': 'Guangzhou Tax Bureau · Grade A Tax Credit Certificate (2022)',
  'honor-logistics-festival-top-ten':
    '11th International Logistics Festival · Top Ten Logistics Enterprise Award',
}

export function translateAboutHonors(items: { title: string; image: string }[]) {
  return items.flatMap((item) => {
    const source = HONOR_CMS_SOURCE.find((candidate) => candidate.title === item.title)
    if (!source || !honorCopy[source.contentKey]) {
      reportAboutOmission('honor', item.title)
      return []
    }
    return [{ ...item, title: honorCopy[source.contentKey] }]
  })
}

export const translateAboutOverview = (overview: string) =>
  overview === ABOUT_CONTENT_FALLBACK.overview ? ABOUT_OVERVIEW_EN : ''

const faqCopy: Record<string, [string, string]> = {
  'faq-about-01': [
    'What service timing does XINYIYUAN use?',
    `Warehouse fulfilment follows ${englishClaim('shippingSla', 'about')}. Returns inspection and relisting are completed within ${englishClaim('returnTurnaround', 'about')}, and shipping accuracy is ${englishClaim('shippingAccuracy', 'about')}. Inbound, inspection, monitoring retention and exception-handling procedures are confirmed in the project service plan.`,
  ],
  'faq-about-02': [
    'What are XINYIYUAN’s key development milestones?',
    'The team was founded in 2011. Subsequent milestones include angel investment, an apparel-warehouse operating focus, Series A and Pre-A funding, the OTD platform launch, warehouse digitalisation and cross-border preparation. The history section on this page presents the reviewed milestones in sequence.',
  ],
  'faq-about-03': [
    'How is the warehouse network organised?',
    'The network uses central, regional and origin-warehouse roles. South China covers Guangzhou, Dongguan, Foshan and Zhaoqing; East China covers Shanghai, Kunshan and Hefei. The locations on this page are coordinated by shipment volume, product characteristics, capacity and dispatch needs; active locations and operating scope are confirmed before project launch.',
  ],
  'faq-about-04': [
    'Which certifications and technical qualifications are available?',
    'Public materials include Grade A tax credit, Guangdong science-and-technology SME status, and a digital warehouse-control capability under the integration of industrialisation and informationisation management system. Inspection is carried out with a QC team working with Guangzhou Inspection Group under agreed AQL rules. Supporting documents can be requested during commercial discussions, subject to their current validity.',
  ],
  'faq-about-05': [
    'Which brands and operating cases can be reviewed?',
    `XINYIYUAN supports womenswear, menswear, childrenswear, footwear and sports-outdoor brands, including marketplace sellers, livestream brands, cross-border independent stores and store-supply-chain customers. Reviewed cases include peak-sale support at up to ${englishClaim('singleWarehousePeak', 'about')} for one warehouse and projects connected to Vipshop JIT and JITX.`,
  ],
  'faq-about-06': [
    'How is warehouse staffing prepared for peak periods?',
    'Core teams handle systems, inspection management and shift management. Flexible staffing is trained and scheduled against forecast volume. Peak-period coverage, staffing and project capacity are confirmed against warehouse capacity, orders and logistics resources.',
  ],
  'faq-about-07': [
    'Can I arrange a warehouse visit?',
    'Brand customers and partners can arrange a visit through the website contact form or business phone line. A visit can include warehouse operations, a systems demonstration, inspection workflows and service-team discussions. Some locations require a visitor agreement for warehouse safety.',
  ],
  'faq-about-08': [
    'How are data security and inventory confidentiality handled?',
    'WMS and customer OMS/ERP access is separated by brand account and permission. Operating logs remain traceable, and confidentiality terms can be agreed for customer inventory, volume and order data. Access, retention and confidentiality responsibilities follow the project agreement.',
  ],
}

export function translateAboutFaqs(items: FaqItem[]): FaqItem[] {
  return items.flatMap((item) => {
    const source = ABOUT_FAQS.find((candidate) => candidate.q === item.q && candidate.a === item.a)
    const copy = source ? faqCopy[source.contentKey] : undefined
    if (!copy) {
      reportAboutOmission('faq', source?.contentKey || 'unknown')
      return []
    }
    return [{ q: copy[0], a: copy[1] }]
  })
}
