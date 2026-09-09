import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { PUBLICATION_FAQS } from '@/data/publications/support'
import { APPROVED_FAQ_SEEDS } from '../../scripts/data/approved-faq-seeds.mjs'

const expectedFaqs = [
  [
    '新亦源供应链白皮书是什么？与《森林期刊》有什么关系？',
    '新亦源供应链白皮书是面向鞋服行业的仓配知识资料栏目，目前汇集新亦源出品的《森林期刊》，围绕云仓运营、退货质检、直播仓配与数字化实践提供阅读参考。栏目以业务问题组织阅读入口，原有 PDF 保留刊名和期次；引用具体内容时，应以原刊正文为准。',
  ],
  [
    '供应链白皮书适合哪些团队阅读？',
    '供应链白皮书适合鞋服品牌负责人、供应链与仓储管理人员，以及电商和直播运营团队阅读。品牌团队可据此梳理仓配需求，运营团队可对照履约和退货环节查找问题，管理团队可将相关内容作为内部讨论与培训的参考；具体主题以各期目录和正文为准。',
  ],
  [
    '供应链白皮书能帮助梳理哪些鞋服仓配问题？',
    '本栏目重点关注云仓作业协同、退货质检、直播订单履约及仓储数字化等场景。阅读时可以带着具体问题：多渠道订单如何协同、退货如何分级处理、业务高峰如何组织作业、仓内信息如何衔接。先对照相关主题定位问题，再结合自身流程验证适用性。',
  ],
  [
    '如何用供应链白皮书辅助云仓选型与方案评估？',
    '建议先列明商品品类、SKU 特征、订单峰值、履约渠道和退货处理需求，再结合白皮书相关主题整理服务商沟通清单，逐项核对作业流程、系统对接与异常处理安排。白皮书用于提供讨论和比较的参考，具体服务范围、费用与交付安排仍需在实际方案中确认。',
  ],
  [
    '如何参考白皮书改进退货质检与库存周转？',
    '可以从退货接收、质检分级、后整修复和重新上架等环节梳理现有流程，再阅读对应主题，列出需要核实的责任分工、商品去向和处理时长。建议先在明确的品类或业务范围内验证，并以本企业数据评估变化；资料中的案例不能直接等同于其他企业的改善结果。',
  ],
  [
    '供应链白皮书 PDF 如何获取，是否需要注册？',
    '可点击本页“阅读最新资料 PDF”，或在“全部期次”目录中选择对应资料打开 PDF。当前公开 PDF 可直接访问，无需注册；文件打开后可按浏览器提供的功能保存。选读时建议先看期次、主题与正文目录，避免把不同版本的内容混用。',
  ],
  [
    '如何核验和引用白皮书中的数据与案例？',
    '核验时应回到原刊正文，查看内容涉及的时间、业务范围、统计口径和案例条件；缺少这些信息时，不宜将其作为通用行业基准或效果承诺。引用时请标明新亦源供应链、原刊名称、期次与页码，保留上下文；转载或对外商用前，请通过联系页面确认授权范围。',
  ],
  [
    '白皮书更新后在哪里查看，如何获得补充资料？',
    '本页资料目录是查看已公开内容的入口，可结合期次、主题与正文信息选择阅读。资料按实际发布安排更新，不承诺固定周期。如需某个主题的补充资料或希望讨论实际业务，可通过官网联系页面说明品类、履约渠道和具体问题，资料提供情况以沟通确认为准。',
  ],
]

const pageSource = readFileSync(
  resolve(process.cwd(), 'src/pages/supply-chain-whitepapers.astro'),
  'utf8'
)
const heroSource = readFileSync(
  resolve(process.cwd(), 'src/components/publications/PublicationsHero.astro'),
  'utf8'
)

describe('supply-chain whitepapers copy contract', () => {
  it('keeps the approved FAQ content, identity, order, and generated seeds aligned', () => {
    expect(PUBLICATION_FAQS).toEqual(
      expectedFaqs.map(([q, a], index) => ({ contentKey: `faq-senlinqikan-0${index + 1}`, q, a }))
    )
    expect(
      APPROVED_FAQ_SEEDS.filter((faq) => faq.page_key === 'senlinqikan').map((faq) => ({
        contentKey: faq.content_key,
        q: faq.question,
        a: faq.answer,
        faqPageKey: faq.faqPageKey,
        pageKey: faq.page_key,
        sort: faq.sort,
      }))
    ).toEqual(
      expectedFaqs.map(([q, a], index) => ({
        contentKey: `faq-senlinqikan-0${index + 1}`,
        q,
        a,
        faqPageKey: 'senlinqikan',
        pageKey: 'senlinqikan',
        sort: index + 1,
      }))
    )
  })

  it('keeps the visible FAQ and JSON-LD on the same CMS-aware FAQ object', () => {
    expect(pageSource).toContain("getFaqs('senlinqikan', PUBLICATION_FAQS)")
    expect(pageSource).toContain('const faqSchema = createFaqSchema(faqs)')
    expect(pageSource).toContain('<PageFAQ heading="供应链白皮书常见问题" items={faqs} />')
  })

  it('keeps the approved reader-focused hero and metadata copy', () => {
    expect(heroSource).toContain('新亦源供应链 · 鞋服仓配知识库')
    expect(heroSource).toContain('把仓配经验，转化为供应链决策参考。')
    expect(heroSource).toContain(
      '新亦源供应链白皮书聚焦鞋服行业，分享云仓运营、退货质检、直播仓配与数字化管理的一线经验，为品牌、电商及供应链团队提供仓配选型、流程优化和团队培训的实用参考。'
    )
    expect(heroSource).not.toContain('汇集《森林期刊》')
    expect(heroSource).toContain('阅读白皮书')
    expect(heroSource).toContain('阅读最新资料 PDF')
    expect(heroSource).toContain('浏览全部资料')
    expect(pageSource).toContain('供应链白皮书｜鞋服云仓、退货质检与仓配实践 - 新亦源')
    expect(pageSource).toContain(
      '新亦源供应链白皮书汇集《森林期刊》中的鞋服云仓、退货质检、直播仓配与数字化实践，提供 HTML 阅读与 PDF 下载入口和应用问答，帮助品牌、电商及供应链团队梳理仓配选型、流程协同与运营改进问题。'
    )
    expect(pageSource).toContain('新亦源供应链白皮书资料目录')
  })
})
