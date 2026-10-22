# XYY-20261022-07 — 联系表单调整 GitHub 同步

- 风险：HIGH（获授权的 GitHub main 写入）；既有实施完成，本次 Luna → Nova → Sol，不重复实现。
- 用户明确要求将当前调整同步 GitHub 并同步本地 Git 信息。目标唯一为 `AIyj-cmd/XYY-WEB` 的 `origin/main` 普通快进；不授权部署、真实询盘、接收端、CMS/数据库、权限或服务器配置操作。
- 基线 main / `145581cfa1ff883ef6c59f6db3862184c44903b0`，22 个 Task04/05/06 脏路径全部保留并纳入本轮，加本合同共 23 路径。精确基线哈希与远端回读 `output/git-sync/xyy-20261022-07/sol/baseline.json`。

## Scope、所有权与排除项

- 同步已验收的选填字段默认可见/上移、中文通用国际号码及前后端校验、对应测试与角色/运行记录；不改已验收业务实现。
- Luna：独立 fresh verify、全量格式/diff、受保护代码哈希及必要证据，`docs/LUNA.md`；不改实现。Nova：候选范围/安全/授权/传输 Review、`docs/NOVA.md`；不重写实现。Sol：本合同、DEV_STATE、SOL 记录、ignored 证据和授权 Git 操作。子代理不得再委派，保留所有既有改动。
- 排除：行业动态、原 PDF/审校来源、其他业务、依赖调整、接收端仓库与真实服务、CMS/数据库/权限、生产配置或任何部署；本地 4321 预览保持运行。
- 接收兼容仍为发布前闸门：本地接收源码国内号码规则不代表生产版本，必须核验准确活动接收端，必要适配另获授权；GitHub 同步不意味着端到端或生产就绪。

## Acceptance Criteria

1. 当前 23 路径精确归属；17 个非文档文件与本次冻结一致，无无关文件、秘密、环境/备份/构建或 ignored 产物混入。只补事实文档，不更改已验收源代码与测试。
2. Luna 新鲜 loopback/dummy `npm run verify` 和全量 `npm run format:check`、diff 检查 PASS。Task05/06 已有独立浏览器证据仅在精确相关实现未漂移时复用，不重复无关测试；保留实际失败日志与真实限制。
3. Nova 审阅代码/测试、范围、安全、授权和传输脚本，批准仅 GitHub 同步；接收兼容、未验证真实设备及发布闸门不被覆盖。
4. 普通 UTC 单父提交，只提交审阅路径。推送前实时核对远端 parent；标准 Git 传输在同会话已实际超时，允许复用已审 Git Database API 脚本，创建与本地精确同 SHA 的 tree/commit，再以 `expected_sha` 和 `force=false` 更新唯一 main；拒绝时停止核对，不 force、不改 origin/凭据或绕过保护。
5. 应用同步后只允许本合同、DEV_STATE、SOL 三份事实状态文档独立普通提交，同一 exact SHA/CAS 快进机制；每次 dry-run 核对精确范围与 parent，工作区干净后方可传输。最终 HEAD、origin/main、GitHub main 一致，ahead/behind 0/0，工作区干净；实际回读 hosted CI，不将本地通过当作远端通过。

## 输入与证据

- 输入：用户本轮授权；Task05/06 本地验收与冻结、`output/contact-international/xyy-20261022-06/luna/final-summary.json`、Nova local-preview-only 审阅；当前源码/差异优先于历史记录。
- 证据目录 `output/git-sync/xyy-20261022-07/{sol,luna,nova}/`，保留命令/退出码、冻结、传输与 Git/CI 实际回读，不记录凭据。
- 备用脚本 `sol/sync-via-api.py` 与本会话 Task03 Nova 已审版本逐字相同；本次仍需 Nova 核对脚本哈希与精确父提交/路径，非生产操作授权来源。

## 状态

- Luna 提交前独立门禁 PASS：fresh workers=4 verify exit 0，769 类型文件 0 errors/0 warnings/6 hints，153 文件/1105 单测、Lint/933 维护预算/资源/cache/构建通过；全量格式和 diff 通过。23 路径范围正确，17 非文档对本次基线及 Task06 15 冻结匹配；复用最近 Task06 与未变 Task05 布局的独立浏览器证据，不声称 Task06 已有意改变的 Task05 电话夹具仍与 Task05 最初哈希相等。日志中间 `Terminated` 后同次全部测试/构建完成 exit 0，原日志保留，不推断原因。Nova APPROVED_FOR_AUTHORIZED_GITHUB_SYNC_AND_SAFE_API_TRANSFER，精确范围/秘密/禁止产物/传输检查通过，Sol 已验收；授权同步待执行，依赖审计及接收端发布闸门不变。
- 本次只读回查：基线 `145581c` 的 GitHub CI `39739670754` 已 completed/failure，失败步骤为 Audit production dependencies。原始日志显示 `npm audit --omit=dev` exit 1、2 vulnerabilities（1 moderate、1 high），涉及 sanitize-html 及 Vite/launch-editor advisories，非已证明的网络故障。当前依赖/锁与 CI 工作流均未修改；本轮不执行 audit fix 或依赖升级，保留为既有 CI/发布限制。同步不表示安全审计或远端 CI 已通过；新提交状态必须再次实际回读。证据 `sol/baseline-ci{,-jobs}.json`、`sol/baseline-ci-failed.log`。
