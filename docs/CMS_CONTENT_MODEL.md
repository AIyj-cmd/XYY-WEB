# Directus 内容维护模型

当前机器可读模型版本为 `2026-08-phase3`，唯一契约入口是
`config/cms-contract.mjs`。集合生命周期、稳定身份和 seedPolicy 均从该契约派生；
`scripts/data/cms-contract-definitions.mjs` 只负责把脚本侧字段定义绑定到主契约，setup、verify、
seed 与迁移工具从绑定结果工作。运行时依赖方向固定为
`server/runtime-permissions.mjs → config/cms-collections.mjs → config/cms-contract.mjs`，`config/`
与 `server/` 均不得反向导入 `scripts/`。

## 当前已接入

| 集合               | 用途                 | 前端行为                         |
| ------------------ | -------------------- | -------------------------------- |
| `homepage_content` | 首页集中配置         | 单例内维护全部运营数据           |
| `homepage_stats`   | 旧首页数据兼容备份   | 后台隐藏，运行时不再读取         |
| `services`         | 导航与首页服务入口   | 发布记录按 `sort` 展示           |
| `warehouses`       | 仓网信息             | 发布记录按 `sort` 展示           |
| `cases`            | 案例正文与全部指标   | 每个品牌一条记录，按 `sort` 展示 |
| `news`             | 行业动态文章         | 发布记录按发布时间展示           |
| `faq_pages`        | 17 个页面的 FAQ      | 每个页面内聚合维护问题列表       |
| `faqs`             | FAQ 子项兼容集合     | 由 `faq_pages` 关系字段维护      |
| `case_details`     | 旧案例正文兼容备份   | 后台隐藏，运行时不再读取         |
| `case_stats`       | 旧案例指标兼容备份   | 后台隐藏，运行时不再读取         |
| `publications`     | 森林期刊目录         | 按 `sort` 展示封面和 PDF         |
| `service_pages`    | 服务文案、指标、能力 | 每个专题一条记录集中维护         |
| `service_stats`    | 旧服务指标兼容备份   | 后台隐藏，运行时不再读取         |
| `service_features` | 旧服务能力兼容备份   | 后台隐藏，运行时不再读取         |
| `about_content`    | 关于我们主文案       | Directus 单例                    |
| `about_history`    | 公司发展历程         | 按 `sort` 展示                   |
| `about_honors`     | 公司荣誉             | 按 `sort` 展示                   |
| `site_settings`    | 全站联系方式与页脚   | Directus 单例                    |
| `contact_leads`    | 官网咨询线索         | 仅供提交和后台跟进               |

## 内容源优先级

- Directus 中已发布的统一记录是前端唯一权威内容源；后台保存后，SSR 页面会在下一次请求时
  重新读取，不需要重新构建前端；
- 代码内审核版内容只在 Directus 网络失败、超时或 HTTP 5xx 时启用；CMS 正常返回空数据代表
  当前没有已发布内容，不得恢复旧静态内容；401/403 或非法结构必须明确失败；
- 合作案例统一维护 `cases`，首页卡片、案例列表、案例详情、站点地图和 `llms.txt` 均从该集合
  生成；`case_description` 与 `stats` 会同步投影到所有展示位置，旧 `details/metrics` 不再成为
  独立内容源；
- `homepage_stats`、`case_details`、`case_stats`、`service_stats`、`service_features` 仅保留为
  迁移备份并从后台导航隐藏，运营人员不应再编辑这些集合。

## 运行权限边界

CMS 初始化、日常后台编辑和网站运行使用三类不同权限：

- 建模与迁移：短期管理令牌，只在人工操作期间导出为 `DIRECTUS_TOKEN`，完成后立即撤销；
- 官网内容：`DIRECTUS_CONTENT_TOKEN`，只读主契约中13个 `active` 运行集合，不得读取 legacy、
  private、咨询、用户、角色、
  权限或策略，也不得创建、更新和删除内容；
