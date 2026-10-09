# XYY-20261008-05 — 首页统计发布状态与字段投影

- 风险：MEDIUM，CMS 读取业务逻辑；Terra → Luna → Nova → Sol。
- 授权：用户先要求检查字段遗漏与测试覆盖，随后明确选择“直接完成最小本地修复”。仅本地修改与验证。
- 基线：HEAD `f04bd1e0e7b0fb921f7031606dc417b92e033e5a`；目标实现和既有三份测试无既有 diff。其他脏文件、角色日志旧内容均保留，指纹见 `output/homepage-stats/xyy-20261008-05/baseline.json`。

## Scope 与文件所有权

- Terra：`src/lib/directus-queries.ts` 中 `getHomepageStats()`；`tests/unit/directus.test.ts`、`tests/unit/directus-resilience.test.ts`、`tests/unit/homepage-claims-contract.test.ts` 中首页 singleton 样例；新增 `tests/unit/homepage-cms-contract.test.ts`；仅追加 `docs/TERRA.md` 本轮结果。
- Luna：独立本地测试；仅写本轮 `output/homepage-stats/xyy-20261008-05/luna/` 证据及追加 `docs/LUNA.md`。需要改测试时先报 Sol。
- Nova：独立只读 Review；仅追加 `docs/NOVA.md` 本轮结果。
- Sol：本合同、`DEV_STATE.md` 本轮状态和 `docs/SOL.md` 本轮记录；调度、授权核对、最终验收及证据。
- 排除：其他 CMS 查询、全局请求/回退机制、Claims 数值、页面模板与样式、CI 配置、真实 CMS/数据库/权限、提交/推送/部署。

## Acceptance Criteria

1. 首页查询显式请求 `id`、`status`、`stats`；只有 `published` 记录进入统计解析。
2. `draft`、成功空 singleton 和已发布空统计返回空数组，即使提供非空 fallback 也不使用它。
3. 首页 CMS 定义仅接受 `published/draft`（`statusField()`），缺失、`archived` 或其他非法 `status` 明确抛出已有 `invalid_data` 契约错误；不得回退或展示内容。现有非法 stats、Claims 校验继续生效；本轮不扩大修改共享类型定义。
4. 已发布样例显式提供 `status: 'published'`；返回数字仍来自 Claims。
5. 新增小型契约测试通过真实请求构造/响应解析路径，在 fetch 边界按实际 URL 的 `fields` 投影完整 CMS 记录，覆盖发布状态；不能无视请求字段返回固定完整对象。
6. 现有网络/超时/5xx 回退与权限/契约错误语义保持；本轮相关测试、类型、Lint、格式检查通过。Luna 独立测试 PASS、Nova Review APPROVED 后由 Sol 验收。

## 输入、证据与交接

- 输入：上述源码/测试、`src/lib/directus-client.ts`、`src/lib/directus/request-state.ts`、HomepageContentRecord 类型与 CMS 状态契约、Vitest 配置和 CI 环境设置。
- 改动前：Sol 运行 `npm test -- tests/unit/directus.test.ts tests/unit/directus-resilience.test.ts tests/unit/homepage-claims-contract.test.ts`，3 文件 / 20 tests PASS；旧测试未捕获字段遗漏。
- Luna 改动前独立复现：完整 draft 记录按请求的 `id/stats` 投影后丢失 status，实际仍返回 1 项统计；published 与成功空响应正常，3 项诊断测试通过。Nova 核对首页 CMS 状态选择仅有 published/draft；archived 视为非法值，不能照较宽的 TS 类型视为合法生命周期。
- 要求记录本次真实命令、退出码、投影复现、实际 diff、独立测试与 Review 结论。CI 原有离线回退环境保留，新文件按 Vitest 现有 glob 纳入 `npm test`。
- 不声称真实 Directus 或线上验证通过；本轮不提交/部署，因此不触发提交/部署专用全量闸门。页面模板未变化，以读取与数据契约验证为主。

## 状态

本地验收完成：Luna PASS，Nova APPROVED（0 findings），Sol 接受全部 AC。

- 改动前新契约测试 6 失败 / 1 通过，证实可捕获原缺口；修复后 Terra 4 文件 / 27 项通过。
- Luna 定向 7 文件 / 47 项及全量 114 文件 / 729 项通过，退出码均为 0；目标 Prettier / ESLint / diff 检查通过。单测日志中 Terminated 来自既有容量测试主动 SIGTERM，已定位且保留来源证据。
- Sol 最终 `npm run typecheck` 退出码 0，639 文件、0 errors、0 warnings、4 既有 hints。Terra 初次类型检查包装器未捕获退出码，以 Sol 最终命令为准。
- 范围外 93 项基线文件与原有角色日志前缀核对保持；DEV_STATE 与 Sol 日志仅添加本次结果。
- 没有真实 CMS/数据库/线上验证、提交、推送或部署；未运行完整 verify/verify:release。本轮未修改页面模板，无需浏览器布局测试。
