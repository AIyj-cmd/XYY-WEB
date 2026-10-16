# XYY-20261014-03 — 更新新服务器至 GitHub 最新代码

- 风险 HIGH。用户明确要求连接 `8.138.148.179` 并更新 `AIyj-cmd/XYY-WEB` 最新代码；GitHub main API 回读 `9ad4fe0fa92bb14ee23fa2e6c7b79836c2798c80`。目标仅该服务器 `/data/xyy` 的 Web 应用。
- 保留旧 release、原生兼容、环境配置及数据。排除 CMS/数据库写入与迁移、DNS/TLS/Nginx/权限配置变更、其他服务器、GitHub 推送与历史版本删除。
- 原生基线 `e64db32b4bd7208502ef11727fa6573bffe9c053`；独立工作区 `/home/yj/data/xyy-native-update-20261014-03` 合入最新 main。四份记录冲突采用最新 main 记录，原冲突内容存于 ignored evidence；应用自动合并，不改业务范围。

## 所有权与顺序

- Sol：合同、集成、DEV_STATE/docs/SOL、SSH 凭据使用与现场核对、Git 本地合并身份、打包上传、可回退切换与最终验收。当前 main 起始工作树干净，保留旧工作区。
- Terra：仅 `output/release/xyy-20261014-03/ops/` 的发布脚本；基于任务16既有脚本替换准确前任身份及现场指纹，保留保护和失败回退。不连接服务器、不改应用、不再委派。
- Luna：仅 ignored `output/release/xyy-20261014-03/luna/` 及独立候选的生成构建产物，执行完整 `npm run verify:release` 和上线双端只读检查；不改应用、不提交、不部署、不读取秘密、不再委派。
- Nova：Luna 完成后独立审阅集成差异、测试、部署脚本、制品与现场证据；仅 `output/release/xyy-20261014-03/nova/`，不实施或再委派。
- 并行角色不得回退他人修改；有依赖的测试、Review、发布按序进行。指定历史模型若当前工具未提供则沿用当前可用模型，不宣称已切换。

## 验收

1. 当前 GitHub main 精确包含于已验收候选；保留所需原生兼容；无凭据、环境文件或生成物进入 Git。
2. 本次完整 verify:release 通过，Nova 审阅通过；最终生产构建有准确 Git、release、环境身份且包 hash 可验证。
3. 核对前任 release、配置/锁文件指纹与服务状态，只切换 Web；失败自动切回。原配置字节及 CMS/Nginx/PostgreSQL 进程保持。
4. 公网 version 精确匹配，health 双依赖正常，主要中英页与后台入口可用；Google 验证文件精确53字节，最新157图图库与页脚在桌面/手机正常，无真实提交。
5. 证据保存在 `output/release/xyy-20261014-03/`；本地状态记录实际结果，最终简洁报告地址、版本与验证限制。

## 实际结果

- 2026-10-14 08:18:10 UTC发布完成：GitHub main `9ad4fe0` 已包含于原生合并提交 `939e634`，release `20261014T081032Z-939e634`。旧release保留，配置与非Web服务保持。
- 完整发布验证通过：867单测、271 E2E通过/17既有跳过、4 formal。Luna公网16/16路由视口、图库、导航、登录入口及HTTP验收PASS，Nova最终APPROVED且无findings；Sol核对证据并完成验收。
- 桌面/手机浏览器会话已关闭；仅模拟Chrome，未登录后台或提交真实询盘。最终证据 `output/release/xyy-20261014-03/final-result.json`。本地归档未推送GitHub。
