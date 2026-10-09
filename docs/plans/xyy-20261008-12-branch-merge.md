# XYY-20261008-12 发布分支合并

- 风险：HIGH（既有核心契约改动进入 GitHub main）。用户本轮明确要求合并 `release/xyy-20261007-01`，目标仓库 `AIyj-cmd/XYY-WEB`。不沿历史记录推定其他外部授权。
- 基线：本地 main/HEAD 与发布分支为 `f04bd1e0e7b0fb921f7031606dc417b92e033e5a`，GitHub main 为 `0ffe149df13148d6280b5230979eb0a3d0ea26cb`；直接父子关系，114 文件。工作区已有 27 个 tracked 修改及未跟踪文件，全部保留。
- Scope：用户已明确选择“先做最小 CI 修复再合并，保留真实部署的 CMS 验证门禁”。在隔离候选 `/tmp/xyy-20261008-12-candidate` 修复 CI 候选身份检查与部署 manifest 耦合，独立验证和 Review 后完成 GitHub main 合并及本地状态协调。
- 文件所有权：Sol 负责本合同、DEV_STATE.md、docs/SOL.md、output/merge/xyy-20261008-12/sol/ 与 Git/PR 操作；Luna 负责 output/merge/xyy-20261008-12/luna/、其临时测试文件和 docs/LUNA.md 追加；Nova 负责 output/merge/xyy-20261008-12/nova/ 和 docs/NOVA.md 追加。若需实现，由 Sol 单独给 Terra 精确派发。
- 排除：今天及其他既有未提交修改、部署、真实 CMS/数据库/权限/运行配置、分支删除、强推、绕过部署门禁、外部通知。子代理不能委派或执行 GitHub 写入。
- 输入：用户当前授权、GitHub refs、原 114 文件提交、原发布任务验证证据与准确 CI 配置。
- AC：GitHub main 包含精确 release 提交；最终涉及提交获得适用 Luna PASS 与 Nova APPROVED；任何新增提交前运行 npm run verify；实际 GitHub CI 状态留证并如实报告；原工作区文件与 index 保留，只有本任务日志/状态可追加；无部署或真实 CMS/数据库动作。
- 预期证据：分支 SHA/祖先关系、CI 问题复现、准确 diff 与验证退出码、独立 Review、GitHub 回读与本地保护核验。
- 流程：当前只读诊断 Luna → Nova；如需 CI 修复则 Terra → Luna → Nova → Sol，均沿本 ID；只合并授权不自动允许跳过未满足的适用闸门。

## 最小 CI 修复合同

- Terra 所有权仅隔离候选的 `.github/workflows/ci.yml`、新增 `scripts/validate-ci-release-identity.mjs`、新增 `tests/unit/ci-release-identity.test.ts`；可追加主工作区 docs/TERRA.md 并写 output/merge/xyy-20261008-12/terra/，不得编辑主工作区任何实现文件。不改 package/lock、CMS 状态、release-contract、部署 manifest 工具或部署脚本。
- 行为 AC：CI 对准确 SHA、UTC build time 与 environment=ci 进行实际身份校验，并显式报告 CMS 候选状态，不生成可部署 manifest；无效 SHA/时间及非 CI 环境明确 exit 非零。真实部署 manifest 在 candidate_unverified 下仍 exit 非零且不写输出；CI 保留依赖审计和完整 verify:release。新增测试必须证明这些行为和原部署阻断。
- 新增提交前隔离候选 npm run verify 必须 exit 0。Luna 独立测试，Nova Review APPROVED 后由 Sol 普通推送本任务候选，创建/复用 PR，实际 CI 成功后合并。不得让今天的工作区 Lighthouse CI 改动混入。

## 已授权依赖安全修复增量

