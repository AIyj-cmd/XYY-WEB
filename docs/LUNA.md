# Luna

返回 [Sol 调度入口](SOL.md)。

## Role

Independent QA / Test Engineer。

模型：`gpt-5.6-luna`；推理等级：`high`。

## Responsibilities

- Bug reproduction、功能测试、回归测试和边界条件验证。
- Vitest、Playwright、桌面端、移动端和 API 行为验证。
- CMS fallback 行为验证与必要的测试代码维护。

## Boundaries

- 保持独立测试角色；除测试代码外，原则上不修改应用代码。
- 发现业务代码错误时向 Sol 报告，不直接修复或指挥 Terra。
- 不部署、不修改生产环境、不写生产 CMS、不操作数据库，不处理 PostgreSQL → Oracle 19c。
- 遵守根目录 `AGENTS.md`，保留用户修改，不泄露 Secret，不使用破坏性 Git 操作。

## Test Workflow

1. 接收 Task ID、Acceptance Criteria、Terra 结果或 diff 和风险重点。
2. 选择与风险匹配的功能、回归、桌面、移动、API、CMS fallback 与边界测试。
3. 保存可复现证据，明确 PASS 或 FAIL。
4. 只向 Sol 交付结果；复测沿用原 Task ID。

## PASS Contract

- Task ID。
- `Result: PASS`。
- Tests performed。
- Regression coverage。
- Remaining risks。

## FAIL Contract

- Task ID。
- `Result: FAIL`。
- Expected 与 Actual。
- Reproduction 与 Evidence。
- Likely affected area。
- Severity。

## Work Log

首次真实参与任务时复制以下模板；复测继续更新原 Task ID。

### XYY-20260821-03

Status: PASS

Test Target: `/product`、`SPECIALTY_LINKS` 的 9 个服务专题页、`/cases`、`/news`、`/senlinqikan`，以及排除范围内的 `/yundao-zhineng-jijian`。

Acceptance Criteria: 共享 CTA 结构与文案、产品页原始文案、页面级 `/contact` 主链接、ARIA 语义与键盘焦点、桌面/移动无横向溢出、旧数字化服务 CTA 保留、无控制台错误。

Tests:

- 独立运行 `npx playwright test tests/e2e/conversion-cta.spec.ts tests/e2e/service-pages.spec.ts tests/e2e/product-motion.spec.ts tests/e2e/service-motion.spec.ts`：13 passed、1 skipped；跳过项为既有服务动效测试在移动项目中的明确配置跳过。
- 独立 Playwright 路由矩阵覆盖 13 条目标路由的 1440×900 与 360×800：HTTP 200、每页恰好 1 个 `[data-conversion-cta]`、1 个 `h2`、1 个 `aside`、3 个列表项、1 个 `/contact`、ARIA 关联、键盘焦点 outline 和无横向溢出全部通过。
- 独立 Playwright 复核 `/yundao-zhineng-jijian`：`.service-cta` 为 1，`[data-conversion-cta]` 为 0。
- 独立 Playwright 采集并人工检查 `/product`、`/xiefu-yuncang`、`/cases`、`/news`、`/senlinqikan` 在桌面与移动端 reveal 完成后的 CTA 截图；左侧转化文案、橙色行动按钮、右侧三条准备信息和移动堆叠布局可读。
- 精确核对 `/product`：标题、说明、`提交仓配需求` 及三条原始准备信息保持一致；`warehouse-cta-heading` 唯一且无重复 ID。
- 全部独立检查页面无 console error 或 page error；`git diff --check` 通过。

Result: PASS

Evidence: 本地隔离站点 `http://127.0.0.1:4401`，Directus 使用不可达地址触发静态 fallback；截图保存在 Git 忽略的 `output/playwright/`。

Regression: 既有 service layout、service motion、product motion 和 service page tests 均通过；服务页原 CTA 保留边界通过。

Risks: CTA 文案当前为静态页面文案；若未来需要 CMS 后台编辑 CTA，需要另行定义数据契约与权限范围。截图检查依赖滚动 reveal 完成后采集，不代表首帧动画状态。

Handoff: 返回 Sol；Task `XYY-20260821-03` 可进入 Nova Review。

#### Re-test after style extraction

Status: PASS

Result: PASS

Tests performed:

- `npx playwright test tests/e2e/conversion-cta.spec.ts --project=chromium --project=mobile`：2 passed。
- 独立 Playwright 复测 `/product`、`/xiefu-yuncang`、`/cases`、`/news`、`/senlinqikan` 的 1440×900 与 390×844 视觉状态；等待 reveal 完成后截图，CTA 背景、栅格/移动单列布局、标题、描述、按钮及三项列表均正常。
- 独立 Playwright 检查 13 条目标路由：均 HTTP 200、恰好 1 个 CTA、无横向溢出、CTA 样式实际生效、无 console/page error。
- 独立复核 `/yundao-zhineng-jijian`：旧 `.service-cta` 为 1，新 `[data-conversion-cta]` 为 0。
- `npm run check:maintainability`：526 files，PASS。
- `git diff --check`：PASS。

Evidence: 新的 `src/styles/conversion-cta.css` 已由 `ConversionCTA.astro` 导入；代表页面 computed background 为 `rgb(240, 241, 239)`，桌面为两列、移动为单列，服务与产品 reveal 后标题 opacity 接近 1。复测截图位于 Git 忽略的 `output/playwright/retest-*`。

Regression coverage: focused CTA spec 的 Chromium/mobile 均通过；路由矩阵、服务页旧 CTA 边界、产品/服务 reveal 和响应式 overflow 均通过。

Remaining risks: 本次只移动不变样式，未扩大到 CMS CTA 数据化；截图验证覆盖 reveal 完成态，不覆盖首帧动画状态。

Handoff: 返回 Sol；返工复测通过，可进入 Nova Review。
