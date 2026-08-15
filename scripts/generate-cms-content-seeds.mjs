#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'
import { APPROVED_CASE_SEEDS } from './data/approved-case-seeds.mjs'
import { parseServiceProps, parseVariable } from './lib/source-seed-extractor.mjs'
import { assertKnownClaimReferences } from './lib/claim-reference-validation.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFileSync(resolve(root, file), 'utf8')
const serviceSlugs = [
  'fuzhuang-yuncang',
  'houzheng-xiufu',
  'weipinhui-jit-jitx',
  'kuajing-yuncang',
  'huanan-xiefu-yuncang',
  'zhibo-cangpei',
  'b2b-mendian-cangpei',
  'huadong-xiefu-yuncang',
  'guangzhou-xiefu-yuncang',
  'tuihuo-zhijian',
  'xiefu-yuncang',
  'yundao-zhineng-jijian',
]

const caseDetails = parseVariable(
  read('src/data/brand/case-details.ts'),
  'case-details.ts',
  'CASE_DETAILS'
)
const caseDetailSeeds = Object.entries(caseDetails).map(([label, detail]) => ({
  status: 'published',
  label,
  slug: detail.slug,
  name: detail.name,
  full_name: detail.fullName,
  accent: detail.accent,
  description: detail.description,
}))
const caseStatSeeds = Object.values(caseDetails).flatMap((detail) =>
  detail.stats.map((stat, index) => ({
    status: 'published',
    case_slug: detail.slug,
    sort: index + 1,
    ...stat,
  }))
)
const unifiedCaseSeeds = APPROVED_CASE_SEEDS.map((item) => {
  const detail = caseDetails[item.label]
  return detail
    ? {
        ...item,
        slug: detail.slug,
        name: detail.name,
        full_name: detail.fullName,
        accent: detail.accent,
        case_description: detail.description,
        stats: detail.stats,
      }
    : item
})

const publications = parseVariable(
  read('src/data/publications/issues.ts'),
  'issues.ts',
  'PUBLICATION_ISSUES'
).map(({ isLatest, ...item }, index) => ({
  status: 'published',
  sort: index + 1,
  ...item,
  is_latest: isLatest,
}))
const history = parseVariable(read('src/data/about/history.ts'), 'history.ts', 'ABOUT_HISTORY').map(
  (item, index) => ({ status: 'published', sort: index + 1, ...item })
)
const honors = parseVariable(
  read('src/data/brand/organization.ts'),
  'organization.ts',
  'HONORS'
).map((title, index) => ({
  status: 'published',
  sort: index + 1,
  title,
  image: `/about/honor/${index + 1}.jpg`,
}))

const servicePages = serviceSlugs.map((slug) => {
  const props = parseServiceProps(read(`src/pages/${slug}.astro`), `${slug}.astro`)
  return {
    status: 'published',
    slug,
    title: props.title,
    description: props.description,
    breadcrumb_label: props.breadcrumbLabel,
    eyebrow: props.eyebrow,
    h1: props.h1,
    h1sub: props.h1sub,
    hero_desc: props.heroDesc,
    img_src: props.imgSrc,
    img_alt: props.imgAlt,
    content_desc: props.contentDesc,
    features_label: props.featuresLabel,
    stats: props.stats,
    features: props.features,
  }
})

const servicePageSeeds = servicePages.map((page) => ({
  status: page.status,
  slug: page.slug,
  title: page.title,
  description: page.description,
  breadcrumb_label: page.breadcrumb_label,
  eyebrow: page.eyebrow,
  h1: page.h1,
  h1sub: page.h1sub,
  hero_desc: page.hero_desc,
  img_src: page.img_src,
  img_alt: page.img_alt,
  content_desc: page.content_desc,
  features_label: page.features_label,
}))
const serviceStatSeeds = servicePages.flatMap(({ slug, stats }) =>
  stats.map((item, index) => ({
    status: 'published',
    service_slug: slug,
    sort: index + 1,
    ...item,
  }))
)
const serviceFeatureSeeds = servicePages.flatMap(({ slug, features }) =>
  features.map((item, index) => ({
    status: 'published',
    service_slug: slug,
    sort: index + 1,
    ...item,
  }))
)

const exports = {
  APPROVED_UNIFIED_CASE_SEEDS: unifiedCaseSeeds,
  APPROVED_CASE_DETAIL_SEEDS: caseDetailSeeds,
  APPROVED_CASE_STAT_SEEDS: caseStatSeeds,
  APPROVED_PUBLICATION_SEEDS: publications,
  APPROVED_ABOUT_CONTENT_SEEDS: [
    {
      status: 'published',
      key: 'main',
      overview:
        '新亦源供应链总部位于广州，是专注鞋服垂直领域的云仓服务商。公司以鞋服为核心，延伸服务潮玩、美妆、箱包、IT电子、快消、医药、安防、智能家居等行业，围绕鞋服质检中心、鞋服仓配中心和商圈寄件平台“运到”构建一体化服务能力。目前合作品牌{{partnerBrands}}、服务门店{{servedStores}}、覆盖{{coveredCities}}城市、管理SKU {{managedSkus}}。',
      hero_description:
        '从仓储质检到履约交付，我们为鞋服品牌提前解决出货链路中的复杂问题。\n15年、{{employeeCount}}名员工、{{warehouseArea}}直营仓储，只为一件事：让发货更准确、高效、快捷。',
    },
  ],
  APPROVED_ABOUT_HISTORY_SEEDS: history,
  APPROVED_ABOUT_HONOR_SEEDS: honors,
  APPROVED_SITE_SETTING_SEEDS: [
    {
      status: 'published',
      key: 'main',
      phone: '400-6865-156',
      headquarters_label: '华南总部',
      headquarters_address: '广东省广州市黄埔区果园一路2号',
      icp: '粤ICP备17001688号',
      footer_description:
        '2011年成立，深耕鞋服物流15年。服务{{partnerBrands}}品牌、{{servedStores}}门店，覆盖{{coveredCities}}城市，直营仓储{{warehouseArea}}。',
    },
  ],
  APPROVED_SERVICE_PAGE_SEEDS: servicePageSeeds,
  APPROVED_SERVICE_STAT_SEEDS: serviceStatSeeds,
  APPROVED_SERVICE_FEATURE_SEEDS: serviceFeatureSeeds,
}

assertKnownClaimReferences(exports, { root, source: 'generate-cms-content-seeds' })

const raw = Object.entries(exports)
  .map(([name, value]) => `export const ${name} = ${JSON.stringify(value, null, 2)}`)
  .join('\n\n')
const outputPath = resolve(root, 'scripts/data/approved-cms-page-seeds.mjs')
const prettierConfig = (await resolveConfig(outputPath)) ?? {}
writeFileSync(
  outputPath,
  await format(`// Generated file. Do not edit manually.\n${raw}\n`, {
    ...prettierConfig,
    parser: 'babel',
    filepath: outputPath,
  })
)
console.log(
  `Generated ${servicePageSeeds.length} service pages, ${publications.length} publications, ${caseDetailSeeds.length} case details and about/site content.`
)