- 用户明确选择“纳入这些依赖安全修复，完整验证后合并”。本轮原始 npm audit exit 1，19 传播包项、按 source 去重 5 公告；此前“6 条”初步计数已由 Nova 纠正。main 与 release 的锁树原本相同，不是发布分支新增的依赖漏洞。
- Terra 所有权增加隔离候选 `package-lock.json`：仅 compression 1.8.1 → 1.8.2、proxy-addr 2.0.7 → 2.0.8、sharp 0.35.4 → 0.35.5、smol-toml 1.8.0 → 1.9.0、source-map-js 1.2.1 → 1.2.2，以及 sharp 必需 @img/sharp-* / libvips 平台子树。保留 package.json、框架版本、file 补丁与 override；不得广泛 npm audit fix 或降低审计门槛。
- 增量 AC：精确 lock diff 无无关版本漂移；干净 npm ci exit 0，真实安装版本正确；fresh production audit exit 0/total=0；Luna 对代理/XFF/限流、压缩中止资源清理、Sharp 实际图片处理做回归；完整 npm run verify:release（内含 verify）exit 0；Nova 对全部四文件改动给出 APPROVED 后再进入 GitHub 推送/PR/合并。外部部署和 CMS 门禁保持。
- 实施者自测与独立 QA 分开；后续遇到失败先分类，不重试掩盖错误，不扩大到真实运行环境。

## 2026-10-09 继续与验证目录恢复

- 用户要求继续；已授权的合并、CI 修复和五项依赖安全修复范围不变，沿原 Task ID。
- 上轮 clean install 被根分区 3 GiB floor 实际中止，未形成成功安装。旧 `/tmp/xyy-20261008-12-candidate` 与本任务 npm cache 在本轮恢复时已不存在；GitHub 两分支及主工作区 HEAD 保持原 SHA。
- 验证候选改为数据盘 `/home/yj/data/xyy-merge-20261008-12/candidate`，npm cache/TMPDIR/Playwright 产物也放该任务数据盘目录；实际可用约 76 GiB，不降低容量门禁、不清理他人文件。恢复四文件后与 `sol/candidate-freeze.json` 原哈希核对，并持久保存补丁；任何恢复差异须解释后再验收。

## 最终候选与独立验证（2026-10-09）

- 四文件恢复后与原冻结 SHA-256 全部一致，暂存树为 `1a8d64afa7d70ce3476d1d42591359666a92f304`；无其他候选改动。主工作区 1516 个保护文件与最初基线一致，原 index 无暂存。
- Luna 干净 `npm ci --no-audit` exit 0，fresh production audit exit 0 / total 0；完整 `npm run verify:release`（内含 verify）exit 0：114 文件 / 727 单测、269 E2E 通过 / 9 既有跳过、4 formal 和最终构建通过。59 定向测试、compression 中止流销毁和 Sharp 原生 SVG 转 PNG / 缩放通过。
- 初轮深 TMPDIR 引起 Chrome socket 路径超长、四 worker 下语言测试超时及一次动画事件未观察到的失败全部保留；使用既有 `CI=true` 单 worker 配置与短数据盘 TMPDIR 完整复测通过，没有调整断言、测试超时或实现。证据见 `output/merge/xyy-20261008-12/luna/qa-r2-summary.json` 与原始日志。
- 合并身份判据：PR head 必须为最终审核提交；合并提交必须包含该 head 与原 f04，tree 必须等于审核树。主工作区同步只应用四文件任务差异并保留既有 CI timeout/Lighthouse 增量；空 index 更新前保存旧 tree，若 main ref 的 CAS 失败立即恢复旧 index 并停止。

## 合并交付（2026-10-09）

- Luna 最终 PASS、Nova 最终 APPROVED；四文件已提交 `6d0a781`，获批 tree 未漂移。
- Git HTTPS 超时后，经 Nova 传输方式审查，用 Git Data API 上传完全相同的四 blob/tree/commit，并以 `force:false` 更新 release；逐对象 API 回读及独立重算通过。
- PR #4 / CI 37884447146 completed/success。真实 PR 模拟合并 `4616211` 与最终 merge `5f94e34` 的 tree 同为 `1a8d64af…`；完整 727 unit、269 E2E / 9 existing skip、4 formal/build/audit/capacity 通过后，按匹配 head 的普通 merge 完成。
- GitHub 与本地 main 为 `5f94e34caf91775051559c50ea5b79fc98443fd8`，原 f04 与新增 6d 均为祖先；release 保留为 6d。1514 范围外文件及既有 CI overlay 保持、三个任务文件与合并提交一致、index 无暂存。
- main 自动 CI 37885398485 已触发，记录时仍运行中；没有部署或真实 CMS/数据库/权限操作，candidate_unverified 门禁保持。原工作区改动和本任务记录保持未提交，未纳入四文件修复提交。
