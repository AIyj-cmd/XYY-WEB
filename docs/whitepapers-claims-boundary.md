# 白皮书来源与公开数字边界

本文件归纳现有来源边界，不修改任何公开数字或审核状态。

## 原刊内容

- `public/senlinqikan/pdf/{1..14}.pdf` 是白皮书阅读版正文、局部图和 `review-note` 的唯一原稿来源；各阅读 JSON 保存对应 SHA-256、物理页和区域定位。
- `docs/whitepapers-manual-review.md` 说明 235 条冻结历史 `review-note` 的人工复核台账。可用 `scripts/audit-whitepaper-review-ledger.mjs` 把每条原记录、JSON 路径、PDF 哈希和页/坐标重新导出；处理结论只读取 `docs/data/whitepaper-review-history.json`，不根据 note 的措辞自动分类。
- 第 3–5 期仍是部分恢复稿。无法由原图逐字确认的正文、名单、表格和图内数字继续留在 `review-note` 的明确缺口中；这些历史内容不构成当前服务承诺。

## 当前公开数字

- 当前服务规模、时效和质量等公开数字只可来自 `src/lib/claims/`；每一项均带 `sourceType`、`sourceReference`、`verifiedBy` 和 `verifiedAt`。
- 字段含义、服务规则与统计指标的区别，以及每个现有模块的具体来源记录见 `docs/claims-source-index.md`。该索引只整理既有 claim，不构成重新审核或变更。
- 白皮书中的历史数字、人员、活动和计划只能按原刊历史语境展示，不能补入或替代 `src/lib/claims/` 的已审核 claim。
- 本轮未将白皮书的任何数字新增为 claim，也未修改现有 claim 的值、来源或审核状态。
