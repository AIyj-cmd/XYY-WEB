# XYY-20261002-04 — 将 CI 修复版本部署至验收站

- 风险：HIGH。状态：CLOSED（已部署、已同步、验收通过）。
- 授权：用户明确要求部署服务器、提交并推送 GitHub、同步本地状态。准确目标沿用本会话验收站 `https://wz.tomatopia.top`、`root@47.82.105.103:/var/www/xyy-web`（staging）和 `AIyj-cmd/XYY-WEB main`。
- 候选：`ab82cbdafb3923e4d62041b801d700f360ccdf20` 已提交、推送且真实 GitHub CI 通过。相对发布前线上 `b8021b1` 仅 `.github/workflows/ci.yml` 改变；本次发布该现有提交，无新业务源码或空提交。发布后执行普通非强制 push 核对与本地状态同步。
- 主工作区既有 71 个脏路径全部保留；使用现有 clean 候选 `/tmp/xyy-20261002-02-website`，不从脏工作区部署。

## Scope 与所有权

- Sol：本合同、基线、`output/release/xyy-20261002-04/` 中非子代理证据、`DEV_STATE.md`、`docs/SOL.md`；目标与授权核对、远端只读快照、执行审阅后的部署、GitHub 同步核对和最终验收。
- Terra：仅本任务 `run-website-deploy.sh`、`remote-snapshot.py`、`check-remote.py`、`terra/` 与 `docs/TERRA.md`。复用 Task02 已审工具，只调整任务目录与唯一冻结 workflow 文件数量；不重写部署逻辑。不得执行部署、push 或真实外部写入。
- Luna：仅本任务 `luna/`、`docs/LUNA.md`；独立核对候选、helper、发布预检和真实 CI 身份，发布后只读检查版本、健康与中英文桌面/手机关键页面。不得修改实现、部署或发送真实询盘。
- Nova：仅本任务 `nova/`、`docs/NOVA.md`；发布前后独立审阅 Scope、工具、QA、回滚/旧版本保护、Git/CI/服务器一致性。不得改实现或执行外部写入。
- 顺序：Terra 工具准备 → Luna 独立预检 → Nova 发布前 Review → Sol 完整发布门禁与部署 → Luna 线上核验 → Nova 发布后 Review → Sol GitHub/本地最终核对。子代理不得再委派。

## 排除项

- 不发布 `.codex/config.toml`、AGENTS、ServiceLanding 动效、素材或其他既有未提交修改；不改业务、依赖、字体生成算法或 CI 源码。
- 不操作生产主站 `56xyy.com`、CMS/数据库、接收服务、DNS/TLS/Nginx、权限或真实表单；部署仅沿用既有 web 应用切换与健康回滚流程，不改变远端环境配置。
- 不删除旧 release；设置 `RELEASE_KEEP=100`，发布前后核对历史目录完整保留。凭据不输出、不写入文档或 Git。
- 已有准确候选无需重新创建提交；禁止空提交、强推或降低 CI/发布验证门槛。

## Acceptance Criteria

1. 候选 HEAD 精确 ab82cbd、工作树 clean，与本地/GitHub 一致；相对线上仅一项已审 workflow 改动，现有真实 CI 为该 SHA 的 completed/success。
2. 独立预检 PASS、Nova 发布前 APPROVED；审阅后的固定目标 wrapper 在任何部署写入前运行本次完整 `npm run verify:release`，失败立即停止。
3. 部署成功后 `/version` 为 ab82cbd、staging、准确 releaseId，`/healthz` 的 CMS 与 contactStorage 均 ok；原子切换、回滚路径有效，旧 releases、CMS 进程及环境文件 hash 保持。
4. Luna 线上只读核验中英文 390/1440 页面、咨询来源预选与关键导航可用，无真实业务写入；Nova 发布后 APPROVED。
5. 发布后普通非强制 push 成功或报告已同步；本地 HEAD/main/origin/main/GitHub 与服务器均为 ab82cbd，0/0、索引空，已有 CI 成功不被改写。
6. 基线范围外文件及 71 个既有脏路径保留，状态和日志明确各阶段真实结果；全部 AC 达成后 CLOSED。

## 输入与证据

- Task03 的精确提交、冻结 workflow、真实 CI `36953940190`、Task02 已审部署及远端检查工具、当前环境只读快照。
- 本次 baseline、工具冻结、Luna/Nova 证据、完整部署日志、发布前后远端快照、GitHub/CI 状态与最终完整性检查。
- 本地根盘当前约 645 MiB 可用，沿用双文件系统 512 MiB 守卫，不复制完整依赖/媒体，不清理用户或历史证据。
