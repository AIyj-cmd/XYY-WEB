import { englishClaim } from '@/i18n/claims'
import { CLAIM_TEXT } from '@/lib/claims'
import type { EnglishServiceSource } from './service-sources'
import { sourceContent } from './service-sources'

const C = CLAIM_TEXT
const E = (key: Parameters<typeof englishClaim>[0]) => englishClaim(key, 'service:houzheng-xiufu')
const sourceStats = [
  { stat: C.repairSuccessRate, label: '瑕疵修复成功率', sub: '专属9区修复分区' },
  { stat: C.recognizableAnomalies, label: '可识别缺陷', sub: '7大类缺陷覆盖' },
  { stat: C.returnTurnaround, label: '质检+二次上架', sub: '整体流程' },
  { stat: C.returnInspectionAnnual, label: '年退货质检量', sub: '公司运营统计' },
]
const englishStats = [
  {
    stat: E('repairSuccessRate'),
    label: 'Repair success rate',
    sub: 'Nine specialist repair areas',
  },
  {
    stat: E('recognizableAnomalies'),
    label: 'Recognisable issue types',
    sub: 'Seven issue categories in scope',
  },
  { stat: E('returnTurnaround'), label: 'Inspection and re-listing', sub: 'Overall workflow' },
  {
    stat: E('returnInspectionAnnual'),
    label: 'Annual returns-inspection volume',
    sub: 'Company operating statistic',
  },
]
const sourceFeatures = [
  {
    title: '清污处理',
    desc: '使用相应设备和处理方案应对粉底印、锈斑、油渍、领口发黄等已确认异常，并根据面料特点控制工艺，结果以二次质检为准。',
  },
  {
    title: '面料修复',
    desc: '针对起毛起球、抽纱、破洞等异常进入对应修复流程，结合商品材质和客户标准评估处理方式，完成后复检。',
  },
  {
    title: '缝线修复',
    desc: '处理断线、爆口、跳线等异常，按商品线色和工艺要求完成修复，并依据客户确认标准复检。',
  },
  {
    title: '配饰修复',
    desc: '针对掉钻等配饰异常进行处理，所需配件由品牌提供或确认，完成后按约定验收要求复检。',
  },
  {
    title: '鞋类专项修复',
    desc: '针对开胶等已确认异常进入鞋类修复专区，按确认工艺完成处理后进行二次质检。',
  },
  {
    title: '标识与异味处理',
    desc: '处理吊牌与码唛不一致、潮湿异味等异常，完成标识核对或异味处理后，按客户确认标准进入后续流程。',
  },
]
const englishFeatures = [
  {
    title: 'Spot cleaning',
    desc: 'Use the relevant equipment and method for confirmed stains, rust marks, oil marks or collar yellowing; material characteristics and re-inspection govern the outcome.',
  },
  {
    title: 'Fabric repair',
    desc: 'Pilling, snagging and holes enter the relevant repair workflow. The method is assessed against material and customer standards, then rechecked.',
  },
  {
    title: 'Stitch repair',
    desc: 'Repair broken thread, seam opening and skipped stitches around the item thread colour and process requirements, then recheck against customer standards.',
  },
  {
    title: 'Accessory repair',
    desc: 'Treat confirmed accessory issues such as missing stones. Parts are supplied or confirmed by the brand and the result is rechecked as agreed.',
  },
  {
    title: 'Footwear repair',
    desc: 'Confirmed issues such as sole separation enter the footwear repair area and receive a second inspection after the agreed treatment.',
  },
  {
    title: 'Labels and odour handling',
    desc: 'Check inconsistent tags or labels and treat damp odour, then route the item under the customer-approved standard.',
  },
]
const sourceFaqs = [
  {
    q: '后整修复包含哪些具体服务？',
    a: '后整修复服务分为6类，实际设置9个专业修复专区。已确认异常示例包括粉底印、锈斑、油渍、领口发黄、起毛起球、抽纱、破洞、断线、爆口、跳线、掉钻、开胶、吊牌与码唛不一致、潮湿异味。修复后统一二次质检，具体标准按客户销售渠道定制。',
  },
  {
    q: '新亦源的瑕疵修复成功率是多少？',
    a: `根据新亦源运营统计，瑕疵修复成功率为${C.repairSuccessRate}，指进入修复流程的商品中，经处理和二次质检后达到品牌约定上架等级的比例。商品是否达到二次上架标准，具体按客户销售渠道定制。`,
  },
  {
    q: '后整修复和退货质检是什么关系？',
    a: `两者通常联动运行。退货质检先对商品进行缺陷识别和A/B+/B-/C分级，需要处理的商品会流转至后整修复专区；修复完成后再做二次质检。具体分级与处置标准按客户销售渠道定制，质检、修复与二次上架在${C.returnTurnaround}流程内完成。`,
  },
  {
    q: '高档服装（真丝/羽绒/皮草）可以修复吗？',
    a: '需要先评估材质、瑕疵类型和品牌标准。针对真丝、羽绒或皮草等高价值商品，新亦源会在处理前与品牌确认工艺、风险和验收规则；不适合仓内修复的商品将按品牌授权分流。',
  },
  {
    q: '修复后货品的质量由谁保证？',
    a: '修复后需按品牌确认的质检标准进行二次质检，通过后才可上架；项目可采用AQL抽检规则及A/B+/B-/C分级设置判定方式。未通过商品按约定继续修复或转入相应等级，关键操作记录可按项目约定用于追溯。',
  },
]
const englishFaqs = [
  {
    q: 'Which services are included in garment care and repair?',
    a: 'The service covers six repair types in nine specialist areas, including cleaning, fabric and stitch repair, accessories, footwear, labels and odour handling. Each completed item receives a second inspection under customer-approved standards.',
  },
  {
    q: 'What is the reported repair success rate?',
    a: `The company operating statistic is ${E('repairSuccessRate')}: the share of items entering repair that reach the brand-agreed listing grade after treatment and re-inspection. It is not a guarantee for each item or batch.`,
  },
  {
    q: 'How do garment care and returns inspection work together?',
    a: `Returns inspection identifies issues and may use A, B+, B- and C routing. Items requiring treatment can enter repair, then receive a second inspection within the ${E('returnTurnaround')} workflow; rules are agreed by the customer.`,
  },
  {
    q: 'Can high-value silk, down or fur garments be repaired?',
    a: 'Material, issue type and brand rules are assessed first. The process, risk and acceptance rules are agreed with the brand; items unsuitable for in-warehouse repair are routed as authorised.',
  },
  {
    q: 'Who assures quality after repair?',
    a: 'The item must pass a second inspection against the brand-approved standard before re-listing. Projects can use AQL sampling and A, B+, B- and C routing; key records can support agreed traceability.',
  },
]
export const REPAIR_ENGLISH_SOURCE: EnglishServiceSource = {
  source: sourceContent(
    {
      title: `服装瑕疵修复｜9大修复专区，修复成功率${C.repairSuccessRate}｜新亦源`,
      description: `新亦源服装瑕疵修复设9个专区，覆盖清污、缝补、配饰、熨烫、鞋类修复、干湿洗和补换标识；修复成功率${C.repairSuccessRate}，完成后二次质检。`,
      breadcrumbLabel: '后整修复',
      eyebrow: '服装瑕疵修复 · 九大专业分区',
      h1: '服装瑕疵修复与二次上架',
      h1sub: `瑕疵修复成功率${C.repairSuccessRate}，专属9区修复分区`,
      heroDesc:
        '根据新亦源运营统计，后整修复服务分为6类，实际设置9个专业修复专区；修复完成后进行二次质检，并按客户确认标准进入后续流程。',
      imgSrc: '/w-post-processing.webp',
      imgAlt: '后整修复 — 专业服装瑕疵修复',
      contentDesc: `适合需要对退货商品进行分级、修复和二次利用的鞋服品牌。后整修复服务分为6类，实际设置自动熨烫、手工熨烫、异味晾晒、手工清污、配饰修复、缝补、鞋类修复、干湿洗、补换标识9个专业修复专区。根据新亦源运营统计，修复成功率${C.repairSuccessRate}；具体标准按客户销售渠道定制。`,
      featuresLabel: '修复服务类型',
    },
    sourceStats,
    sourceFeatures
  ),
  english: sourceContent(
    {
      title: `Garment care and repair | Nine specialist repair areas`,
      description: `Garment care and repair covers cleaning, stitching, accessories, pressing, footwear repair, dry and wet cleaning, and label replacement. Reported repair success rate: ${E('repairSuccessRate')}.`,
      breadcrumbLabel: 'Garment care and repair',
      eyebrow: 'Garment care and repair · nine specialist areas',
      h1: 'Garment care, repair and re-listing',
      h1sub: `Reported repair success rate ${E('repairSuccessRate')} across nine specialist areas`,
      heroDesc:
        'The service has six repair categories across nine specialist areas. Each completed item receives a second inspection and proceeds under customer-approved standards.',
      imgSrc: '/w-post-processing.webp',
      imgAlt: 'Specialist garment care and repair',
      contentDesc: `For apparel and footwear brands needing returns grading, repair and reuse. The reported repair success rate is ${E('repairSuccessRate')}; conditions are tailored to the customer sales channel.`,
      featuresLabel: 'Repair services',
    },
    englishStats,
    englishFeatures
  ),
  sourceFaqs,
  englishFaqs,
}
