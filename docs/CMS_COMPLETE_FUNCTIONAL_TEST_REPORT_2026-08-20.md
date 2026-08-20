# CMS 全功能回归报告（2026-08-20）

## 1. 结论

本轮在两套一次性本地 PostgreSQL + Directus 12.1.1 环境中执行，覆盖截图中的全部后台内容菜单、文件库、前台消费者、权限与清理闭环。没有连接、写入、迁移或部署验收站与主站。

文章封面“上传成功但选择无效”和文章 `new` 页面偶发打不开，在修复后的本地代码与全新 CMS Schema 中均未复现。封面已实际执行“移除旧封面 → 打开文件库 → 选择另一张图片 → 保存 → 返回列表 → 重开文章”，后台、Directus 字段和前台详情均读取到新文件 UUID。

测试过程中新增发现并修复两类代码问题：

1. 部分 active 集合的稳定身份字段只有后台必填提示，没有完整数据库 `NOT NULL + UNIQUE`；`services.slug` 可以重复。
2. 联系表单限流单测在执行环境存在真实可写令牌时会调用真实存储，污染当前 CMS。

修复后全新 Setup、既有库迁移、约束测试、完整 CMS 回归和发布级验证均通过。

## 2. 测试环境与基线

- Directus：12.1.1。
- 数据库：两套一次性本地 PostgreSQL 数据库，一套用于完整写入，一套用于修复后全新 Setup 复验。
- Web：本地 Astro SSR。
- 基线：19 个契约集合，13 active、5 legacy、1 private；FAQ 100、新闻 0、联系留言 0、文件 0。
- CMS Schema：`2026-08-cms-hardening`。
- 内容与联系使用两枚独立最小权限令牌；管理令牌只用于本地建模、测试和清理。

## 3. 后台菜单稳定性

- 14 个内容列表/Singleton 页面和文件库，共 15 个入口，每个连续打开 5 次：75/75 通过。
- 11 个支持创建的 `new` 页面，每个连续打开 5 次：55/55 通过。
- 所有页面均返回 200、显示有效标题或表单，没有空白页、加载失败或非预期 HTTP 4xx/5xx。
- 11 个本轮创建的记录均从列表进入编辑页并重开成功，测试标记与关系字段可见。

覆盖入口：关于内容、发展历程、企业荣誉、合作案例、森林期刊、仓库信息、联系留言、全站设置、FAQ 页面、FAQ、首页内容、文章、服务专题、仓配服务和文件库。

## 4. 集合写入与前后台联动

### 普通集合

`faq_pages`、`services`、`warehouses`、`cases`、`news`、`faqs`、`publications`、`service_pages`、`about_history`、`about_honors` 均执行：

- 创建草稿；
- 公开查询不可见；
- 更新并发布；
- 公开查询可见；
- 保存后重开字段一致；
- 前台对应页面读取到测试标记；
- 删除并恢复基线。

FAQ 的 `faq_page` 多对一关系在子记录、父页面后台和前台新闻 FAQ 区均验证成功。新闻非法 slug、重复 slug、非法文件关系与 FAQ 页面重复 key 均被拒绝。

### Singleton

`homepage_content`、`about_content`、`site_settings` 均执行原值备份、修改、重读和完整恢复；最终记录 ID、内容与基线一致。

### 联系留言

- 浏览器真实填写并提交联系页，`POST /api/contact` 返回 200，页面显示提交成功。
- Directus 新记录默认 `status=new`、`source=website`。
- 管理员可查看并更新状态；联系令牌不能读取历史留言。
- 非法表单返回 400；同一来源前 5 次提交成功，第 6 次返回 429。

## 5. 文件与封面

- 上传并建立 PNG、WebP、PDF 与内容字段关系。
- 新闻封面通过真实后台文件库重新选择并保存，重开后标题、下载链接和 UUID 一致。
- 案例、新闻、期刊封面、期刊 PDF、服务 Hero、发展历程图片和荣誉图片关系均保存并重读成功。
- 已发布引用资源经站内 `/api/cms-assets/{uuid}` 返回 200；WebP MIME 为 `image/webp`。
- Range 请求返回 206 和指定 100 字节。
- 未引用或不存在 UUID 返回 404；Directus 匿名 `/assets/{uuid}` 保持 403。
- 删除仍被引用的文件时，Directus 按关系契约把字段置空；前台不再输出旧 UUID，也未生成空 `img src`。