- 联系表单：`DIRECTUS_CONTACT_TOKEN`，只允许创建 `contact_leads`，不得读取既有咨询，
  也不得访问任何内容或 Directus 系统集合；服务端接口只接收姓名、电话、公司、邮箱、服务
  和留言，`source=website` 与 `status=new` 由 Directus 字段默认值生成。

Directus 12 Community 未授权自定义权限规则时，只能配置集合级完整字段权限：内容令牌仍
限制为13个运行集合的只读动作，联系令牌仍限制为 `contact_leads` 的创建动作；所有官网内容查询
继续显式过滤 `status=published`，联系接口继续执行服务端字段白名单。若实例具备自定义权限
授权，可设置 `DIRECTUS_CUSTOM_PERMISSION_RULES=true`，把已发布过滤同步下沉到策略层。

两枚运行令牌必须不同。部署后运行 `npm run cms:verify-runtime-permissions`，它会实际请求
敏感端点并要求返回401/403，而不是只检查变量是否存在。`/healthz` 保持原有对外契约，
通过1次 ping 和两枚令牌各自的 `/permissions/me` 权限映射验证运行集合可读以及联系令牌
具备创建权限，不再逐集合读取数据，也不为健康检查开放咨询记录读取。完整审计由
`cms:verify-runtime-permissions` 负责：它核验运行集合真实读取、legacy/private/系统集合拒绝、
禁止写动作以及联系令牌仅创建边界；网络错误和404均不能视为正确拒绝。Community 模式下
联系字段限制由应用白名单执行，审计结果标记为 `application_enforced`。

## FAQ 维护规则

运营人员从 `faq_pages` 进入对应页面，在“问题列表”内新增、删除、编辑和拖动排序。
`faqs` 作为关系子项保留，不在后台主导航单独展示。子项字段：

- `status`：只有 `published` 会在官网显示；
- `faq_page`：唯一权威页面归属，通过 `faq_pages.key` 跨环境解析真实关系 ID；
- `content_key`：不可随问题文案或排序改变的稳定身份；
- `page_key`：只读 legacy 标识，仅用于迁移核对，新查询和 seed 身份均不依赖它；
- `sort`：同一页面内的顺序；
- `question`：问题；
- `answer`：纯文本答案。

网站每次服务端渲染都会读取已发布 FAQ，因此后台保存并发布后无需重新构建前端。若
Directus 暂时不可用，页面会使用代码中的审核版 FAQ，避免整块内容消失。

## 集合生命周期与稳定身份

| 生命周期 | 集合                                                                                | 稳定身份                                  |
| -------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| active   | `homepage_content`、`about_content`、`site_settings`                                | `key`                                     |
| active   | `services`、`cases`、`news`、`service_pages`                                        | `slug`                                    |
| active   | `faq_pages`                                                                         | `key`                                     |
| active   | `faqs`、`warehouses`、`about_history`、`about_honors`                               | `content_key`                             |
| active   | `publications`                                                                      | `issue`                                   |
| legacy   | `homepage_stats`、`case_details`、`case_stats`、`service_stats`、`service_features` | 无新增稳定身份要求；保留现有 Schema       |
| private  | `contact_leads`                                                                     | Directus 主键；不参与 seed 或内容记录迁移 |

`label`、`name`、`title`、`sort` 和 `year` 都是可编辑展示字段，不能作为 seed 身份。active 集合
若缺少新的稳定身份，`setup-cms` 会返回 `migration_required`，不会在有数据的集合上直接创建
必填且唯一的字段；legacy 集合不再为了理想模型新增 `content_key` 或 `metric_key`。

每个集合还具有明确的 seedPolicy：active 为 `normal`，legacy 为 `migration_only`，private 为
`never`。因此 legacy 集合仍保留当前 Schema 供旧数据核对和必要回滚使用，但不写入 seed、
不参与运行读取、正常内容迁移、稳定身份校验或稳定身份约束收紧；`contact_leads` 不参与 seed、
内容快照或记录迁移。

## Setup、Verify 与迁移边界

