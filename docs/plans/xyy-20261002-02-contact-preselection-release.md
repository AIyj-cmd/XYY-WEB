# XYY-20261002-02 — 咨询预选发布与 Git 同步

- 风险：HIGH。状态：部署、GitHub 与本地同步已完成；同 SHA CI 两次原生字体加载失败，最终 CI 门禁 BLOCKED，未 CLOSED。
- 授权：用户明确要求部署服务器、提交并推送 GitHub、同步本地状态；沿用已建立的验收站 `https://wz.tomatopia.top`（staging，`root@47.82.105.103` 的 `/var/www/xyy-web`）与 `AIyj-cmd/XYY-WEB main`。
- 基线：`7f903056233627c6e9b2007667b827b76a26d963`；精确工作区基线、脏文件与 33 项发布冻结在 `output/release/xyy-20261002-02/`。

## Scope 与所有权

- 仅发布 Task04 经 Task06 移除统计与报告后的咨询来源、服务 SSR 预选、改选与双语切换，以及对应测试和使用说明。精确文件以 `release-files.json` 为准；已核对这些既有文件在 Task04 开始前与 HEAD 一致。
- Sol：隔离候选、发布与同步脚本、本目录证据、本合同、`DEV_STATE.md`、`docs/SOL.md`；部署使用仓库已有脚本，预先生成隔离候选提交以绑定版本身份，上线验收后推送并同步主工作区。
- Luna：仅 `output/release/xyy-20261002-02/luna/` 与 `docs/LUNA.md`；独立预检与上线后浏览器验证，不改业务或仓库测试。
- Nova：仅 `output/release/xyy-20261002-02/nova/` 与 `docs/NOVA.md`；审阅候选、发布/同步工具、QA、范围、授权及最终证据，不重写实现。
- 已实现的发布任务略过 Terra 实现；如发现代码缺陷，Sol 沿用本 ID 收敛必要修复并重新安排适用闸门。
- r2 最小返工：候选 mobile 默认 Pixel 7 为 412px，新增 hero 测试固定按 390px 断言导致两项失败。Terra 仅拥有 `tests/e2e/conversion-hero.spec.ts`、本任务 `terra/` 证据及 `docs/TERRA.md`，将横溢断言绑定实际视口宽度，不改业务、浏览器配置或其他断言。Luna 独立复测后重新进入 Review；发布文件仍为原 33 项。
- Git 传输返工：原生 HTTPS push 因 TLS/连接超时失败，SSH 443 无既有 GitHub 密钥权限；账户权限保持。允许在同一已授权仓库与 main 目标上使用 GitHub Git Database API 传输完全相同的两个提交对象，并仅以 `force:false` 更新分支。Terra 新增所有权仅本任务 `api-push.py`、`terra/` 与 `docs/TERRA.md`；Sol 准备不可变 `api-push-plan.json`。Luna 独立 dry-run/安全失败模拟，Nova 审阅后才可 apply。每棵树与每个提交 SHA 必须等于已部署候选；任何不符立即停止、不得改 main。候选、发布内容、目标、权限和已审本地同步工具不变。

## 排除项

- 不发布 `56xyy.com`，不改 CMS、数据库、线索接收服务、DNS/TLS、生产配置、权限或依赖。
- 不提交治理/config、ServiceLanding 动效、无关素材、历史脏日志、环境文件、证据与构建产物；既有脏改完整保留。
- 不恢复报告与事件统计；浏览器表单测试只用 mock，不发送真实咨询。
- 不删除既有 release；部署设置 `RELEASE_KEEP=100` 并核对历史数量与保留结果。

## Acceptance Criteria

1. 隔离候选相对基线恰好 33 项冻结改动，无其他源码或配置；提交前本次 `npm run verify` 通过。
2. Luna 独立检查候选关键双语预选行为、桌面/移动布局与无统计请求，Nova 发布前 APPROVED；部署脚本在外部写入前完成本次 `npm run verify:release`。
3. 验收站 `/version` 精确为候选 SHA、staging；`/healthz` 两依赖正常；既有 release、有效 previous、环境文件 hash 与 CMS 进程保持。
4. Luna 上线后验证双语 SSR 预选、改选、语言切换、mock 提交与无统计；Nova 发布后确认满足后续推送条件。
5. 非强制推送至目标 main（原生 Git 或经过独立验证与审阅的同对象 Git Database API 传输），本地 HEAD/main/origin/main、GitHub main、线上 SHA 一致；源文件和范围外脏改保持，索引无残留。
6. 同 SHA GitHub CI 获得真实结果；仅在必需检查成功时 CLOSED，外部阻塞须如实单列。状态文档准确区分各阶段。

## 输入、证据与交接

- 输入：Task04/Task06 已验收结果、当前代码、冻结清单、Git 与远端基线、已有 `scripts/deploy.sh` 及前次发布工具。
- 证据：当前验证原始日志、独立 QA/Review、候选 patch/bundle、部署日志、远端前后快照、Git/CI 结果、保护路径校验与最终验收 JSON。
- 交接重点：主工作区存在无关未发布修改；隔离候选必须只复制冻结文件；日志仅追加本任务结果，禁止真实表单或数据库操作。
