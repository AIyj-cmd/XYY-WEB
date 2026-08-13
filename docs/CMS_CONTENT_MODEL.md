# Directus 内容维护模型

## 当前已接入

| 集合               | 用途                | 前端行为                        |
| ------------------ | ------------------- | ------------------------------- |
| `homepage_content` | 首页集中配置        | 单例内维护全部运营数据          |
| `homepage_stats`   | 旧首页数据兼容备份  | 仅在单例缺失时回退读取          |
| `services`         | 导航与首页服务入口  | 发布记录按 `sort` 展示          |
| `warehouses`       | 仓网信息            | 发布记录按 `sort` 展示          |
| `cases`            | 案例正文与全部指标  | 每个品牌一条记录，按 `sort` 展示 |
| `news`             | 行业动态文章        | 发布记录按发布时间展示          |
| `faq_pages`        | 17 个页面的 FAQ     | 每个页面内聚合维护问题列表      |
| `faqs`             | FAQ 子项兼容集合    | 由 `faq_pages` 关系字段维护     |
| `case_details`     | 旧案例正文兼容备份  | 仅在聚合字段缺失时回退读取      |
| `case_stats`       | 旧案例指标兼容备份  | 仅在聚合字段缺失时回退读取      |
| `publications`     | 森林期刊目录        | 按 `sort` 展示封面和 PDF        |
| `service_pages`    | 服务文案、指标、能力 | 每个专题一条记录集中维护        |
| `service_stats`    | 旧服务指标兼容备份  | 仅在聚合字段缺失时回退读取      |
| `service_features` | 旧服务能力兼容备份  | 仅在聚合字段缺失时回退读取      |
| `about_content`    | 关于我们主文案      | Directus 单例                   |
| `about_history`    | 公司发展历程        | 按 `sort` 展示                  |
| `about_honors`     | 公司荣誉            | 按 `sort` 展示                  |
| `site_settings`    | 全站联系方式与页脚  | Directus 单例                   |
| `contact_leads`    | 官网咨询线索        | 仅供提交和后台跟进              |

## FAQ 维护规则

运营人员从 `faq_pages` 进入对应页面，在“问题列表”内新增、删除、编辑和拖动排序。
`faqs` 作为关系子项保留，不在后台主导航单独展示。子项字段：

- `status`：只有 `published` 会在官网显示；
- `faq_page`：所属 FAQ 页面关系；`page_key` 仅为兼容标识；
- `sort`：同一页面内的顺序；
- `question`：问题；
- `answer`：纯文本答案。

网站每次服务端渲染都会读取已发布 FAQ，因此后台保存并发布后无需重新构建前端。若
Directus 暂时不可用，页面会使用代码中的审核版 FAQ，避免整块内容消失。

答案支持 `{{partnerBrands}}`、`{{warehouseArea}}`、`{{shippingAccuracy}}` 等事实占位符。
渲染时由 `src/lib/claims.ts` 替换为当前审核值，避免品牌数量、仓储面积和时效口径在
后台文案中逐渐失真。新增占位符前应先进入事实注册表并通过审核。

初始化命令会导入 17 个页面、100 条现有 FAQ：

```bash
npm run cms:generate-faq-seeds
DIRECTUS_URL=https://example.com/cms DIRECTUS_TOKEN='<admin-token>' node scripts/setup-cms.mjs
```

初始化只补齐缺失页面和问题，不会覆盖后台已经编辑的记录。

## 已纳入的扩展内容

以下五类内容已经采用结构化集合接入，并保留审核版回退：

1. **合作案例**：运营人员只在 `cases` 中维护，每个品牌一条记录，正文、标签和多项指标在
   同一编辑页完成；`case_details`、`case_stats` 仅作为旧数据兼容备份并从后台菜单隐藏；
2. **期刊目录**：`publications` 管期次、封面、PDF、发布日期和摘要；封面与 PDF
   通过 Directus 文件库上传，旧静态路径仅作为兼容回退；
3. **服务专题页**：`service_pages` 在同一条目维护主文案、4 项指标、能力列表和上传图片；`service_stats`、`service_features` 仅作兼容备份；
4. **关于我们**：`about_content`、`about_history`、`about_honors` 分别管理公司正文、发展历程和荣誉；
5. **站点设置**：`site_settings` 管电话、总部地址、备案号和页脚说明。

初始化时使用 `npm run cms:generate-content-seeds` 从审核源码生成对应种子。生成文件禁止手改；
正式维护以 Directus 已发布记录为准，集合不可访问时才回退到源码。

## 暂不建议自由后台编辑

- 已审核业务数据和统计口径：继续由 claims 事实注册表管理，后续若迁入 CMS，必须增加证据、
  审核状态、适用页面和失效日期字段；
- 路由、canonical、重定向、安全头和 robots 策略：属于发布与安全配置，不属于内容编辑；
- 导航路径：可以维护名称和顺序，但 URL 仍应从允许列表选择，避免后台误操作制造死链。
