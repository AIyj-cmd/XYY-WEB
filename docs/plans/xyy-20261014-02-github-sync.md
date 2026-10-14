# XYY-20261014-02 — GitHub 推送与 Git 状态同步

## 授权与范围

- 用户本轮明确要求推送 GitHub 并同步 Git 状态；目标为现有 `origin`：`AIyj-cmd/XYY-WEB` 的 `main`。
- 风险 MEDIUM：汇总现有已实施业务与部署文档改动，但本轮没有部署或真实 CMS / 数据库操作。
- 基线 HEAD：`00318b57442903b7c28e5c541795a0dc05f91af8`；原暂存区为空，89 项既有修改/删除/未跟踪路径清单保存在 `output/git-sync/xyy-20261014-02/`。
- Scope：验证现有候选，纳入关于页/全站页脚、Oracle 专属方案清理、Google 验证文件及相关测试和任务记录；按用户追加要求更新 README，补充当前 Git 状态，创建提交并普通推送现有 main。
- 排除：新增业务需求、依赖升级、生产/测试站部署、真实 CMS/数据库/权限/DNS/TLS/Nginx/环境文件操作、强推、远端删除、Secret 与构建/备份/验收产物入 Git。

## 所有权与流程

- Sol：本合同、`README.md`、`DEV_STATE.md`、`docs/SOL.md`、暂存/提交/推送/回读与最终验收。README 为普通文档，由 Sol 直接更新。
- 既有业务实现本轮冻结；跳过不适用的 Terra 实施。发现实现缺陷后由 Sol 明确最小返工合同再交 Terra。
- Luna：只写 `docs/LUNA.md` 本任务段落与 ignored 证据目录；独立运行提交前 `npm run verify`、格式检查及与当前页面相关的定向桌面/移动端测试。不得直接改实现或测试。
- Nova：Luna 通过后审阅完整候选 diff、未跟踪候选、测试证据及外部动作边界；只写 `docs/NOVA.md` 本任务段落与 ignored 证据目录。
- 独立检查按 Luna → Nova → Sol 顺序；所有角色保留其他既有修改，不相互派发或扩大任务。

## 验收标准

1. 本次 `npm run verify` 实际 exit 0，格式及 diff 检查通过；页面定向桌面/手机测试通过，失败与限制如实记录。
2. Luna PASS、Nova APPROVED；候选无真实凭据、环境文件、构建/备份产物或范围外新增差异。
3. 普通推送 `origin/main` 成功；本地 HEAD、origin/main、GitHub main 回读 SHA 一致，工作树干净。
4. `DEV_STATE.md` 和角色日志准确区分本次 Git 提交/推送与未执行的网站部署；最终交付提交 SHA 与实际验证结果。

## 输入与证据

- 输入：AGENTS.md、本合同、DEV_STATE 当前相关段落、各角色最近相关日志、HEAD 基线及现有候选文件。
- 本次证据：`output/git-sync/xyy-20261014-02/`，包括基线、实际命令输出、验证日志、审阅、提交与远端回读。
- 不以历史通过结果替代当前测试；GitHub Actions 状态按本次实际回读报告。

## R1 提交门禁返工

- 本次实际验证发现：`gallery-catalog.ts` 211 行超过数据预算 180；`about-gallery-preview.spec.ts` 259 行超过测试预算 220；公共 HTML 检查拒绝用户已要求加入的 Google 文件。首轮失败日志保留，不能以绕过预检的构建代替通过。
- Terra 所有权：`src/data/about/gallery-catalog.ts`、新增 `src/data/about/gallery-image.ts`；`tests/e2e/about-gallery-preview.spec.ts`、新增 `tests/e2e/about-gallery-layout.spec.ts` 和 `tests/e2e/helpers/about-gallery.ts`；`scripts/check-public-artifacts.mjs`、`tests/unit/public-artifacts.test.ts`；`docs/TERRA.md` 本任务新增段和 ignored 证据。
- 最小修正：图库图片类型/构造辅助与157项清单按职责分离；图库布局完整性测试与交互测试分开，共享原墙面准备函数；公共 HTML 仅放行根目录准确 Google 文件名且内容与批准的53字节文本一致，其他 HTML 规则保持。
- R1 AC：157项图片元数据/顺序完全不变；原 E2E 断言/设备覆盖不减少；不提高预算或跳过门禁；允许正确验证文件，拒绝同名错误内容、嵌套同名及其他 HTML；相关测试、格式、维护预算通过后再交 Luna 完整复测及 Nova Review。
- 排除新增页面功能、修改原媒体、扩大 HTML 白名单、真实服务写入及依赖/环境配置变动。

## R2 过时图库背景测试

- R1 完整 verify 已完成837项单测与构建；E2E 首项实际失败定位到 `about-cases.spec.ts` 仍期望图库 `backgroundColor` 为纯白。已验收 R6 使用多层渐变，底层颜色透明属于当前设计；不应修改页面使旧测试通过。
- R1 E2E 已结束：18通过、10既有项目跳过、4失败。除背景断言外，两项无障碍测试仍通过旧简版页脚名称定位，另有一项 Esc 回归的 `:hover` 采样失败待诊断。
- Terra 仅可修改 `tests/e2e/about-cases.spec.ts` 中该项背景断言，改为验证实际计算背景包含径向及线性渐变；以及 `tests/e2e/about-hero-accessibility.spec.ts` 两处旧页脚定位，改为唯一 `contentinfo` 语义区并确认 `site-footer`。其余断言、测试范围、超时和页面源码保持。
- Luna 可独立诊断未修改的 Esc 回归（trace、鼠标点位、实际命中元素），不修改 preview 测试或产品源码；与 Terra 的两个测试文件修正所有权分离。诊断后再由 Sol 决定是否扩展精确返工合同。
- R2 AC：只改变已过时的背景预期，目标格式/Lint通过；Luna 定向复测失败用例通过，并明确其余测试实际结果。若出现其他失败须先报 Sol，不能顺手扩大修复。
- Terra 仅追加本角色日志；Sol 收口合同与状态，Nova 在全部适用复测通过后审阅。

## R3 Esc 回归的实际命中断言

- Luna 已独立确认 R2 三项定向复测通过。相同 headless Chromium 对 Esc 场景诊断3次：静止点始终命中 index9 原图片，预览关闭，+1px真实移动3次均恢复；`:hover` 却为 false/true/false。属于测试伪类采样时序问题，没有产品预览功能失败证据。
- Terra 仅改 `tests/e2e/about-gallery-preview.spec.ts` 中 `exposed.matches(':hover')` 这一断言，改为 `document.elementFromPoint(point.x, point.y)?.closest('[data-gallery-thumbnail]') === exposed` 的实际命中检查；保留260ms关闭观察、+1px真实移动、后续预览内容/关闭及键盘断言和原超时。其他源码、测试与媒体冻结。
- Terra 所有权另含自身 R3 日志与 ignored 证据；目标格式/Lint/diff通过即交 Luna，不重复完整测试。
- R3 AC：Luna 在正式 headless Test Runner 复测该 Esc 回归通过，完整 `npm run verify` 对最终测试候选通过；复用代码未变且本轮已通过的其余21项页面用例，保留10项既有项目跳过与全部失败/容量阻塞证据，再进入 Nova Review。

## R4 公开仓库历史日志脱敏

- Nova 确认目标仓库为 PUBLIC，并在本次新增的历史日志中发现一处完整机器标识；初审 REJECTED，尚未提交或推送。该值不属于应公开的项目内容。
- Nova 完成本轮日志并移交后，Terra 仅可将 `docs/NOVA.md` 历史段中的完整机器标识替换为“机器标识已核对”，另追加 `docs/TERRA.md` 本轮记录及 ignored 证据；不得改写原审阅结论或复制原值到其他日志，不改任何应用或测试代码。
- Luna 只验证原标识不再出现在候选内容、精确变更范围、格式和 diff，并再次运行提交前强制 `npm run verify`；页面源码和测试冻结，复用本轮已通过的22项页面证据。之后 Nova 只审阅这一增量和复测证据。
- R4 AC：公开候选不含该完整机器标识，历史结论保持；78项非记录路径完全匹配冻结快照；格式/diff与verify通过，Luna PASS、Nova APPROVED后才能提交推送。
