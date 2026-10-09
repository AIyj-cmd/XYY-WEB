# XYY-20261002-03 — CI 字体原生库加载修复

- 风险：HIGH（发布验证工作流及 GitHub 同步）。状态：CLOSED；独立 QA PASS、Nova APPROVED，修复提交已推送，真实 GitHub CI 全部通过，本地 Git 已同步。
- 授权：用户明确要求解决两次 GitHub CI 字体原生库加载失败；沿用本会话 `AIyj-cmd/XYY-WEB main` 的提交、推送及本地同步授权，完成真实 CI 验证。此次仅修复 CI，不重新部署网站或修改服务器配置。
- 基线：本地 HEAD、origin/main 为 `b8021b149209f9e391e58f258e9c512fb7bea6aa`；精确文件与脏改基线保存在 `output/ci/xyy-20261002-03/`。前次两次失败仍保留为历史证据。

## Scope 与所有权

- Terra：仅 `.github/workflows/ci.yml`、本任务 `terra/` 证据和 `docs/TERRA.md`。在依赖安装后增加 Linux x64 字体原生库准备步骤，固定官方 7.6.8 资产及官方 SHA-256，校验后安装，并显式检查动态依赖与实际 native loader。保持原格式、audit、verify:release 闸门及权限。
- Luna：仅本任务 `luna/`、`docs/LUNA.md`；独立测试成功和失败边界，隔离输出生成真实字体，执行候选本次 `npm run verify`，不改实现。
- Nova：仅本任务 `nova/`、`docs/NOVA.md`；审阅准确范围、下载和 hash 校验、失败可见性、CI 语义与 QA，不重写实现。
- Sol：合同、基线、候选与 Git 传输证据、本任务其他 output、`DEV_STATE.md`、`docs/SOL.md`；复用已有隔离候选以控制磁盘占用，仅复制冻结 workflow，验证后提交并同步同一 GitHub main，观察真实 CI。
- 按 Terra → Luna → Nova → Sol 执行。子代理不得再委派，也不得提交、推送、触发 CI、部署或修改外部系统；外部操作由 Sol 执行。

## 排除项

- 不改业务、字体分片算法、CMS/数据库、真实询盘、package/lockfile、生产或验收站运行环境、权限、Secrets、DNS/TLS、其他工作流或既有脏改。
- 不将原生二进制或生成字体提交 Git；不跳过、伪造或降低测试门槛，不创建替代成功 check。
- 不从 ERR_FFI 推断目标文件一定缺失；无 runner stat/ldd 时，原精确根因仍未证实。

## Acceptance Criteria

1. 候选相对基线仅 workflow 一项改动，原安装、audit、verify:release、超时与权限保持；在首次字体调用前完成准备。
2. 官方固定版本与 SHA-256 已核实；下载失败、hash 错误、依赖缺失或 native loader 失败均以非零退出，校验失败不得安装未验证内容。
3. 使用缺少 native 文件的隔离环境成功恢复，实际原生库能加载，并在全新输出目录生成两档字体；不得仅依赖既有字体缓存证明修复。
4. 独立成功/失败路径 QA PASS，本次提交前 npm run verify PASS；Nova APPROVED 后才同步固定候选到 GitHub main。
5. GitHub main 与本地 HEAD/origin/main 为同一修复提交；其 GitHub CI 必须实际 completed/success，才能声明 CI 阻塞已解决。原网站部署 SHA 单独如实记录。
6. 全部范围外文件与既有脏改保留，状态日志写明修改、真实验证、Git/CI/服务器各阶段。

## 输入与证据

- 输入：前次 run `36950908943` attempt 1/2、CI/native loader 诊断、当前 workflow 与字体构建代码、官方发布资产元数据。
- 证据：本次 baseline、单文件 diff/freeze、隔离 native 准备与字体输出、失败路径检查、本次 verify、Review、Git/CI 结果与保护路径最终核对。
- 交接重点：工作区已有 70 个脏路径，磁盘余量有限；不新复制完整依赖、站点媒体或构建产物，不运行真实业务写入。

## 最终验收

- 修复提交：`ab82cbdafb3923e4d62041b801d700f360ccdf20`，相对基线仅 `.github/workflows/ci.yml` 增加 45 行；本地 HEAD/main/origin/main 与 GitHub main 一致，分支差异 0/0，索引为空。
- [真实 GitHub CI 36953940190](https://github.com/AIyj-cmd/XYY-WEB/actions/runs/36953940190) 为该提交的 completed/success，全部 13 步骤成功。完整发布验证通过：574 类型文件零诊断、589 单测、227 E2E（9 项既有 skip）、4 formal 与最终构建。
- 本地隔离恢复及六类失败边界 PASS，本次提交前 `npm run verify` PASS；冻结 workflow/helper 未漂移，1412 保护路径及 70 既有脏路径保持。新合同为唯一新增脏路径，四角色日志原前缀完整。
- 验收站继续运行业务版本 `b8021b149209f9e391e58f258e9c512fb7bea6aa`；CI 修复没有重新部署网站。旧两次 CI 失败保留，不反推其缺少的具体文件或依赖。
- 最终证据：`output/ci/xyy-20261002-03/sol-final-acceptance.json`、`github-ci-final.json`、`github-ci-full.log`、`local-sync-result.json` 和 `sync-integrity-check.json`。
