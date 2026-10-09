# XYY-20261008-07 Lighthouse CI 与真实体验观察

- 风险：MEDIUM（本地 CI 工作流与性能检查配置）。
- 基线：HEAD `f04bd1e0e7b0fb921f7031606dc417b92e033e5a`；已有脏文件保留。初始状态和完整 diff 留在 `output/lhci/xyy-20261008-07/`。
- 授权：用户建议实施桌面/移动端、多采样、核心页面、稳定基线后阻断与真实用户性能观察；补充明确选择 CrUX / Search Console 只读来源。

## Scope 与所有权

- Terra：`lighthouserc.cjs`、`lighthouserc.mobile.cjs`、必要的 `config/lighthouse*.cjs`、`scripts/lighthouse*.mjs`、`scripts/crux*.mjs`；`package.json` 相关脚本、`.github/workflows/ci.yml`、`docs/PERFORMANCE_BASELINE.md`、README 性能段及 `docs/TERRA.md` 追加记录。
- Luna：`tests/unit/lighthouse*.test.ts` / `tests/unit/crux*.test.ts`（如需要）、`docs/LUNA.md` 追加记录、忽略目录内验证证据；不得改实现。
- Nova：只读 Review 及 `docs/NOVA.md` 追加记录。
- Sol：本合同、`docs/SOL.md` 追加记录与 `DEV_STATE.md` 本任务状态；只读正式环境公开性能来源。
- 每位 Agent 不再委派；不独占仓库、不回退他人修改；发现超出所有权先回 Sol。

## 排除项

不修改页面/业务/CMS/数据库/采集埋点，不接入 RUM 写入，不优化页面以刷分，不更新依赖，不提交/推送/部署，不改 GitHub required checks/权限或任何生产配置。不能将历史报告或本地结果归为当前真实用户数据。

## 验收条件

1. 桌面、移动配置独立可运行；使用相同的明确路由集：`/`、`/product`、`/about`、`/xiefu-yuncang`、`/b2b-mendian-cangpei`、`/houzheng-xiufu`、`/contact`、`/en/contact`，每路由每设备默认 3 次。
2. 断言采用逐指标 `median` 聚合；记录 LCP、TBT（仅实验室代理指标）、CLS 与分类分数；采集/页面 HTTP 错误明确失败。保持本地 loopback、禁止真实 CMS/询盘调用。
3. 现有 PR/main CI 在生产构建后运行两设备采集并保存独立可下载报告；失败可见、不用 continue-on-error 吞失败；总耗时有合理上限。无需改变 GitHub 权限。
4. 性能观察模式默认 warn，提供受验证的 enforce 模式使不达标返回非零；明确定义同 CI 环境多轮基线稳定、阈值校准后启用的条件，当前不可宣称已自动阻断性能退化或合并。
5. 只读 CrUX 查询工具或明确操作入口，区分 PHONE/DESKTOP，保存采集窗口、origin/URL 粒度及 LCP/INP/CLS p75。缺 key、无访问权限或样本不足必须明确为无数据/阻塞，不能判定通过，也不能用 LH 的 TBT 冒充 INP。良好目标分别 <=2500ms / <=200ms / <=0.1。
6. Luna 独立验证两设备完整采样、覆盖/报告数量、聚合以及 warn/enforce 故障传播；CrUX 正常/无数据/鉴权或网络错误路径的可用验证；Nova APPROVED。真实来源如不可用，准确记录条件性阻塞，不伪造生产数据。

## 输入与预期证据

当前两份配置、CI、package scripts、现有性能文档；官方 LHCI 配置文档与 web.dev Web Vitals、Chrome CrUX API 文档。只按实际内容扩展读取。原始 JSON/HTML、命令 exit code、每 URL 3 次与中位数摘要、独立测试与审查、变更 diff/格式结果放在 `output/lhci/xyy-20261008-07/`。不计划 Git 提交或部署，因此完整 verify/verify:release 不因提交/部署触发；按实际变更跑相关检查和本地离线 build。

## 容量阻塞处理（本次精确工具批准）

- 初次 build 被容量门禁阻止（约 2.06 GiB < 3 GiB）。批准的 `uv cache prune --offline --cache-dir /home/yj/.cache/uv` 提示 cache in-use，已 Ctrl-C 终止 exit 130，没有使用 force。
- 经独立的精确工具批准，仅删除 `output/release/xyy-20260927-03/candidate/node_modules` 与 `output/release/xyy-20260927-03/release-candidate/node_modules` 两份历史候选旧依赖。当前项目 node_modules、历史候选源码/dist/报告均保留。删除前 lsof 没有列出这两个目录的打开文件，但有其他 Docker 文件系统无法 stat 的警告，不能声称全系统进程核查完整。
- 删除 exit 0 后可用约 3.2 GiB，`npm run check:capacity` exit 0 / `capacity_check_ok`。该授权只覆盖上述两个本地旧依赖目录，不扩展到其他清理或环境动作。
- 随后 Luna 独立 build 发现可用空间下降到 `3,151,908,864` bytes，低于 `3,221,225,472` bytes 门槛，仍按失败记录。经第二次精确工具批准，仅删除 `output/release/xyy-20260928-02/` 的 `candidate/dist`、`release-candidate/dist`、`rework/candidate/dist`、`rework/release-candidate/dist` 四份历史可重建构建目录（约 1.3 GiB）。当前 dist、上述历史候选源码/public、测试报告保持；删除 exit 0。该动作不覆盖线上或其他历史文件。

## 最终验收

- 本地实现通过：Luna 离线 build、两设备各 8×3 完整采集 exit 0；同批 LHR observe exit 0 / enforce exit 1 对照通过。全部 112 项 median 经 Sol/Nova 独立重算无差异。指标仍有告警，不将 pipeline PASS 写成性能全通过。
- R1 CrUX 缺陷经 R2 修复，独立 14 项 CrUX 测试、此前冻结的九项 Lighthouse config/runner 测试通过；typecheck/目标格式/Lint/diff 通过。Nova APPROVED，Sol 接受本地结果。
- 正式数据仍待条件：缺可用 CrUX key/联网条件，公开请求超时，生产 p75 unknown；需环境条件或 Search Console 导出后补真实数据。当前没有性能阻断、required-check 设置、远端 CI 运行、提交/推送或部署。
- 全量维护性检查的既有页脚超行数问题未改，完整 verify/verify:release 未运行；未来提交/部署仍须执行。证据 `output/lhci/xyy-20261008-07/luna/lhci-r2-report.md`、`nova/review.md` 及 Sol 复核 JSON。并行任务 09 的改动保留，不归入本任务。
