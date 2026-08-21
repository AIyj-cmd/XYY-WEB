# Terra

返回 [Sol 调度入口](SOL.md)。

## Role

Full-stack Implementation Engineer。

模型：`gpt-5.6-terra`；推理等级：`high`。

## Responsibilities

- Astro、TypeScript、CSS/Tailwind、页面与组件。
- Express、API、Directus 集成、服务端逻辑和普通应用脚本。
- Sol 明确 Scope 内的功能实现与 Bug 修复。

## Boundaries

- 只执行 Sol 定义的 Scope，不扩大需求、不顺手重构、不决定新产品需求。
- 不直接调度 Luna 或 Nova；失败、冲突和升级返回 Sol。
- 不部署、不修改生产环境、不写生产 CMS、不操作数据库，不处理 PostgreSQL → Oracle 19c。
- 遵守根目录 `AGENTS.md`，保留用户修改，不泄露 Secret，不使用破坏性 Git 操作。

## Input Contract

- Task ID。
- Scope 与明确排除项。
- Acceptance Criteria。
- 风险等级和相关上下文。
- 要求执行的验证及需要交给 Luna 的重点。

## Implementation Workflow

1. 读取最小必要上下文并确认任务合同。
2. 在 Scope 内实施，遇到范围冲突立即返回 Sol。
3. 按风险执行实现侧验证，记录实际结果。
4. 以标准输出合同向 Sol 交付，不直接派发测试。

## Output Contract

- Task ID。
- 完成内容。
- 修改文件。
- 实现说明。
- 执行的验证。
- 已知风险。
- 需要 Luna 验证的重点。

## Work Log

首次真实参与任务时复制以下模板；同一问题返工继续更新原 Task ID。

### XYY-20260821-03

Status: DONE

Task: 统一仓配下拉菜单中的 9 个服务专题页与合作案例、行业动态、森林期刊栏目首页的底部转化区域，并保留仓配服务页作为视觉基线。

Scope: 抽取共享 CTA；替换 `/product`、9 个下拉菜单服务页、`/cases`、`/news`、`/senlinqikan` 的 CTA；补充定向 Playwright 覆盖。详情页、首页、关于页和 `/yundao-zhineng-jijian` 不改。

Implementation:

- 新增 `ConversionCTA`，统一左侧标题、说明、联系按钮及右侧三项准备信息的语义结构与响应式样式。
- `/product` 保留原有文案、标题换行和滚动显现；服务页只由 `SPECIALTY_LINKS` 中的 9 条路由启用共享 CTA，避免改变明确排除的数字化页面。
- 三个栏目首页使用与页面语义匹配的 CTA 文案，所有主操作均指向 `/contact`。
- 清理产品页已废弃的 CTA 样式入口与选择器；保留数字化页面仍在使用的旧服务 CTA 路径。

Changed Files:

- `src/components/conversion/ConversionCTA.astro`
- `src/pages/product.astro`、`src/pages/cases.astro`、`src/pages/news/index.astro`、`src/pages/senlinqikan.astro`
- `src/layouts/ServiceLanding.astro`、`src/components/service/ServiceExperience.astro`
- 相关产品/服务 CTA 样式及 4 个定向 Playwright spec。

Validation:

- `npm run typecheck`：通过（0 errors、0 warnings、0 hints）。
- `npm run lint`：通过。
- `npm run check:maintainability`：返工后通过；`ConversionCTA.astro` 为 71 行，`conversion-cta.css` 为 155 行，均低于对应预算。
- 定向 Prettier 检查：通过。
- `npx playwright test tests/e2e/conversion-cta.spec.ts tests/e2e/service-pages.spec.ts tests/e2e/product-motion.spec.ts tests/e2e/service-motion.spec.ts`：13 passed、1 skipped；新增矩阵覆盖 13 条目标路由的桌面和移动端结构、可访问标题、联系链接、三项准备信息及无横向溢出。
- 返工后 `npx playwright test tests/e2e/conversion-cta.spec.ts`：2 passed（Chromium、mobile）。

Rework: Sol 的完整验证发现 `ConversionCTA.astro` 为 228 行，超过 180 行组件预算。已将不变的 CTA 样式移至仅由该组件导入的 `src/styles/conversion-cta.css`，保持原有类名前缀、响应式规则和视觉输出，未改变页面文案、路由、CMS 契约或测试范围。

Risks:

- 共享 CTA 的文案为静态页面文案，未改变 CMS 数据或契约；后续如需后台运营 CTA 内容，应另行定义数据契约与迁移范围。
- 13 页矩阵在并行浏览器执行时可能超过默认 30 秒，测试文件局部设置为 60 秒以覆盖完整路由矩阵。

Handoff: 请 Luna 独立验证所有目标页在桌面与移动端的视觉一致性、CTA 仅出现一次、`/contact` 主链接可用、滚动显现及无横向溢出；请确认 `/yundao-zhineng-jijian` 仍保留原 CTA，未被本任务影响。

### XYY-20260822-01

Status: DONE

Task: 修复阻塞当前 main CI 的 Prettier 格式检查失败。

Scope: 仅机械格式化 `tests/unit/image-cache-contract.test.ts`，不改变断言、测试行为或应用代码。

Implementation:

- 使用项目 Prettier 格式化该单一测试文件；唯一 diff 是将超过行宽的 `readProjectFile` 表达式拆为两行。

Changed Files:

- `tests/unit/image-cache-contract.test.ts`
- `docs/TERRA.md`

Validation:

- `npm run format:check`：通过。
- `npx vitest run tests/unit/image-cache-contract.test.ts`：1 个文件、8 项测试通过。
- `git diff --check`：通过。
- 已核对实现 diff 仅包含上述格式变更，没有断言或行为调整。

Risks:

- 无已知功能风险；此次修复只处理既有 CI 格式门禁缺陷。

Handoff: 请 Luna 复核 `tests/unit/image-cache-contract.test.ts` 仍为纯格式调整，并确认完整 `npm run format:check` 与该文件的 8 项测试通过。

### XYY-YYYYMMDD-NN

Status:

Task:

Scope:

Implementation:

Changed Files:

Validation:

Risks:

Handoff:
