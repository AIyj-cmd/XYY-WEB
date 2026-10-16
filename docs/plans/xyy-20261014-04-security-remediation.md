# XYY-20261014-04 安全报告修复合同

- 日期：2026-10-14；风险：HIGH；Sol 最终验收。
- 输入：`/home/yj/security-reviews/8.138.148.179-20261014/findings.json` 及所引证据。
- Git 基线：`9ad4fe0fa92bb14ee23fa2e6c7b79836c2798c80`。
- 既有修改：`DEV_STATE.md`、`docs/SOL.md` 和未跟踪 `docs/plans/xyy-20261014-03-native-release.md`；全部保留。
- 用户授权：按报告修复本地项目。生产、外部写入与权限变更仍按 AGENTS.md 独立核对。

## Scope 与所有权

- Terra：F-01 的公开 HTTPS 跳转与明文提交拒绝；F-04 的脚本 CSP 加固及必要的内联处理；F-05 的公开 origin 校验和构建/运行一致性防护。仅修改 `server/request-policy.mjs`、`server/runtime-config.mjs`、`server.mjs`、`astro.config.mjs`、`src/lib/site-config.ts`、`src/components/layout/DocumentHead.astro`、所需新增 `config/public-site.mjs`、`src/scripts/document-head.ts`、相关 `tests/unit/*security*.test.ts` / `tests/unit/request-policy.test.ts` / `tests/unit/public-site-config.test.ts` / `tests/unit/runtime-config.test.ts`，以及 `docs/TERRA.md`。其他必要文件先报 Sol 扩展合同。
- Luna：实现后独立测试；可新增本任务 `tests/e2e/security-remediation.spec.ts` 和 `tests/unit/security-remediation.test.ts`，只写测试、`docs/LUNA.md` 及 ignored `output/security/xyy-20261014-04/` 证据。
- Nova：先独立核对 F-02/F-03，后在 Luna PASS 后审阅最终候选；仅写 `docs/NOVA.md` 及本任务 ignored 审阅证据，不修改实现。
- Sol：本合同、`docs/operations/security-remediation-20261014.md`、`DEV_STATE.md`、`docs/SOL.md` 与 ignored 证据。
- 各角色不独占代码库，不撤销他人修改；子代理禁止再委派。

## 排除项

- 不执行 Git 提交/推送或部署；不连接服务器修改 Nginx/TLS/PM2/环境；不执行真实 CMS、数据库、Schema、权限、账号 MFA 写入。
- 不执行压力测试、密码猜测或有效真实咨询提交。不修改原生部署工作区与既有发布记录。
- 不改业务内容、公开数字、CMS 回退契约、视觉布局或无关依赖。

## Acceptance Criteria

1. 配置公开 HTTPS origin 时，HTTP GET/HEAD 在展示表单前跳转到准确 HTTPS origin，保留安全路径及查询；明文非安全方法不进入业务处理；受信代理协议与本地开发兼容，防止 Host/转发头伪造和开放跳转。
2. 正式发布构建/运行对空、非法、HTTP 或 loopback 公开 origin 明确失败；本地开发/CI 可显式使用 loopback。内部 CMS URL 不与公开 origin 混用；以 `https://8.138.148.179` 生成的 canonical、hreflang、OG、JSON-LD、robots 和 sitemap 一致。
3. 有效脚本 CSP 不含 `unsafe-inline`、不保留 loopback connect-src；允许必要的受控脚本，阻止未授权内联脚本。保留 CSS/动画、字体、导航、图库与表单行为，不以响应后盲目给所有脚本加 hash/nonce 的方式信任注入内容。
4. 中英文首页/联系页/About 的桌面和移动端行为及相关安全负例通过；测试只访问本地模拟服务，不写真实 CMS/询盘。
5. F-02/F-03 记录准确状态、官方配置依据、最小变更候选、MFA 用户绑定与恢复前提、限流核验步骤和回退条件；不把计划写成已修复。
6. 本次相关单测、类型/Lint/构建和 `npm run verify` 通过；Luna 独立 PASS，Nova APPROVED，Sol 核对差异及证据后验收本地范围。

## 证据与交接

- 证据目录：`output/security/xyy-20261014-04/`；保留失败及复测结果，不录凭据。
- 实现 → Luna 独立验证 → Nova 最终审阅 → Sol 验收；返工沿用本 ID。
- 生产报告五项分别记录“本地完成/生产待变更/待核验”，不声称线上修复。

## R2 返工（同任务）

- Luna 首轮安全单测及 12 组浏览器检查通过，但 `npm run verify` 在 `request-policy.test.ts` 两处类型错误失败，须修复后复测。
- Sol 在 ignored `mode-fixture/` 用合成 `.env.production` / `.env.development` 实际执行 `astro build --mode development`，确认新配置错误选择生产模式公开 origin。`build-r2.log` 为有效复现；初轮 `build.log` 为 CLI 路径错误，不是产品故障。
- Terra R2 所有权：`tests/unit/request-policy.test.ts` 的类型修正；`astro.config.mjs`、必要的 `config/public-site.mjs` mode 解析，以及 `tests/unit/public-site-config.test.ts` 回归。其他实现冻结。保持显式进程变量优先，不读取或修改真实环境文件。
- 新增完成判据：默认 build、dev 与显式 `--mode development` / `--mode=development` 使用对应环境文件；公开网址校验及构建/运行一致性仍成立。Luna 独立复测后再交 Nova。

## R3 返工（同任务）

- Luna R2 独立验证通过构建模式夹具、36 单测及补充浏览器交互，但完整 verify 的维护性检查发现 `request-policy.test.ts` 232 行超过 220 行限制。
- Terra 仅可将新增安全头测试拆入 `tests/unit/request-policy-security.test.ts`，调整原文件对应 import，并记录角色日志。断言语义与测试总数保持；禁止修改维护性预算或业务实现。
- Luna 重跑完整 verify；已通过且未受测试拆分影响的页面/运行态证据可复用。

## 本地验收结果

- Luna 最终 PASS：完整 `npm run verify` exit 0，127 个单测文件、861 项与构建通过；12 组页面及相关安全负例通过。
- Nova APPROVED、0 阻断；Sol 完成差异、证据及桌面/手机视觉验收。最终索引 `output/security/xyy-20261014-04/final-result.json`。
- 当前仅本地修复及生产候选准备完成；没有提交、推送、部署、真实 CMS/数据库或配置写入。首轮 readiness 可能跟随公开 health GET，不能宣称所有历史验证请求零外连；最终 harness 已限制本地。
- 线上五项仍保留，按运维候选分别取得准确生产授权、满足 MFA 用户参与条件及发布前验证后实施。