- `scripts/setup-cms.mjs` 只创建缺失集合、安全的缺失字段与关系，并补齐缺失 seed；不会删除
  集合、字段或记录，也不会覆盖运营人员已编辑正文。它不是 Singleton 内容同步工具：只有稳定
  身份和全部 seed 管理业务字段都为空时才会写入完整初始 seed；身份相同的现有 Singleton 不会
  回填正文，身份缺失或不一致且已有内容时返回 `singleton_migration_required`；
- 已存在字段的类型、必填、唯一、默认值、singleton、关系目标或 `on_delete` 与契约不一致时，
  setup 和 verify 均阻断并输出 `migration_required`；
- 经过确认的旧字符串文件字段只允许出现在 `CMS_LEGACY_FIELD_ALLOWLIST`，verify 会持续输出
  删除条件明确的 legacy 警告；
- `npm run cms:migrate-contract` 默认 dry-run。真实写入必须显式增加 `--apply`，并设置
  `CONFIRM_CMS_CONTRACT_MIGRATION=2026-08-phase3`；写入前会在 Git 忽略的
  `output/cms-migrations/` 保存受影响集合快照及 SHA-256；
- 迁移只接受已有稳定 slug/key/issue、审核 seed key 或人工确认的“集合记录 ID → 稳定 key”
  映射。每个 ID 映射必须同时声明 collection、record ID、target stable key 与 expected-before
  精确断言；ID 对应记录不符合审核预期时输出 `manual_mapping_required`。文本或 hash 只能验证
  已由 ID 选中的记录，不能用于寻找记录；未知记录禁止按名称、标签、数字、说明或排序猜测；
- 旧 `homepage_content.stats` 只有在条目本身携带稳定 ID 且该 ID 与审核映射及 expected-before
  一致时才可迁移；缺少稳定 ID 时必须人工映射，禁止使用数组顺序推断；
- 对 active 已有数据集合补充 `content_key` 时，迁移严格按“创建 nullable/非 unique
  字段 → 回填 → 重新读取并验证无 null → 验证无重复 → 收紧 required → 增加 unique → 完整
  verify”执行。各步骤幂等，中途失败后可安全重跑，第二次运行应为零变更；
- `cases.metrics`、`news.summary` 与 `news.published_at` 保持真实环境当前的 string 契约，不为
  当前短文本和空数据开发 string→text/timestamp 转换；`news.slug` 的 unique 仍是必要目标；
- verify 对 private `contact_leads` 只读取集合、字段和关系元数据，不请求任何记录内容；迁移
  只允许针对 `status= new` 与 `source=website` 的默认值执行显式 schema-only 计划，不能读取、
  快照或回填历史留言；
- Directus API 的多次写入不具备单一数据库事务保证。迁移因此采用 fail-fast、逐步幂等、先备份
  和可安全重跑策略，不宣称原子性。

真实 CMS 已在发布提交 `1c3c81e336d3fc67de74ccd5d550981c9603052d` 基线上执行只读 dry-run。
初次理想化契约产生296项人工映射；本次真实环境契约收口补丁的只读复检降为144项，均来自
active 的仓库、FAQ、发展历程、荣誉和首页统计 claimKey。legacy 映射为0，仍未 apply、未部署。
正式操作仍必须经过人工审核映射、异机备份、显式 apply、迁移后 `npm run cms:verify` 和第二次
零变更 dry-run。

答案支持 `{{partnerBrands}}`、`{{warehouseArea}}`、`{{shippingAccuracy}}` 等事实占位符。
渲染时由 `src/lib/claims.ts` 替换为当前审核值，避免品牌数量、仓储面积和时效口径在
后台文案中逐渐失真。新增占位符前应先进入事实注册表并通过审核。

初始化命令会导入 17 个页面、100 条现有 FAQ：

```bash
npm run cms:generate-faq-seeds
DIRECTUS_URL=https://example.com/cms DIRECTUS_TOKEN='<admin-token>' node scripts/setup-cms.mjs
```

初始化只补齐缺失页面和问题，不会覆盖后台已经编辑的记录。Singleton 运营内容应通过 Directus
后台、受控内容同步或显式迁移维护，不能依赖 setup 更新。初始化完成后会查找
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
