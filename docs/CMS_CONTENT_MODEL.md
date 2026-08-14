# Directus 内容维护模型

## 当前已接入

| 集合               | 用途                | 前端行为                        |
| ------------------ | ------------------- | ------------------------------- |
| `homepage_content` | 首页集中配置        | 单例内维护全部运营数据          |
| `homepage_stats`   | 旧首页数据兼容备份  | 后台隐藏，运行时不再读取        |
| `services`         | 导航与首页服务入口  | 发布记录按 `sort` 展示          |
| `warehouses`       | 仓网信息            | 发布记录按 `sort` 展示          |
| `cases`            | 案例正文与全部指标  | 每个品牌一条记录，按 `sort` 展示 |
| `news`             | 行业动态文章        | 发布记录按发布时间展示          |
| `faq_pages`        | 17 个页面的 FAQ     | 每个页面内聚合维护问题列表      |
| `faqs`             | FAQ 子项兼容集合    | 由 `faq_pages` 关系字段维护     |
| `case_details`     | 旧案例正文兼容备份  | 后台隐藏，运行时不再读取        |
| `case_stats`       | 旧案例指标兼容备份  | 后台隐藏，运行时不再读取        |
| `publications`     | 森林期刊目录        | 按 `sort` 展示封面和 PDF        |
| `service_pages`    | 服务文案、指标、能力 | 每个专题一条记录集中维护        |
| `service_stats`    | 旧服务指标兼容备份  | 后台隐藏，运行时不再读取        |
| `service_features` | 旧服务能力兼容备份  | 后台隐藏，运行时不再读取        |
| `about_content`    | 关于我们主文案      | Directus 单例                   |
| `about_history`    | 公司发展历程        | 按 `sort` 展示                  |
| `about_honors`     | 公司荣誉            | 按 `sort` 展示                  |
| `site_settings`    | 全站联系方式与页脚  | Directus 单例                   |
| `contact_leads`    | 官网咨询线索        | 仅供提交和后台跟进              |

## 内容源优先级

- Directus 中已发布的统一记录是前端唯一权威内容源；后台保存后，SSR 页面会在下一次请求时
  重新读取，不需要重新构建前端；
- 代码内审核版内容只在 Directus 请求失败、统一单例不存在或集合完全没有已发布记录时启用，
  不再逐字段覆盖、拼接或纠正后台已经返回的内容；
- 合作案例统一维护 `cases`，首页卡片、案例列表、案例详情、站点地图和 `llms.txt` 均从该集合
  生成；`case_description` 与 `stats` 会同步投影到所有展示位置，旧 `details/metrics` 不再成为
  独立内容源；
- `homepage_stats`、`case_details`、`case_stats`、`service_stats`、`service_features` 仅保留为
  迁移备份并从后台导航隐藏，运营人员不应再编辑这些集合。

## 运行权限边界

CMS 初始化、日常后台编辑和网站运行使用三类不同权限：

- 建模与迁移：短期管理令牌，只在人工操作期间导出为 `DIRECTUS_TOKEN`，完成后立即撤销；
- 官网内容：`DIRECTUS_CONTENT_TOKEN`，只读18个公开内容集合，不得读取咨询、用户、角色、
  权限或策略，也不得创建、更新和删除内容；
- 联系表单：`DIRECTUS_CONTACT_TOKEN`，只允许创建 `contact_leads`，不得读取既有咨询，
  也不得访问任何内容或 Directus 系统集合；服务端接口只接收姓名、电话、公司、邮箱、服务
  和留言，`source=website` 与 `status=new` 由 Directus 字段默认值生成。

Directus 12 Community 未授权自定义权限规则时，只能配置集合级完整字段权限：内容令牌仍
限制为18个集合的只读动作，联系令牌仍限制为 `contact_leads` 的创建动作；所有官网内容查询
继续显式过滤 `status=published`，联系接口继续执行服务端字段白名单。若实例具备自定义权限
授权，可设置 `DIRECTUS_CUSTOM_PERMISSION_RULES=true`，把已发布过滤同步下沉到策略层。

两枚运行令牌必须不同。部署后运行 `npm run cms:verify-runtime-permissions`，它会实际请求
敏感端点并要求返回401/403，而不是只检查变量是否存在。`/healthz` 保持原有对外契约，
通过两枚令牌各自的 `/permissions/me` 权限映射验证18个内容集合可读以及联系令牌具备创建
权限，不再逐集合读取数据，也不为健康检查开放咨询记录读取。完整逐集合验证仍由部署验收
命令负责。

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

初始化只补齐缺失页面和问题，不会覆盖后台已经编辑的记录。初始化完成后会查找
`Website Content Read-Only` 策略，并自动为18个公开内容集合补齐“仅查看已发布记录”权限。
若策略使用了其他名称，可设置 `DIRECTUS_CONTENT_POLICY_NAME`；也可以直接设置
`DIRECTUS_CONTENT_POLICY_ID`。已有数据库只需补权限时运行：

```bash
DIRECTUS_URL=https://example.com/cms DIRECTUS_TOKEN='<admin-token>' npm run cms:sync-content-permissions
```

## 已纳入的扩展内容

以下五类内容已经采用结构化集合接入，并保留审核版回退：

1. **合作案例**：运营人员只在 `cases` 中维护，每个品牌一条记录，正文、标签和多项指标在
   同一编辑页完成；`case_details`、`case_stats` 仅作为迁移备份并从后台菜单隐藏，前端不再读取；
2. **期刊目录**：`publications` 管期次、封面、PDF、发布日期和摘要；封面与 PDF
   通过 Directus 文件库上传，旧静态路径仅作为兼容回退；
3. **服务专题页**：`service_pages` 在同一条目维护主文案、4 项指标、能力列表和上传图片；`service_stats`、`service_features` 仅作迁移备份，前端不再读取；
4. **关于我们**：`about_content`、`about_history`、`about_honors` 分别管理公司正文、发展历程和荣誉；
5. **站点设置**：`site_settings` 管电话、总部地址、备案号和页脚说明。

初始化时使用 `npm run cms:generate-content-seeds` 从审核源码生成对应种子。生成文件禁止手改；
正式维护以 Directus 已发布记录为准，集合不可访问时才回退到源码。

## 暂不建议自由后台编辑

- 已审核业务数据和统计口径：继续由 claims 事实注册表管理，后续若迁入 CMS，必须增加证据、
  审核状态、适用页面和失效日期字段；
- 路由、canonical、重定向、安全头和 robots 策略：属于发布与安全配置，不属于内容编辑；
- 导航路径：可以维护名称和顺序，但 URL 仍应从允许列表选择，避免后台误操作制造死链。
