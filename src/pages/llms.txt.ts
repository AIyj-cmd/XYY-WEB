import type { APIRoute } from 'astro'

import { CASE_FALLBACKS } from '@/data/cases'
import { CLAIM_TEXT } from '@/lib/claims'
import { getCases } from '@/lib/directus'
import { absoluteUrl } from '@/lib/seo'

const page = (pathname: string) => absoluteUrl(pathname)
const singleLine = (value: string) => value.replace(/\s+/g, ' ').trim()

export const GET: APIRoute = async () => {
  const cases = await getCases(CASE_FALLBACKS)
  const caseLinks = cases
    .filter((item) => item.slug)
    .map(
      (item) =>
        `- [${singleLine(item.name || item.label)}合作案例](${page(`/cases/${item.slug}`)}): ${singleLine(item.category)}；${singleLine(item.metrics)}。`
    )
    .join('\n')
  const content = `# 新亦源供应链

> 广州新亦源供应链管理有限公司，2011年成立，专注鞋服供应链服务，为品牌提供鞋服云仓、订单履约、退货质检、瑕疵修复、物流数字化和智能寄件服务。

官网当前公开运营口径包括：直营仓储${CLAIM_TEXT.warehouseArea}、服务${CLAIM_TEXT.partnerBrands}品牌、员工${CLAIM_TEXT.employeeCount}名、管理SKU ${CLAIM_TEXT.managedSkus}、服务门店${CLAIM_TEXT.servedStores}、覆盖${CLAIM_TEXT.coveredCities}城市。运营数据的统计周期、项目范围和适用条件以对应页面说明及经营记录为准。

## 关键页面

- [首页](${page('/')}): 新亦源供应链整体介绍、核心运营数据、解决方案、履约流程、合作案例和常见问题。
- [产品服务](${page('/product')}): 按商品入仓、履约、退货处理和再次销售场景了解仓配服务体系。
- [合作案例](${page('/cases')}): 鞋服、运动、内衣、跨境等业务场景的仓配与质检合作案例。
- [关于我们](${page('/about')}): 公司背景、发展历程、仓网、团队和资质信息。
- [联系我们](${page('/contact')}): 咨询鞋服仓配、质检修复、系统对接和智能寄件方案。

## 核心解决方案

- [鞋服云仓](${page('/xiefu-yuncang')}): 支持B2C、B2B、O2O多渠道订单履约，以及多SKU、款色码、库存和门店补货管理。
- [退货质检](${page('/tuihuo-zhijian')}): 提供退货拆包、质检分级、异常识别、处置分流和二次上架服务。
- [后整修复](${page('/houzheng-xiufu')}): 提供清洁、熨烫、换标、包装整理和轻微瑕疵修复等商品处理服务。
- [物流数字化能力](${page('/wuliu-shuzihua')}): 连接订单、库存、仓内作业、物流轨迹、签收数据与异常处理。
- [运到智能寄件平台](${page('/yundao-zhineng-jijian')}): 统一管理多承运商寄件、门店调拨、退仓、轨迹查询和异常工单。

## 仓网与业务场景

- [华东鞋服云仓](${page('/huadong-xiefu-yuncang')}): 面向长三角与华东区域的鞋服仓配服务。
- [华南鞋服云仓](${page('/huanan-xiefu-yuncang')}): 面向广州、东莞、肇庆等华南仓网的鞋服仓配服务。
- [广州鞋服云仓](${page('/guangzhou-xiefu-yuncang')}): 广州区域鞋服仓储、订单履约和退货处理服务。
- [服装云仓](${page('/fuzhuang-yuncang')}): 面向女装、男装、内衣、运动服等高SKU服装品类。
- [B2B门店仓配](${page('/b2b-mendian-cangpei')}): 连锁门店补货、批发铺货、分货与标签处理服务。
- [直播电商仓配](${page('/zhibo-cangpei')}): 面向直播电商订单波峰与多平台履约的仓配服务。
- [唯品会JIT/JITX仓配](${page('/weipinhui-jit-jitx')}): 唯品会JIT/JITX模式的系统、仓内作业和履约协同。
- [跨境云仓](${page('/kuajing-yuncang')}): 跨境备货、质检、换标换包装和退货逆向处理。

## 案例与内容

${caseLinks}

## Optional

- [行业动态](${page('/news')}): 鞋服物流、云仓、质检和供应链行业内容。
- [森林期刊](${page('/senlinqikan')}): 新亦源发布的鞋服供应链知识内容。
- [个人信息保护说明](${page('/privacy')}): 官网咨询表单的个人信息收集、使用和权利说明。
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
