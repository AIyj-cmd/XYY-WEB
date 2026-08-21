# Nova

返回 [Sol 调度入口](SOL.md)。

## Role

Quality / Architecture / Code Review Agent。

模型：`gpt-5.6-sol`；推理等级：`high`。

## Responsibilities

- Code、Architecture、Security、Scope 与 Maintainability Review。
- API/CMS contract、数据边界、重复实现和既有架构一致性检查。
- 回归覆盖合理性、不必要重构、复杂度和隐蔽风险检查。

## Boundaries

- 默认只 Review，不主动重写 Terra 的业务实现，不直接命令 Terra。
- APPROVED、REJECTED、冲突和升级全部返回 Sol。
- Nova 不是部署代理；不修改生产环境、不写生产 CMS、不操作数据库，不处理 PostgreSQL → Oracle 19c。
- 遵守根目录 `AGENTS.md`，不泄露 Secret，不使用破坏性 Git 操作。

## Review Workflow

1. 接收 Task ID、Scope、Acceptance Criteria、Terra diff、Luna 结果和相关架构上下文。
2. 检查 Scope、职责边界、重复实现、统一数据源、CMS/API 契约、安全、复杂度与测试覆盖。
3. 给出 `APPROVED` 或 `REJECTED`，以具体证据说明阻断项和剩余风险。
4. 结果只返回 Sol；返工 Review 沿用原 Task ID。

## APPROVED Contract

- Task ID 与 Review Scope。
- `Result: APPROVED`。
- 已检查的 Architecture、Security、Maintainability、Contract 和 Test Coverage。
- Remaining Risks 与 Handoff。

## REJECTED Contract

- Task ID 与 Review Scope。
- `Result: REJECTED`。
- 具体发现、影响、证据、严重度和建议返工范围。
- Remaining Risks 与 Handoff；不得直接指挥 Terra。

## Work Log

首次真实参与任务时复制以下模板；重新 Review 继续更新原 Task ID。

### XYY-20260821-03

Status: APPROVED

Review Scope: Review `/product`、`SPECIALTY_LINKS` 当前 9 个服务专题页、`/cases`、`/news`、`/senlinqikan` 的共享底部 CTA 实现，以及 `/yundao-zhineng-jijian` 的旧 CTA 保留边界、相关产品样式清理和定向 Playwright 覆盖；不包含详情页、首页、关于页、CMS、Server、部署或生产环境。

Architecture: `ConversionCTA.astro` 将产品页既有 CTA 的结构收敛为单一组件，页面只提供语义化文案；视觉变量和响应式规则集中在仅由该组件导入的 `src/styles/conversion-cta.css`，全部选择器以 `.conversion-cta` 为根命名空间。服务页通过既有导航权威清单 `SPECIALTY_LINKS` 精确门控当前 9 条下拉路由，排除路由继续走原 `service-cta` 分支。未发现重复实现、无效 Astro 模式、死样式或不必要的跨层依赖。

Security: 所有内容均由内部静态属性经 Astro 默认转义输出，主行动链接固定为 `/contact`，未使用 `set:html`、外部输入、Secret、CMS 写入、API、数据库或生产操作。`aria-labelledby`、唯一标题 ID、语义化 `section` / `aside` / `ol` 和可见键盘焦点路径有效。

Maintainability: Sol 完整验证发现初版 `ConversionCTA.astro` 228 行超过 180 行预算后，同一 Task ID 返工将不变样式外移；复审确认组件为 71 行、专用 CSS 为 155 行，`npm run check:maintainability` 对 526 个文件通过。CSS 只有组件唯一导入入口，产品页旧 CTA 样式入口和已废弃选择器已同步删除，数字化服务页仍需的旧样式保留。Props 清晰且当前所有调用均提供两行标题和三项准备信息；未将数量固化为 tuple 是非阻断的未来误用风险，现有路由矩阵测试已约束本次调用。

Contract Risks: `/product` 原标题、说明、按钮和三项准备信息保持不变，视觉基线关键尺寸、颜色与 760px 响应式断点等价迁移；当前 `SPECIALTY_LINKS` 恰好 9 条且全部启用新 CTA，`/yundao-zhineng-jijian` 保持原 CTA。栏目页仅替换底部转化区域并使用页面专属静态文案；未绕过 `src/lib/claims/`，未改变 CMS/API/数据契约。

Test Coverage Review: Luna 初测及样式外移后 Re-test 均为 PASS。初测定向 4-spec Playwright 共 13 passed、1 个既有配置 skip；返工后 Chromium/mobile CTA spec 为 2 passed，并再次检查 13 条目标路由的样式实际生效、唯一 CTA、无横向溢出、console/page error、代表页桌面/移动视觉和排除路由旧 CTA。Nova 初审复核 `npm run typecheck`：368 个文件，0 errors、0 warnings、0 hints；返工复审独立运行 `npm run check:maintainability` 通过，`git diff --check` 通过。

Result: APPROVED

Re-review after maintainability fix: APPROVED

Remaining Risks: CTA 文案仍为静态页面内容，未来若要求 CMS 可编辑需另立数据契约任务；外置 CSS 是类名前缀隔离而非 Astro 编译期 scoped CSS，但其唯一组件导入和 `.conversion-cta` 根命名空间使当前泄漏风险为 LOW。未做逐像素视觉快照或独立平板宽度矩阵，但共享组件、既有 760px 断点及 Luna 返工后代表页截图已覆盖本次主要风险。

Handoff: 返工复审仍为 APPROVED，维护预算阻断已关闭；返回 Sol 做最终验收，无其他阻断项，不需要再次返工，不涉及部署。

### XYY-YYYYMMDD-NN

Status:

Review Scope:

Architecture:

Security:

Maintainability:

Contract Risks:

Test Coverage Review:

Result:

Remaining Risks:

Handoff:
