import type { WhitepaperListing } from '@/data/whitepapers/types'
import type { FaqItem } from '@/lib/directus'

const copy = (
  title: string,
  description: string,
  sourcePublishedLabel: string,
  englishTitle: string,
  englishDescription: string,
  publishedLabel: string
) => ({
  source: { title, description, sourcePublishedLabel },
  title: englishTitle,
  description: englishDescription,
  publishedLabel,
})

const WHITEPAPER_COPY: Record<string, ReturnType<typeof copy>> = {
  '1': copy(
    '仓库六大守则与团队管理实践',
    '本期记录仓库六大守则、人机复位、会议制度、员工培训与团队活动等内部管理实践，依据《新亦源森林双月刊》第1期整理。',
    '2022年第1期（封面标注）',
    'Warehouse principles and team management',
    'An archive of warehouse principles, reset routines, meetings, staff training and team activities from Issue 1.',
    'Issue 1, 2022 (cover)'
  ),
  '2': copy(
    '五周年团队建设与仓储运营记录',
    '本期收录五周年特刊、仓储运营应对、员工学习、内部推荐与团队关怀等内容，依据《新亦源森林双月刊》第2期整理。',
    '2022年第2期（封面标注）',
    'Five-year team and warehouse operations record',
    'A five-year special with warehouse operations, employee learning, referrals and team care from Issue 2.',
    'Issue 2, 2022 (cover)'
  ),
  '3': copy(
    '供应链观察与团队发展记录',
    '本期收录供应链行业观察、团队发展、年度会议、仓储实践与员工活动等内容，依据《新亦源森林双月刊》第3期整理。',
    '2022年第3期（封面标注）',
    'Supply-chain observations and team development',
    'Industry observations, team development, annual meetings, warehouse practice and staff activities from Issue 3.',
    'Issue 3, 2022 (cover)'
  ),
  '4': copy(
    '客户签约、仓储管理与团队活动',
    '本期收录客户签约、企业寄件方案、鞋服云仓6S管理、培训、自由行与团建等内容，依据《新亦源森林双月刊》第4期整理。',
    '2022年第4期（封面标注）',
    'Client engagements, warehouse management and team activities',
    'Client engagements, business shipping, apparel warehouse 6S management, training and team activities from Issue 4.',
    'Issue 4, 2022 (cover)'
  ),
  '5': copy(
    '服装零售研究与仓配团队记录',
    '本期收录服装零售行业研究、鞋服QC培训、仓储质检、门店服务与团队活动等内容，依据《新亦源森林双月刊》第5期整理。',
    '2023年第5期（封面标注）',
    'Apparel retail research and fulfilment team record',
    'Apparel retail research, quality-control training, warehouse inspection, store service and team activities from Issue 5.',
    'Issue 5, 2023 (cover)'
  ),
  '6': copy(
    'AI虚拟试穿、服装品牌增长与云仓运营管理',
    '收录管理者的总指挥意识、谷歌虚拟试穿、纺织服装行业数据、视频号运营，以及新亦源 QC、信息化和团队活动报道。',
    '2023 年夏刊（总第 06 期）',
    'AI virtual try-on, apparel growth and cloud-warehouse operations',
    'Industry observations alongside reports on quality control, digital operations and team activities in Issue 6.',
    'Summer 2023 (Issue 06)'
  ),
  '7': copy(
    '服装供应链、零库存印花与云仓服务之道',
    '收录服装供应链、零库存印花、服务与团队运营相关的行业观察和企业报道。',
    '2023 年秋刊（总第 07 期）',
    'Apparel supply chains, print-on-demand and cloud-warehouse service',
    'Industry observations and company reports on apparel supply chains, print-on-demand, service and team operations in Issue 7.',
    'Autumn 2023 (Issue 07)'
  ),
  '8': copy(
    '服装供应链数字化、零库存与物流创新',
    '收录服装供应链数字化、零库存案例、行业奖项、培训与人才发展的历史报道。',
    '2023 年冬刊（总第 08 期）',
    'Apparel supply-chain digitalisation, zero inventory and logistics innovation',
    'Historical reports on digitalisation, zero-inventory examples, industry awards, training and talent development in Issue 8.',
    'Winter 2023 (Issue 08)'
  ),
  '9': copy(
    'ESG服务模式、服装行业经济与鞋服云仓质检',
    '收录鞋服云仓 ESG 服务模式、服装行业经济运行、质检服务和周年活动报道。',
    '2024 年春刊（总第 09 期）',
    'ESG service models, apparel economics and fulfilment quality control',
    'Reports on ESG service models, apparel-industry economics, quality control and anniversary activities in Issue 9.',
    'Spring 2024 (Issue 09)'
  ),
  '10': copy(
    '服装云仓破局、总部乔迁与供应链发展',
    '收录轻奢女装直播、服装云仓、开仓乔迁和员工服务效率等内容；封面刊期与电子刊前言存在来源冲突。',
    '封面标注：2024 年秋刊；电子刊前言标注：SUMMER（来源冲突未消解）',
    'Apparel cloud-warehouse change, headquarters relocation and supply-chain development',
    'Reports on livestream apparel, cloud warehousing, an opening and relocation, and service efficiency; the cover and e-publication foreword conflict on the issue season.',
    'Cover: Autumn 2024; e-publication foreword: SUMMER (source conflict retained)'
  ),
  '11': copy(
    '纺织服装市场、国际物流数字化与品质管理',
    '收录纺织服装市场、国际物流数字化、品质管理和年度战略相关报道。',
    '2025 年春刊（总第 11 期）',
    'Textile and apparel markets, international logistics digitalisation and quality management',
    'Reports on textile and apparel markets, international logistics digitalisation, quality management and annual strategy in Issue 11.',
    'Spring 2025 (Issue 11)'
  ),
  '12': copy(
    '服装品牌、云仓降本增效与物流运行分析',
    '收录服装出口、行业经济、智能云仓、物流运行和质检运营相关内容。',
    '2025 年夏刊（原图目录日期串 03-07）',
    'Apparel brands, cloud-warehouse efficiency and logistics operations',
    'Reports on apparel exports, industry economics, intelligent cloud warehousing, logistics operations and quality control in Issue 12.',
    'Summer 2025 (original contents page also shows 03–07)'
  ),
  '13': copy(
    '服装大促仓储风控、智能云仓与战略合作',
    '收录服装大促仓储风控、智能云仓、战略合作、运营质量和人才活动报道。',
    '2025 年秋刊（总第 13 期）',
    'Peak-season warehouse risk control, intelligent cloud warehousing and strategic partnerships',
    'Reports on peak-season risk control, intelligent cloud warehousing, partnerships, operating quality and talent activities in Issue 13.',
    'Autumn 2025 (Issue 13)'
  ),
  '14': copy(
    '鞋服产品增长、跨境供应链与上海云仓实践',
    '本期收录鞋服行业产品升级与增长机会、纺织服装出口观察、跨境品牌仓配及上海云仓实践，并记录年度规划、团队培养与校企合作。依据《森林期刊》第14期整理，保留原文与PDF下载。',
    '2026年6月（封面标注）',
    'Apparel product growth, cross-border supply chains and Shanghai cloud-warehouse practice',
    'Apparel product growth, textile and apparel exports, cross-border brand fulfilment and Shanghai cloud-warehouse practice, with planning, team development and education partnerships in Issue 14.',
    'June 2026 (cover)'
  ),
}

