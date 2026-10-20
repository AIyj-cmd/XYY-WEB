# XYY-20261020-14 — 新服务器更新 GitHub 最新代码

风险：HIGH。用户明确授权连接 `8.138.148.179`，更新 `AIyj-cmd/XYY-WEB` 最新代码。仅发布该服务器 `/data/xyy` Web 应用；保持既有 `https://56xyy.com` production 配置。

## 基线与范围

- 主工作区初始干净，HEAD `f9bcf4675b07e1639af888f54c093216ceeb8c17`，分支 main；远端最新提交和服务器当前版本以本次回读为准。
- 从最新 main 集成发布候选，保留现有原生 Directus 读取适配。使用独立工作区，不改变主工作区应用代码。
- 完整验证、构建正式 origin 制品、上传独立 release、原子切换 current 并仅重启 Web；保留上一版本并准备失败回退。
- 排除 GitHub 推送、CMS 写入、数据库操作/迁移、DNS/TLS/Nginx/PM2、既有环境变量与权限配置变更、旧服务器访问及真实表单提交。
- 已知线索接收配置指向退出范围的旧地址。本次不得调用会访问该地址的 `/healthz`，也不得通过真实提交间接访问；采用版本、页面和独立本地验证，明确保留联系链路未验收的限制。

## 所有权与交接

- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md`、GitHub/SSH 回读、发布执行和 `output/release/xyy-20261020-14/sol/`。在 Luna PASS、Nova APPROVED 后发布。
- Terra：独立候选 `/home/yj/data/xyy-native-update-20261020-14` 的 Git 集成；`output/release/xyy-20261020-14/terra/` 下构建、打包与发布执行器；`docs/TERRA.md`。禁止实际远程写入；返回 Sol 执行。应用只集成已授权最新 main 和既有原生兼容，不新增业务。
- Luna：冻结候选的独立 `npm run verify:release`、必要桌面/手机验证；仅写测试产物、`output/release/xyy-20261020-14/luna/`、`output/playwright/xyy-20261020-14/` 与 `docs/LUNA.md`。不得改实现、调用真实表单或旧目标。
- Nova：独立审阅候选差异、脚本、制品及部署证据；仅写 `output/release/xyy-20261020-14/nova/` 和 `docs/NOVA.md`。禁止实现、远程变更与再委派。
- 各角色共享工作区，必须保留他人修改；仅 Sol 派发，实施、独立验证、Review 顺序进行。模型以工具实际结果为准。

## 验收判据

1. 实际获取 GitHub main，记录准确 SHA；发布候选包含最新代码，除既有原生兼容外无业务偏离，来源与差异可审阅。
2. 本次完整 `npm run verify:release` 通过，Luna PASS、Nova 发布前 APPROVED；正式构建 origin 为 `https://56xyy.com`，源码、manifest、制品哈希一致。
3. 切换前核对服务器、旧版本、配置哈希、非 Web 服务与磁盘；完整候选先在 loopback 验证，失败不切换；切换后失败回退。
4. 上线后 `/version` 与目标 SHA/release 一致，主要中英文页面及桌面/手机检查通过；旧 release 保留，非 Web 服务与既有配置保持。
5. 记录部署事实、修改文件、验证与真实限制；不将 `/healthz` 或真实联系链路未执行记为通过。

## 实际交付

- 已验收 CLOSED：2026-10-20 16:36 CST，目标 `8.138.148.179` 的 current 切换至 `20261020T083310Z-c5ca1e4`，正式入口 `https://56xyy.com`。候选提交 `c5ca1e4f7c8ada095c32acfeefb3a42609591c91` 包含 GitHub main `f9bcf4675b07e1639af888f54c093216ceeb8c17` 与原生基线 `c6b7267dc3cc7a5fd2082a09db7c403879987681`；主工作区 Task15 并行修改未纳入。
- 本次完整 `npm run verify:release` exit 0：1046 单测、387 E2E 通过、17 项既有条件跳过、6 formal；独立本地页面矩阵 28 组通过，冻结源码 1702 项无漂移。正式 origin 构建、制品身份与切换前后 GET 验证通过；Luna PASS、Nova 发布前及最终 APPROVED。
- 实站 8 路径 × 桌面/手机共 16 组检查通过，公开版本精确匹配。仅 Web 重启；旧 release 全保留，配置与 Directus/Nginx 进程保持，临时验收资源已清理。回退记录 `/data/xyy/backups/native-update-20261020-14`。
- 本次仅在独立候选创建本地合并提交，未推送 GitHub。GitHub 既有 Lighthouse 报告缺容量文件导致的 CI failure 单独记录，联系链路仍未验收；未执行 healthz、POST、CMS 写入、数据库或退役目标操作。浏览器限 Chromium 模拟视口。
- 源码、制品、部署、QA 与最终 Review 证据在 `output/release/xyy-20261020-14/`，最终汇总 `final-result.json`；角色日志与 `DEV_STATE.md` 已同步实际完成状态。
