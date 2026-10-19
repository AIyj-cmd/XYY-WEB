# XYY-20261016-06 — 新 ECS 最新 GitHub 代码重新部署

风险 HIGH；用户明确授权连接 8.138.148.179，并部署 AIyj-cmd/XYY-WEB 最新代码。GitHub API 2026-10-16 回读 main 为 59cf9a5545e0ab26a76c41b2baa484eecfb58632，tree 3ce4fba71868c833556532d36d21835ffb26862a；主工作区起始干净。

## Scope 与所有权

- 仅新 ECS /data/xyy Web 原生发布。保留 CMS/数据库数据、旧 release 与其他服务；运行配置仅做下述发布必需的站点 origin 同步，其余保持；不进行 GitHub 推送、数据库迁移、CMS 写入、DNS/TLS/Nginx 配置修改或旧站访问。
- Sol 负责 SSH、现场核对、合同/状态记录、ops 发布脚本、最终构建打包与上线验收。
- Terra 负责隔离候选 /home/yj/data/xyy-native-update-20261016-06 的 Git 集成及 output/release/xyy-20261016-06/terra 下必要原生读取适配；应用只包含最新 main 与必要原生兼容。不连接远程，不再委派。
- Luna 在候选冻结后独立执行完整 npm run verify:release；所有权仅测试构建产物及 output/release/xyy-20261016-06/luna；实际浏览器截图放在 output/playwright/xyy-20261016-06。上线后进行桌面/手机只读验收；不提交真实询盘、不登录 CMS、不再委派。
- Nova 在独立验证后只读审阅候选、部署脚本、制品及现场证据；仅写 output/release/xyy-20261016-06/nova。不实施、不再委派。
- 所有角色不是独占工作区，禁止回退他人修改。当前工具不提供仓库旧记录的 Terra/Luna 模型名，使用当前可用继承模型，不宣称已切换。

## 验收

1. 从 GitHub 精确核实最新 main，候选包含该提交，必要原生兼容可审阅且无 Secret 入 Git。
2. 本次完整 verify:release 通过；独立 Review 无阻断；实际发布构建 public origin 与现有环境一致，版本 manifest、包及依赖 hash 对应候选。
3. 发布前核对旧 release、运行配置和服务；先准备完整候选，再原子切换，仅重启 Web；失败回退旧版本。
4. 公网 version 精确匹配；health 依赖正常；主要中英页面和管理员入口可访问，桌面/手机检查通过；配置及非 Web 服务保持。
5. 真实证据归档于 output/release/xyy-20261016-06/，更新 DEV_STATE 和 docs/SOL，本地工作不推送。

## 现场确认后的发布适配

- 现场 current 为 20261014T081032Z-939e634；四服务 active，原生依赖包版本与最新 lock 解析一致。Git fetch 及 ls-remote 已核对最新 main 精确 59cf9a5。
- 现有 PUBLIC_SITE_URL 仍为旧隧道 http://127.0.0.1:18080，最新 main 对 staging/production 严格要求公网 HTTPS。此次发布必须同步为 https://8.138.148.179；先备份原文件，保持其余环境字节、权限与属主，失败时配置与版本一起回退。现有 TRUSTED_PROXY_CIDRS=127.0.0.1/32 与 Nginx 协议转发已满足，无需变更反代配置。
- 切换前在临时 loopback 端口启动候选，验证准确版本、健康双依赖、8个中英页面；成功后停止临时单元，再原子切换 current 并仅重启 Web。
- 首次基线 health 503，后续三次200；保留既有外部线索健康超时风险，不改变超时或隐藏失败。

## 实际交付

- 2026-10-16 17:18:53 CST 已部署 `20261016T090823Z-d67a483`；合并提交 `d67a48335e75a90c1aca9051c2e6e99fde56a56e` 包含 GitHub main `59cf9a5545e0ab26a76c41b2baa484eecfb58632`，发布后远端 main 未变化，原生工作区干净且未推送。
- 完整发布验证 R2 通过：1030 单测、365 E2E/17 既有跳过、6 formal、类型/Lint/资源/构建；准确 HTTPS 构建、制品及实际部署身份对应。首轮维护预算失败和修正后的有效复测分别保留。
- 临时端口验收后仅重启 Web；公网精确版本、三次健康、8 个中英主要页面、Google 文件、HTTPS 跳转和 CSP 通过。独立 16 组桌面/手机、图库加载/预览、联系预选与按钮可达性通过，后台未登录入口可见；未真实登录或提交询盘。Luna PASS、Nova 最终 APPROVED，Sol ACCEPTED_DEPLOYED。
- PUBLIC_SITE_URL 已同步 HTTPS IP，其他环境字节、权限属主与非 Web 服务/配置保持；旧 release 和成对回退配置备份保留，临时服务及浏览器已清理。无 GitHub 推送、数据库/CMS 写入、DNS/TLS/Nginx 修改或旧站访问。
- GitHub CI 的 Lighthouse 报告阶段仍因缺少 capacity-baseline.json 失败，未修改 CI 或宣称新性能报告；staging/noindex 保持。其余真实限制和完整证据见 `output/release/xyy-20261016-06/final-result.json`。