const FAQ_COPY = [
  [
    '新亦源供应链白皮书是什么？与《森林期刊》有什么关系？',
    '新亦源供应链白皮书是面向鞋服行业的仓配知识资料栏目，目前汇集新亦源出品的《森林期刊》，围绕云仓运营、退货质检、直播仓配与数字化实践提供阅读参考。栏目以业务问题组织阅读入口，原有 PDF 保留刊名和期次；引用具体内容时，应以原刊正文为准。',
    'What are the XINYIYUAN supply-chain whitepapers?',
    'This is a knowledge library for apparel fulfilment. It currently indexes published Forest Journal issues covering cloud-warehouse operations, returns inspection, livestream fulfilment and digital operations. The original journal title and issue number remain on each PDF; cite the original Chinese publication when referring to specific material.',
  ],
  [
    '供应链白皮书适合哪些团队阅读？',
    '供应链白皮书适合鞋服品牌负责人、供应链与仓储管理人员，以及电商和直播运营团队阅读。品牌团队可据此梳理仓配需求，运营团队可对照履约和退货环节查找问题，管理团队可将相关内容作为内部讨论与培训的参考；具体主题以各期目录和正文为准。',
    'Who is this library for?',
    'It is intended for apparel brand leads, supply-chain and warehouse managers, and e-commerce or livestream operations teams. Use the issue directory and original article to identify the topic relevant to a particular operating question.',
  ],
  [
    '供应链白皮书能帮助梳理哪些鞋服仓配问题？',
    '本栏目重点关注云仓作业协同、退货质检、直播订单履约及仓储数字化等场景。阅读时可以带着具体问题：多渠道订单如何协同、退货如何分级处理、业务高峰如何组织作业、仓内信息如何衔接。先对照相关主题定位问题，再结合自身流程验证适用性。',
    'Which apparel fulfilment questions does it cover?',
    'Topics include cloud-warehouse coordination, returns inspection, livestream order fulfilment and warehouse digitalisation. Compare a relevant topic with your own channels, returns process, peak operations and information flow before deciding whether it applies.',
  ],
  [
    '如何用供应链白皮书辅助云仓选型与方案评估？',
    '建议先列明商品品类、SKU 特征、订单峰值、履约渠道和退货处理需求，再结合白皮书相关主题整理服务商沟通清单，逐项核对作业流程、系统对接与异常处理安排。白皮书用于提供讨论和比较的参考，具体服务范围、费用与交付安排仍需在实际方案中确认。',
    'Can the library support cloud-warehouse evaluation?',
    'List product categories, SKU characteristics, peak orders, fulfilment channels and returns needs first. The material can help structure questions about operating flows, systems and exception handling; service scope, pricing and delivery arrangements still require a project discussion.',
  ],
  [
    '如何参考白皮书改进退货质检与库存周转？',
    '可以从退货接收、质检分级、后整修复和重新上架等环节梳理现有流程，再阅读对应主题，列出需要核实的责任分工、商品去向和处理时长。建议先在明确的品类或业务范围内验证，并以本企业数据评估变化；资料中的案例不能直接等同于其他企业的改善结果。',
    'How should returns-inspection material be used?',
    'Map receiving, inspection grading, care, repair and relisting first, then use the related issue to identify responsibilities, product disposition and timings to verify. Test any change within a defined category or operation and evaluate it with your own data.',
  ],
  [
    '供应链白皮书 PDF 如何获取，是否需要注册？',
    '可点击本页“阅读最新资料 PDF”，或在“全部期次”目录中选择对应资料打开 PDF。当前公开 PDF 可直接访问，无需注册；文件打开后可按浏览器提供的功能保存。选读时建议先看期次、主题与正文目录，避免把不同版本的内容混用。',
    'How can I open a PDF?',
    'Select the Chinese PDF link from an issue card. Public PDFs can currently be opened without registration. Check the issue, topic and original table of contents before using material from different versions together.',
  ],
  [
    '如何核验和引用白皮书中的数据与案例？',
    '核验时应回到原刊正文，查看内容涉及的时间、业务范围、统计口径和案例条件；缺少这些信息时，不宜将其作为通用行业基准或效果承诺。引用时请标明新亦源供应链、原刊名称、期次与页码，保留上下文；转载或对外商用前，请通过联系页面确认授权范围。',
    'How should data and cases be checked or cited?',
    'Return to the original Chinese publication and review its time period, operating scope, measurement basis and case conditions. Cite XINYIYUAN Supply Chain, the original journal title, issue and page, and keep the surrounding context.',
  ],
  [
    '白皮书更新后在哪里查看，如何获得补充资料？',
    '本页资料目录是查看已公开内容的入口，可结合期次、主题与正文信息选择阅读。资料按实际发布安排更新，不承诺固定周期。如需某个主题的补充资料或希望讨论实际业务，可通过官网联系页面说明品类、履约渠道和具体问题，资料提供情况以沟通确认为准。',
    'Where can updates or supplementary material be found?',
    'This directory lists currently public material and is updated according to actual publication arrangements. For a specific topic or operating discussion, contact us with the product category, fulfilment channels and question.',
  ],
] as const

export function translateWhitepapers(items: WhitepaperListing[]): WhitepaperListing[] {
  return items.flatMap((item) => {
    const reviewed = WHITEPAPER_COPY[item.issue]
    if (
      !reviewed ||
      Object.entries(reviewed.source).some(
        ([key, value]) => item[key as keyof typeof reviewed.source] !== value
      )
    ) {
      console.warn(`[i18n:whitepapers] omitted issue ${item.issue}: stale-source`)
      return []
    }
    return [
      {
        ...item,
        title: reviewed.title,
        description: reviewed.description,
        sourcePublishedLabel: reviewed.publishedLabel,
      },
    ]
  })
}

export function translatePublicationFaqs(
  items: ReadonlyArray<Pick<FaqItem, 'q' | 'a'>>
): FaqItem[] {
  return items.flatMap((item, index) => {
    const reviewed = FAQ_COPY.find(([q, a]) => q === item.q && a === item.a)
    if (!reviewed) {
      console.warn(`[i18n:whitepapers] omitted FAQ ${index + 1}: stale-source`)
      return []
    }
    return [{ q: reviewed[2], a: reviewed[3] }]
  })
}