## 6. 发布、时间和前台检查

- 新闻未来发布时间：列表不可见，详情 302 回新闻列表。
- 改为已到期时间：列表显示，详情 200。
- 切回草稿：列表消失，详情重新 302。
- 案例列表/详情、新闻列表/详情、森林期刊、关于、仓库、荣誉、服务专题和 FAQ 均读取到已发布测试数据。
- 桌面 1440×900 与移动端检查均无水平溢出；资源代理、`sitemap.xml`、`llms.txt`、`robots.txt` 状态与 MIME 正常。
- `PUBLIC_SITE_URL` 决定 canonical 与 CMS 资源绝对地址；部署时必须在验收站和主站分别设置正确域名。

## 7. 本轮新增修复

### 稳定身份数据库约束

以下 active 身份字段现在统一为后台必填且数据库 `NOT NULL + UNIQUE`：

- `homepage_content.key`
- `faq_pages.key`
- `services.slug`
- `warehouses.content_key`
- `cases.slug`
- `news.slug`
- `faqs.content_key`
- `publications.issue`
- `service_pages.slug`
- `about_content.key`
- `about_history.content_key`
- `about_honors.content_key`
- `site_settings.key`

合同迁移现在读取全部 13 个 active 集合，并区分后台 `required` 标记与数据库 `NOT NULL`。本地既有库 dry-run 正确计划 10 项约束并成功 Apply；修复后的全新 Setup 直接生成正确约束，随后迁移 dry-run 为 0 变更。

约束复验结果：10 个普通集合空写入全部返回 400；有基线数据的稳定身份重复写入全部返回 `RECORD_NOT_UNIQUE`；意外创建记录为 0。

### 单测禁止真实 CMS 写入

`tests/unit/contact.test.ts` 默认清空 CMS 存储环境，限流用例使用模拟 Directus 响应。使用真实可写本地令牌运行单独联系单测与整套 `verify:release` 后，`contact_leads` 仍为 0。

## 8. 验证结果

- `cms:verify`：19 集合，0 warning，0 failure，文件 0。
- `cms:verify-runtime-permissions`：13 个内容集合 + 文件只读、联系仅创建，通过。
- Astro/TypeScript：364 个文件，0 error、0 warning、0 hint。
- 维护性预算：522 个项目文件，通过。
- 单元测试：41 个文件，278 项通过。
- Playwright E2E：37 项通过，7 项按项目配置跳过。
- 正式域名契约：3 项通过。
- 最终生产构建：通过。
- 清理后：新闻 0、联系留言 0、Directus 文件 0，所有集合计数与 Singleton 恢复基线。

## 9. 已知非阻塞现象

Directus 12.1.1 的新闻富文本编辑器在打开时会记录一次 `Unexpected token '<'`。服务器日志显示其相对语言脚本请求落到 `/admin/content/news//langs/en-US.js` 并返回 Admin HTML。该现象不阻塞富文本加载、封面选择、保存或重开，属于 Directus Admin/TinyMCE 静态路径问题；本轮未修改上游 Directus 代码。建议部署侧升级前先在目标版本复验，或将其作为低优先级上游问题跟踪。

## 10. 部署前要求

本报告只证明当前仓库代码在隔离环境通过，不能替代验收站和主站的实际 Schema/Release 同步。

部署侧应在获得授权后：

1. 分别备份验收站/主站数据库与上传目录。
2. 确认内容策略已存在，或显式设置 `DIRECTUS_CONTENT_POLICY_ID`。
3. 先运行合同迁移 dry-run，清理任何空或重复稳定身份，再 Apply。
4. 为每个环境设置正确的 `DIRECTUS_URL`、两枚运行令牌、`PUBLIC_SITE_URL` 和 `PUBLIC_DIRECTUS_URL`。
5. Apply 后运行 `cms:verify`、运行权限审计和 `verify:release`。
6. 验收站再执行一次带测试前缀的可逆后台封面/发布闭环；主站默认只做只读 Smoke，任何写入继续单独审批。
