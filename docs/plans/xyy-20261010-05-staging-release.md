# XYY-20261010-05 — 测试站部署与 GitHub 同步

- 风险 HIGH；用户在已验收的移除服务选择任务后，明确要求部署服务器、随后推送 GitHub 并同步 Git 状态。
- 准确目标：既有测试站 `https://wz.tomatopia.top`，SSH `root@47.82.105.103`，目录 `/var/www/xyy-web`，应用 `xyy-web`，端口 50031，环境 staging；GitHub `AIyj-cmd/XYY-WEB` 的 main 与本地 main。正式站不在本任务内。
- 基线：本地/main/origin/main/GitHub main 为 `af20f11be11d1f5e8c3af0d982f7ccd8b79fa608`；服务器版本 `40591be` / `20261009T091340Z-40591be`。本次已实时核对 `/version`、`/healthz`，两依赖 ok，服务器 current 目标相符。初始修改路径及 SHA-256 见 `output/release/xyy-20261010-05/baseline.json`。

## Scope、文件所有权与排除项

- 纳入已验收任务 04 的九个源码/测试文件、合同和角色记录；同步既有 README、DEV_STATE、SOL 记录，以及本任务合同/结果。不包含 `.env`、凭据、备份、依赖、构建或 output 证据产物。
- Sol 负责本合同、DEV_STATE.md、docs/SOL.md、精确暂存/提交、按既有 scripts/deploy.sh 部署测试站、普通推送 main、远端/API/工作区最终回读。遵循用户先部署后推送的顺序；部署前本地提交用于干净工作区和不可变发布身份。
- Luna 独立执行当前候选的 `npm run verify`，只追加 docs/LUNA.md 并写本任务 output 证据；发布后独立验证六路由中英文桌面/手机、移除入口和原有咨询表单。不得改实现、直接操作 CMS/数据库、真实提交表单或停止 4321/4322 服务。
- Nova 在 Luna 验证后审查精确候选差异、提交清单、既有部署脚本的本次调用与目标，给出发布前结论；部署后审阅结果与发布身份，仅追加 docs/NOVA.md 和本任务 output/nova 证据。不得改实现或进行外部写入。
- Terra 实现步骤不适用：任务 04 已经 Terra → Luna → Nova 验收，本次为授权发布。若验证暴露真实代码问题，由 Sol 另行在本 ID 明确最小文件 Scope 派 Terra，之后 Luna 复测与 Nova Review；不擅自扩大修复。
- 代理不得再委派；各自只写所有文件，保留他人修改。
- 不修改真实 CMS/数据库、运行环境文件、DNS/TLS/Nginx、权限策略、依赖或发布逻辑；不迁移 Oracle、不删除旧版本。现有脚本仅在新 release 目录安装依赖、设置发布文件正常权限、切换应用/回退并生成旧版本清理预览，属于本次应用部署范围。

## 验收条件与执行证据

1. 当前候选 `npm run verify` 实际通过后才提交；Nova APPROVED 后执行发布。部署脚本内完整 `npm run verify:release` 必须实际通过，不跳过门禁。
2. 提交仅包含约定文件，无凭据、构建/测试产物；部署所用工作区干净且发布 manifest 绑定精确 Git SHA，保持分支历史、不强推。
3. 使用已有同设备真实 verify:release 容量基线，本地 TMPDIR/测试产物置于项目数据盘；远端既有安装基线与空间通过。缺条件显式失败，不伪造测量或清理其他目录。
4. 部署后公网 `/version` 精确匹配候选 SHA、releaseId、staging、CMS schema，`/healthz` 两依赖 ok；确认进程保持既有 127.0.0.1:50031 监听，失败按标准脚本回退并报告。
5. 独立上线检查六路由 × 桌面 1440/手机 390：HTTP 成功、主要内容可见、目标模块/按钮/锚点不存在、无横溢/脚本错误，联系方式和表单保持，无真实 POST。
6. 部署成功后普通推送 GitHub main；最终本地 HEAD、origin/main、GitHub main 精确一致，工作区干净，说明部署应用提交与随后纯记录提交的关系。检查对应 GitHub CI，不把运行中记为通过。
7. Luna PASS、Nova APPROVED 后 Sol 验收。所有日志仅写已完成结果；未完成或失败明确记录。发布证据保存 `output/release/xyy-20261010-05/`。

## 当前结果

- 已确认目标身份与初始 Git 基线，本地/远端容量预检通过，旧版健康正常。
- Luna 发布前 `npm run verify` exit 0：647 类型文件、0 errors/0 warnings/4 hints，119 文件/762 单测，819 维护性文件、资源/cache patch 与 build 通过。
- 初始九个源码/测试文件哈希保持；候选共 17 个约定路径。等待 Nova 候选和部署调用审查；此阶段尚未提交、部署或推送。
