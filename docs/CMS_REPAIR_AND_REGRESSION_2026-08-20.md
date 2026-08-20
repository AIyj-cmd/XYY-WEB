# CMS 修复方案与完整回归报告（2026-08-20）

## 结论

本轮修复了本地审计确认的代码缺陷，并在全新 PostgreSQL、Directus 12.1.1 和 Astro SSR 组成的隔离环境中完成真实 CMS 写入闭环。未连接或修改验收站、主站、真实 CMS、真实数据库、权限或部署。

## 已实施修复

- Singleton 初始化不再查询集合中未定义的系统字段，全新数据库可一次完成 Setup。
- `news.cover_image` 不再继续使用旧字符串兼容路径；迁移仅在全部非空值均为 UUID 时转换物理列，否则明确报告 `data_validation_required` 并停止关系收敛。
- 新闻 slug 增加小写字母、数字和连字符校验；迁移会检查空白、格式错误和规范化重复，前台也会拒绝非规范 slug。
- 已发布新闻必须填写 `published_at`；列表和详情只展示发布时间不晚于当前时间的记录，空值或非法日期不再显示为 1970 年。
- CMS 图片和附件改经 `/api/cms-assets/{uuid}` 交付。代理使用服务端内容令牌，只放行已发布内容引用的文件，支持 Range，请求不到或未引用时关闭失败。
- 内容权限同步与审计纳入 `directus_files` 只读权限；联系令牌仍不得读取文件或内容。
- 服务功能标题也执行审核 Claim 占位符替换，不再泄漏 `{{shippingSla}}`。
- 发布包包含 `scripts/`，服务器端 `cms:verify` 和运行权限审计不再因脚本缺失失败。

## 隔离环境真实回归

- 全新数据库一次 Setup：19 个集合、100 条 FAQ、14 项内容只读权限，`cms:verify` 为 0 failure。
- 后台 `news/+` 可反复打开；创建草稿、录入富文本、上传 PNG、选择封面、保存、返回列表并重开后封面 UUID 与预览均保留。
- 尝试在 `published_at` 为空时发布，后台明确以 `Published At: Value can't be null` 阻止；填写有效日期后发布成功。
- 发布后 `/news` 与文章详情均显示标题、正文和封面；站内资源代理返回 200，Range 返回 206，未引用 UUID 返回 404，Directus 匿名资源仍返回 403。
- 创建并发布一条关联新闻页的临时 FAQ，前台显示成功；随后删除并确认不存在。
- 文章切回草稿后从列表消失，详情重定向回 `/news`；后台删除文章和文件库附件成功。
- 清理结果：测试文章 0、测试附件 0、临时 FAQ 0，FAQ 基线恢复为 100。
- 发布级 E2E 在隔离库生成的 10 条联系表单记录随一次性数据库一并删除；本地 Directus、Astro 和浏览器会话均已停止，临时目录已移除。
- 双令牌运行权限审计通过：13 个运行内容集合与 `directus_files` 只读，联系令牌仅创建 `contact_leads`，敏感系统集合、legacy 集合和反向访问均被拒绝。
- `npm run verify:release` 全部通过：364 个 Astro/TypeScript 文件 0 问题、522 个文件维护预算通过、41 个单元测试文件 276 项通过、E2E 37 项通过且 7 项按配置跳过、正式域名契约 3 项通过、最终生产构建通过。

## 部署侧执行顺序

1. 分别备份主站和验收站 Directus 数据库与上传目录，并记录当前 Release、CMS Schema 和 `news.cover_image` 物理列/关系状态。
2. 使用新代码先执行 `npm run cms:migrate-contract` dry-run。若报告异常 slug、规范化重复或非 UUID 封面数据，先人工清洗并复跑，不得直接强制转换。
3. 审核计划后显式设置 `CONFIRM_CMS_CONTRACT_MIGRATION=2026-08-cms-hardening` 执行迁移，再运行 Setup，同步 `directus_files` 只读权限。
4. 部署新 Web Release，运行 `npm run cms:verify`、`npm run cms:verify-runtime-permissions`、`npm run verify:release`，确认 `/version` 和 `/healthz`。
5. 在每个环境各创建一篇带一次性封面的测试文章，完成草稿、重开、发布、取消发布、删除文章和删除附件，并验证 FAQ、新闻列表、详情及资源代理；最后确认无测试数据残留。

本报告不授权远端迁移、权限变更、发布或真实 CMS 写入；这些操作仍需单独确认。
