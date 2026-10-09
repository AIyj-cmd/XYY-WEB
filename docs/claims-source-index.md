# 公开 claims 来源索引

本索引只整理 `src/lib/claims/` 已有记录，供白皮书编辑和页面维护查证；不新增数字、不改变 `publishStatus`，也不把白皮书历史内容升级为当前服务承诺。

## 记录字段与来源类型

每个 `BrandClaim` 必须有 `sourceType`、`sourceReference`、`verifiedBy`、`verifiedAt`、`scope`、`publishStatus` 与页面范围。`validation.ts` 会拒绝缺失或无效的这些来源字段。

| sourceType | 现有记录的含义 | 当前复核人 / 时间 |
| --- | --- | --- |
| `user_confirmation` | 用户或业务负责人明确确认的服务规则或指标 | 记录中逐项保存，例如业务负责人于 2026-07-28、用户于 2026-09-21 |
| `company_material` | 已登记的资料库或业务负责人更新 | 记录中逐项保存，例如资料库.md（2026-07-27）、业务负责人更新（2026-08-08） |
| `operational_record` | 已发布案例快照或已审核离线 fallback 的案例字段 | `XYY case-source review`，2026-09-28 |

## 服务规则与统计指标的区别

`shipping_sla` 与 `return_inspection_relisting_sla` 是服务规则：没有单一统计周期，不能改成统计均值或其他截单/发货时间。`shipping_accuracy`、`inventory_accuracy`、仓储面积、峰值、年质检量、异常类型与修复率是指标：须保留各自 `scope`、来源与备注中的统计周期/样本限制，不能相互换算或以白皮书中的历史数字替代。

## 直营网与履约记录

| 模块 | claimKey | 来源记录（sourceType；sourceReference） | verifiedBy / verifiedAt |
| --- | --- | --- | --- |
| fulfillment-performance | `shipping_sla` | user_confirmation；SEO/GEO上线审计 E-003；用户于2026-07-28确认 | 业务负责人 / 2026-07-28 |
| fulfillment-performance | `shipping_accuracy`、`inventory_accuracy` | user_confirmation；用户于2026-09-21确认 | 用户 / 2026-09-21 |
| fulfillment-performance | `single_warehouse_daily_peak`、`regional_daily_peak` | company_material；资料库.md（2026-07-27） | 业务负责人 / 2026-07-27 |
| fulfillment-scale | `direct_operated_warehouse_area`、`partner_brand_count` | company_material；业务负责人更新（2026-08-08） | 业务负责人 / 2026-08-08 |
| fulfillment-scale | `served_store_count`、`managed_sku_count`、`covered_city_count` | company_material；资料库.md（2026-07-27） | 业务负责人 / 2026-07-27 |
| fulfillment-scale | `employee_count` | user_confirmation；业务负责人更新（2026-08-08） | 业务负责人 / 2026-08-08 |
| quality | `return_inspection_relisting_sla`、`annual_return_inspection_volume`、`annual_new_goods_inspection_volume`、`recognizable_anomaly_count`、`repair_success_rate` | company_material；资料库.md（2026-07-27） | 业务负责人 / 2026-07-27 |

## 案例记录

案例 claim 的 `sourceType` 一律为 `operational_record`，`verifiedBy` 为 `XYY case-source review`，`verifiedAt` 为 2026-09-28，页面范围仅为 `home`、`cases`、`llms`。`publishedSource()` 指向 Directus `cases` 已发布 GET（200）及 `tests/fixtures/cases.published.json` 快照；`fallbackSource()` 指向已审核离线 fallback（`src/data/brand/case-details.ts` 经 `src/data/cases/fallbacks.ts`）。两者都不是新业务审计。

| 案例模块 | claimKey 前缀 | 当前 sourceReference 路径 |
| --- | --- | --- |
| `cases/inman.ts` | `inman_` | audited offline fallback：`stats[0]`、`stats[1]` |
| `cases/maxrieny.ts` | `maxrieny_` | published Directus snapshot：`stats[0..7]`、`case_description` |
| `cases/meiyi.ts` | `meiyi_` | published Directus snapshot：`stats[0..3]` |
| `cases/romi.ts` | `romi_` | published Directus snapshot：`stats[0..2]`、`case_description` |
| `cases/toyouth.ts` | `toyouth_` | published Directus snapshot：`stats[0..1]`、`case_description` |
| `cases/ur.ts` | `ur_` | published Directus snapshot：`stats[0..7]`、`case_description`、`tags[0]` |
| `cases/xingmian.ts` | `xingmian_` | published Directus snapshot：`stats[0..6]` |

## 白皮书使用边界

第 1–14 期 PDF 及其阅读 JSON 只证明历史原刊内容和页级位置。历史数字、名单、活动、客户或计划不得写入 `src/lib/claims/`，也不得替换本索引中的来源、审核人、审核时间、状态或统计范围。第 3–5 期的可读原文仍应保留历史语境和部分恢复提示。
