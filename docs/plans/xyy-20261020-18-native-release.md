# XYY-20261020-18 — 新服务器同步 GitHub 最新代码

风险：HIGH。用户明确授权连接 `8.138.148.179` 并更新 `https://github.com/AIyj-cmd/XYY-WEB` 最新代码。范围仅为该主机 `/data/xyy` 的 Web 发布；正式 origin 沿用 `https://56xyy.com`。

## 基线与范围

- 主工作区初始干净，main/HEAD 为 `984461e17dfcae7e7d1324a9fa530fb742133b2c`；本次 fetch 和 GitHub API 已核实 main 为该提交。服务器实际版本、配置、服务和磁盘以本次只读回读为准。
- 上次部署基线为 `c5ca1e4f7c8ada095c32acfeefb3a42609591c91` / `20261020T083310Z-c5ca1e4`，保留其中既有原生 Directus 读取兼容。独立候选集成最新 main，不改变主工作区应用代码。
- 完整发布验证、正式 origin 构建、独立 release 上传、候选 loopback 检查、原子切换 current 并仅重启 Web；保留旧 release 与失败回退。部署所需新制品使用现有属主和访问模式，不改变既有权限策略。
- 排除 GitHub 推送、DNS/TLS/Nginx/PM2、既有环境变量与权限配置变更、真实 CMS 写入、数据库查询/写入/迁移、其他主机、真实表单提交和 `/healthz`。已知联系接收链未验收，不通过健康检查或 POST 间接访问退出范围的旧目标。

## 文件所有权与流程

- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md`、GitHub/SSH 只读核对、独立候选的最终提交、正式构建/上传/发布执行，以及 `output/release/xyy-20261020-18/sol/`。发布须在 Luna PASS 和 Nova 发布前 APPROVED 后执行。
- Terra：独立工作树 `/home/yj/data/xyy-native-update-20261020-18` 的 Git 集成及其源代码候选；`output/release/xyy-20261020-18/terra/` 的构建、打包和发布执行器；仅追加 `docs/TERRA.md`。复用 Task14 已审实现并更新准确基线，不实际连接或写入远端。
- Luna：冻结候选的独立 `npm run verify:release`、本地及授权上线后的桌面/手机验证；仅写测试证据、`output/release/xyy-20261020-18/luna/`、`output/playwright/xyy-20261020-18/` 和 `docs/LUNA.md`。不得改业务实现或真实数据。
- Nova：独立审阅候选、脚本、制品与部署前后证据；仅写 `output/release/xyy-20261020-18/nova/` 和 `docs/NOVA.md`。不改实现或执行远程变更。
- 按 Terra → Luna → Nova → Sol 发布 → Luna/Nova 上线后验收 → Sol 收尾。子代理不再委派；各角色不独占仓库，不覆盖他人修改；失败或需要扩围均返回 Sol。

## 可观察验收判据

1. GitHub 最新 main SHA 与候选来源精确可追溯；候选相对最新 main 仅保留既有原生兼容，公开品牌优化与 CI 修复均纳入，其他分支保持。
2. 本次完整 `npm run verify:release` 退出成功，独立 Luna PASS；正式构建 client/server origin 均为 `https://56xyy.com`，源码、manifest、制品哈希一致，Nova 发布前 APPROVED。
3. 切换前远端 current、配置哈希/模式/属主、非 Web 服务、依赖锁、磁盘与目标身份满足本次基线；候选先通过 loopback 版本及页面 GET 检查，失败不切换，切换后失败自动回退。
4. 上线后版本精确匹配候选 commit/release；中英首页和关于页展示新品牌关联与统一 Organization，主要页面、桌面/手机布局、首屏图像和错误检查通过；旧 release 全保留，既有配置及非 Web 服务保持，临时验收服务清理。
5. 状态与角色日志记录本次命令、结果、文件和真实限制，区分 GitHub main、独立原生合并提交与生产发布；不把未执行的联系链路、真实数据写入或其他浏览器验证记为通过。

## 输入与证据

- 输入：当前 AGENTS.md、上述 Git 基线、Task14 合同和已审发布脚本、Task17 的 Git 同步结果、本次远端 baseline。凭据仅通过已有固定目标连接 helper 在内存中使用，不输出或复制到制品。
- 证据：`output/release/xyy-20261020-18/`，记录精确命令/退出码、来源与冻结 SHA-256、独立完整门禁、Review、部署结果、版本与网页截图、配置/服务保持和回退信息。

## 实际交付

- 已验收 CLOSED：最新 main `984461e` 与原生基线 `c5ca1e4` 合并为本地 `7d7cdab`，1707 源文件保持，未推送独立候选。
- 独立完整 `verify:release` PASS：1053 单测、411 E2E/17 既有跳过、6 formal；Nova 发布前及发布后均 APPROVED。main GitHub CI 也已成功。
- 2026-10-20 18:24 CST 发布 `20261020T102057Z-7d7cdab` 至新 ECS；精确版本、配置/非 Web 服务保持、旧 release 保留和临时 unit 清理通过。
- 最终实站 16/16 组严格隔离验收 PASS；首轮跨页取消失败及过滤版无效复测原件保留，不计通过。联系接收链未验收，未执行真实 POST 或 `/healthz`。
- 完整事实及证据索引：`output/release/xyy-20261020-18/final-result.json`；本次状态与角色记录仅本地更新，未提交或推送。
