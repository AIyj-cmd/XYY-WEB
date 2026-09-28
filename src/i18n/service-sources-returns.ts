import { CLAIM_TEXT } from '@/lib/claims'
import { englishClaim } from '@/i18n/claims'
import type { EnglishServiceSource } from './service-sources'
import { sourceContent } from './service-sources'

const C = CLAIM_TEXT
const E = (key: Parameters<typeof englishClaim>[0]) => englishClaim(key, 'service:tuihuo-zhijian')
const sourceStats = [
  { stat: C.returnInspectionAnnual, label: '年退货质检量', sub: '据公司运营统计' },
  { stat: C.recognizableAnomalies, label: '可识别缺陷', sub: '7大类全场景覆盖' },
  { stat: C.returnTurnaround, label: '质检+二次上架', sub: '整体流程' },
  { stat: 'AQL 1.0–6.5', label: '质检执行范围', sub: '与广检集团合作QC团队' },
]
const englishStats = [
  {
    stat: E('returnInspectionAnnual'),
    label: 'Annual returns-inspection volume',
    sub: 'Company operating statistic',
  },
  {
    stat: E('recognizableAnomalies'),
    label: 'Recognisable issue types',
    sub: 'Seven issue categories in scope',
  },
  { stat: E('returnTurnaround'), label: 'Inspection and re-listing', sub: 'Overall workflow' },
  {
    stat: 'AQL 1.0–6.5',
    label: 'Inspection execution range',
    sub: 'QC team working with Guangdong Testing Institute',
  },
]
const sourceFeatures = [
  {
    title: '四级质检评定示例',
    desc: 'A/B+/B-/C四级可用于展示质检分流思路，具体判定条件和处置方式按客户确认标准执行。',
  },
  {
    title: '服装专项检查',
    desc: '重点核查吊牌完整/跳针/开裂/污损/变色/少配饰等，对样比对确认与商品描述一致性，洗水/色牢度/缩率抽样测试。',
  },
  {
    title: '鞋类专项检查',
    desc: `检查大小脚/色差/溢胶/开胶/脏污等，鞋类修复含清洗/粘合/除味，修复成功率${C.repairSuccessRate}。`,
  },
  {
    title: 'AQL质检规则',
    desc: '与广检集团合作QC团队，按AQL 1.0–6.5执行；具体AQL水平、样本量、缺陷分类、判定方式和报告格式按商品价值、渠道及客户标准确定。',
  },
  {
    title: '全程视频举证',
    desc: '1080P高清拆包监控全程录像，每个质检动作可追溯，支持电商平台退货争议举证，品牌维权有依据。',
  },
  {
    title: '修复联动上架',
    desc: `质检后B-级商品流转至9区修复车间，修复完成后在WMS中更新状态并重新上架，全流程${C.returnTurnaround}内闭环。`,
  },
]
const englishFeatures = [
  {
    title: 'Four-grade inspection example',
    desc: 'A, B+, B- and C illustrate inspection routing; decision criteria and handling follow the customer-approved standard.',
  },
  {
    title: 'Apparel inspection',
    desc: 'Check tags, stitching, damage, staining, colour change and accessories; compare samples and use agreed wash, colour-fastness or shrinkage checks.',
  },
  {
    title: 'Footwear inspection',
    desc: `Check paired sizing, colour variation, excess adhesive, separation and staining. Footwear repair can include cleaning, bonding and odour treatment; the reported repair success rate is ${E('repairSuccessRate')}.`,
  },
  {
    title: 'AQL inspection rules',
    desc: 'The QC team works to AQL 1.0–6.5. The AQL level, sample size, issue categories, decision method and report format are confirmed for product value, channel and customer standards.',
  },
  {
    title: 'Video evidence',
    desc: '1080P unpacking monitoring records the process. Inspection actions can be traced and used as evidence for e-commerce returns disputes where agreed.',
  },
  {
    title: 'Repair routing and re-listing',
    desc: `B- items may route to the nine-area repair workshop. After repair, WMS status is updated and the item is re-listed after re-inspection within the ${E('returnTurnaround')} workflow.`,
  },
]
const sourceFaqs = [
  {
    q: '退货质检的AQL标准是什么意思？',
    a: 'AQL（Acceptable Quality Limit，可接受质量限）用于抽样检验方案。新亦源与广检集团合作QC团队，按AQL 1.0–6.5执行；具体AQL水平、样本量、缺陷分类、判定方式和报告格式按商品价值、渠道及客户标准确定。',
  },
  {
    q: '质检发现问题后货品怎么处理？',
    a: 'A/B+/B-/C四级用于展示质检分流示例，具体判定条件和处置方式按客户确认标准执行。需要隔离的商品，按品牌方确认方案进行隔离、退回或其他处置。',
  },
  {
    q: '退货质检多长时间完成？',
    a: `退货处理包含入库登记、拆包核对、质检分级、异常标注、修复分流和二次上架，${C.returnTurnaround}，平均拆包4小时、质检12小时。旺季或大批量退件应提前确认到仓计划、质检标准和处理资源。`,
  },
  {
    q: '退货质检能识别哪些具体缺陷？',
    a: `7大类${C.recognizableAnomalies}缺陷：①污渍（油污/颜色污染/霉点等）；②面料外观（起球/勾丝/破洞/褪色等）；③缝线（跳针/脱线/开线等）；④纽扣配件（缺纽扣/拉链故障/五金氧化等）；⑤后工艺印绣（印花脱落/绣花脱线/烫标翘边等）；⑥吊牌标识（吊牌缺失/水洗标脱落/条码错误等）；⑦异味（霉味/化学气味等）。`,
  },
  {
    q: '新货质检（非退货）新亦源也能做吗？',
    a: `可以。新亦源可按品牌要求提供新货入库全检或抽检、洗水测试、色牢度检验、缩率测试和对样比对等服务。全年新货质检量${C.newGoodsInspectionAnnual}；具体项目需分别确认验货比例、判定标准和处理时效。`,
  },
]
const englishFaqs = [
  {
    q: 'What does the AQL standard mean for returns inspection?',
    a: 'AQL, or Acceptable Quality Limit, is used for sampling inspection. The QC team works to AQL 1.0–6.5; the level, sample size, issue categories, decision method and report format are confirmed for product value, channel and customer standards.',
  },
  {
    q: 'How are items handled when inspection finds an issue?',
    a: 'A, B+, B- and C illustrate inspection routing. The applicable criteria and handling follow the customer-approved standard. Items requiring isolation are isolated, returned or otherwise handled as authorised by the brand.',
  },
  {
    q: 'How long does returns inspection take?',
    a: `Returns handling covers receipt registration, unpacking, inspection, issue marking, repair routing and re-listing within the ${E('returnTurnaround')} workflow. Peak periods and large volumes require an agreed arrival plan, standard and resource arrangement.`,
  },
  {
    q: 'Which issues can returns inspection identify?',
    a: `The ${E('recognizableAnomalies')} cover stains; fabric appearance; stitching; buttons and accessories; printing and embroidery; tags and identifiers; and odour. The exact inspection scope follows the agreed project rules.`,
  },
  {
    q: 'Can XINYIYUAN inspect new goods as well as returns?',
    a: `Yes. New goods may use full or sample inbound inspection, wash, colour-fastness, shrinkage and sample-comparison services to the agreed project scope. The annual new-goods inspection volume is ${E('newGoodsInspectionAnnual')}; acceptance rules and timing are confirmed separately.`,
  },
]
export const RETURNS_ENGLISH_SOURCE: EnglishServiceSource = {
  source: sourceContent(
    {
      title: `服装退货质检｜${C.recognizableAnomalies}异常识别，${C.returnTurnaround}二次上架｜新亦源`,
      description: `新亦源服装退货质检可识别7大类${C.recognizableAnomalies}异常，按品牌确认规则进行A/B+/B-/C分级，退货质检与二次上架${C.returnTurnaround}完成。`,
      breadcrumbLabel: '退货质检',
      eyebrow: '服装退货质检 · 与广检集团合作QC团队 · 按AQL 1.0–6.5执行',
      h1: '服装退货质检与二次上架服务',
      h1sub: `${C.recognizableAnomalies}异常识别，A/B+/B-/C四级管理`,
      heroDesc: `新亦源配置与广检集团合作QC团队，按AQL 1.0–6.5执行；质检技师经广检集团资深讲师培训认证。服务覆盖拆包核对、质检分级、修复分流和二次上架，全年退货质检量${C.returnInspectionAnnual}，退货质检与二次上架${C.returnTurnaround}，平均拆包4小时、质检12小时。`,
      imgSrc: '/w-return-inspection.webp',
      imgAlt: '退货质检 — 专业质检团队',
      contentDesc: `适合需要标准化退货分级和二次上架的鞋服电商品牌及运营商。新亦源与广检集团合作QC团队，按AQL 1.0–6.5执行，可识别7大类${C.recognizableAnomalies}异常，并按品牌确认规则进行A/B+/B-/C四级管理。退货质检与二次上架${C.returnTurnaround}。`,
      featuresLabel: '服务内容',
    },
    sourceStats,
    sourceFeatures
  ),
  english: sourceContent(
    {
      title: `Apparel returns inspection | ${E('recognizableAnomalies')} of apparel anomalies and re-listing`,
      description: `Apparel returns inspection follows brand-approved A, B+, B- and C routing with inspection and re-listing in the ${E('returnTurnaround')} workflow.`,
      breadcrumbLabel: 'Returns inspection',
      eyebrow:
        'Apparel returns inspection · QC team working with Guangdong Testing Institute · AQL 1.0–6.5',
      h1: 'Apparel returns inspection and re-listing',
      h1sub: `${E('recognizableAnomalies')} of apparel anomalies with A, B+, B- and C routing`,
      heroDesc: `The service covers unpacking checks, inspection grading, repair routing and re-listing. The annual returns-inspection volume is ${E('returnInspectionAnnual')}; project standards and handling conditions are confirmed with each brand.`,
      imgSrc: '/w-return-inspection.webp',
      imgAlt: 'Returns inspection by a specialist QC team',
      contentDesc: `For apparel and footwear e-commerce brands and operators needing standardised return grading and re-listing. The QC team works to AQL 1.0–6.5 and applies brand-approved routing.`,
      featuresLabel: 'Service capability',
    },
    englishStats,
    englishFeatures
  ),
  sourceFaqs,
  englishFaqs,
}
