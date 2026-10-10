# XYY-20261010-08 — 本地基础内容初始化修复

## 范围与基线

- 风险 MEDIUM；用户已授权修复 `/home/yj/data/website` 本地代码。
- HEAD `31395e15ae24d14899367e5e2ba69e7187762a97`；已有 `DEV_STATE.md`、`docs/SOL.md` 差异必须完整保留。
- 输入为当前受审核种子、CMS 契约和本任务上一轮只读诊断。新服务器内容为空的直接原因是此前 schema-only 初始化跳过种子。
- 排除真实 CMS / 数据库 / 权限写入、服务器连接、部署、推送、提交、删除、环境文件变更，以及前端“成功空响应保持为空”契约变更。

## 文件所有权

- Sol：本合同、README.md、docs/CMS_CONTENT_MODEL.md、DEV_STATE.md、docs/SOL.md；范围控制与最终验收。
- Terra 初始化：scripts/setup-cms.mjs、scripts/init-cms-content.mjs、scripts/lib/cms-content-*.mjs、scripts/lib/cms-setup-options.mjs、package.json；必要的 cms-seed-runtime.mjs / directus-admin.mjs 最小修正及其定向测试；docs/TERRA.md 追加本任务记录。
- Terra 内容包：scripts/generate-cms-content-seeds.mjs、其生成的 scripts/data/approved-cms-page-seeds.mjs、src/i18n/case-sources.ts / cases.ts、相关新内容包测试；单独 docs/TERRA-content-20261010-08.md。
- Luna：独立离线验证、新初始化场景测试、必要的本地模拟 CMS 和浏览器证据；docs/LUNA.md。
- Nova：实现后的独立只读审查；docs/NOVA.md。
- 代理共享工作区，保留其他人的修改，不回退或覆盖其他所有者文件，不再委派。

## 可观察验收条件

1. 提供明确的基础内容入口，默认仅预览，显式 `--apply` 才写入；另有只读完整性检查。只操作受审核基础集合，不读取或写入新闻、询盘、legacy 集合，不创建 Schema 或修改权限。
2. 初始化复用现有受审核种子，空模型可导入全部基础内容，FAQ 正确关联；完成后回读验证必需身份、发布状态和页面关键字段。报告真实 created / existing / missing 等结果，缺内容不得报完整。
3. 全部读取预检成功后才开始写入；错误、非法响应和重复身份明确失败。已有内容、草稿及人为留空不被覆盖或重新发布。完整内容二次执行不发生内容写入；普通 Web 部署不运行初始化，不恢复主动删除的内容。
4. 明确区分 setup 的正常基础内容模式与显式 schema-only 模式；schema-only 零内容写入并明确提示尚未初始化内容。现有健康检查保持依赖连通性含义，首次内容验收独立执行。
5. 六个初始案例使用已有本地封面，所有受审核基础案例可通过英文源绑定；更改未审核源后仍被拒绝。生成文件通过生成器更新，已有生产源指纹继续有效。
6. 以模拟请求/本地合成 HTTP 验证预览、空库导入、幂等、已有编辑/草稿保护、空默认 Singleton、失败前零写入和写后缺项失败；不执行真实 CMS 工具。
7. 独立定向测试、相关格式/Lint/维护性/类型检查及 Nova 审查通过；涉及显示的数据变更用本地合成 CMS 抽查桌面和手机。没有提交或部署，完整发布门禁不在本轮执行。

## 实施限制

- Directus 多次 API 写入不是事务；中断须报告失败，显式重试只补缺失身份，不声称原子回滚。
- 初始化与日常后台内容维护分离。已存在但不完整的记录只报告，不猜测补文案；不自动运行具有覆盖或归档语义的历史同步/迁移脚本。
- 本地验收不等于真实新服务器内容已经初始化；未来目标环境应用须单独核对。
