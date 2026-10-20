# XYY-20261020-16 — Lighthouse CI 容量基线路径修复

风险：MEDIUM。用户在确认缺文件原因后明确要求修复。范围是本地实现与验证 CI/Lighthouse 路径衔接；GitHub 推送与运行、网站部署不在本轮已明确授权内。

## 基线与范围

- 主工作区 HEAD 为 `f9bcf4675b07e1639af888f54c093216ceeb8c17`。现有 Task14 记录和 Task15 品牌/SEO 改动均保留。相关 CI/Lighthouse 实现与测试初始无差异。
- 独立候选 `/home/yj/data/xyy-ci-fix-20261020-16` 基于该 HEAD，避免将 Task15 混入修复验证；通过后只回填本任务文件。
- CI 实际基线为 `${RUNNER_TEMP}/xyy-capacity/verify-release-baseline.json`，工作区构建器却固定复制 `output/capacity-baseline.json`。修复显式路径传递，保留本地默认路径，并将选定基线复制至隔离工作区的标准位置。
- 同一报告流程的 artifact 上传路径须匹配 runner 实际 `output/lighthouse/<run-id>/<device>/` 结构；仅修正该明确关联的路径。
- 不放宽容量检查、性能阈值、失败传播或隔离规则，不伪造基线或缺文件时静默跳过。不改页面、CMS、依赖版本、锁文件、生产配置或已上线版本。

## 文件所有权与流程

- Sol：本合同、`DEV_STATE.md`、`docs/SOL.md`、独立候选与证据管理、精确回填及最终验收。
- Terra：候选内 `.github/workflows/ci.yml`、`scripts/lib/lighthouse-workspace.mjs`；必要时 `scripts/lighthouse-runner.mjs`；`tests/unit/lighthouse-workspace.test.ts`、`tests/unit/lighthouse-runner.test.ts`、`tests/unit/lighthouse-config.test.ts`、`tests/helpers/lighthouse-runner-fixture.ts`、必要新增 `tests/unit/lighthouse-ci.test.ts`；主工作区 `docs/TERRA.md` 及 `output/ci-lighthouse/xyy-20261020-16/terra/`。Sol 在交接前明确纳入既有 config 测试文件，用于工作流路径回归，避免新增重复测试文件。
- Luna：仅测试证据、必要测试修正与 `docs/LUNA.md`；独立运行定向单测、完整 `npm run verify`、真实隔离 `npm run test:lhci:all`。所有构建数据源仅 loopback，使用专用临时目录，不触碰 4321 预览。
- Nova：仅审阅证据与 `docs/NOVA.md`，核对路径、隔离、失败传播、工作流报告可收集性与验证可信度。
- 顺序 Terra → Luna → Nova → Sol。各角色不独占仓库，不覆盖他人并行修改、不再委派。证据根目录 `output/ci-lighthouse/xyy-20261020-16/`。

## 验收判据

1. CI 生成、容量核验与 Lighthouse 输入使用同一实际基线文件；外部绝对路径、项目内相对路径和未配置时的默认路径有可观察回归覆盖。
2. 模拟 CI 项目默认文件不存在、基线只在外部目录的场景仍能完成隔离工作区及报告流程；基线确实复制，源文件保持。
3. 配置基线不存在或非法时明确失败并清理临时工作区；现有禁止外部符号链接、禁止复制 `.env`、父生产环境隔离与失败传播回归保持。
4. CI 上传 glob 匹配实际带 run-id 的桌面/手机报告路径，保留原失败报告可收集行为。
5. 独立定向测试与完整 `npm run verify` 通过；真实本地 Lighthouse 桌面/手机各 8 路径、每路径 3 次产生有效中位数报告，退出成功且临时工作区清理。性能 observe 警告如实记录，不改阈值掩盖。
6. Luna PASS、Nova APPROVED 后精确回填；非目标修改保留，最终区分本地修复、GitHub CI 与生产状态。本轮不提交/推送/部署或访问真实 CMS、数据库、联系接收端及退役目标。

## 实际交付

- 状态：LOCAL_READY，Luna PASS、Nova APPROVED、Sol 本地验收；未提交、推送、运行 GitHub Actions 或部署。
- 修改 7 文件：`.github/workflows/ci.yml`、`scripts/lib/lighthouse-workspace.mjs`、`scripts/lighthouse-runner.mjs`、`tests/helpers/lighthouse-runner-fixture.ts`、`tests/unit/lighthouse-config.test.ts`、`tests/unit/lighthouse-runner.test.ts`、`tests/unit/lighthouse-workspace.test.ts`。
- 定向 26 测试、完整 `npm run verify` 1042 单测与构建通过；真实 `npm run test:lhci:all` 生成桌面/手机各 24 份报告，run-id artifact glob 均匹配，临时工作区已清理。
- 1700 个候选 tracked files 与冻结记录一致；7 文件精确回填，1698 个主工作区非目标文件在回填前后保持。
- GitHub hosted runner 尚未验证；observe 的 SEO 0.69 与手机关于页性能/LCP 警告仍存在，阈值保持。后续推送仅在用户明确授权准确目标与动作后执行。
- 证据：`output/ci-lighthouse/xyy-20261020-16/luna/final-result.json`、`nova/review.json`、`sol/backport-result.json`、`sol/final-acceptance.json`。
