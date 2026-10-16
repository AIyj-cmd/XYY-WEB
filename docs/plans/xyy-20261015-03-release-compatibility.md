# 发布兼容性修复合同

Task ID：`XYY-20261015-03`；风险 HIGH；用户已授权执行四项优化方案，本合同覆盖第一阶段本地实现。

## 基线与边界

- HEAD `9ad4fe0`，原有脏差异与文件 hash 位于 `output/optimization/xyy-20261015-03/before.*`。所有角色共享仓库，保留他人改动，不再委派。
- 输入为四项优化方案第一阶段、用户三个 P1 Review 和当前代码。保持公开 HTTPS、manifest origin 一致性、CMS 空结果语义和既有内容默认可见修复。
- 只修改本地代码；不执行部署脚本的真实外部动作，不连接生产，不推送，不改真实 CMS/数据库/环境文件或运行中的 4321 预览。发布脚本实现通过模拟夹具验证；生产代理的实际配置仍是未来发布前提。

## 文件所有权

- Terra：`playwright.config.ts`、`playwright.formal.config.ts`、`scripts/deploy.sh`；可新增 `scripts/formal-test-server.mjs`、`scripts/lib/local-probe.mjs`、`scripts/local-release-probe.mjs` 与确有必要的 `scripts/lib/formal-test-*.mjs`；测试消费者 `tests/e2e/contracts.spec.ts`、`tests/formal/production-origin.spec.ts`；`docs/TERRA.md` 及本任务 ignored 证据。需要额外路径先报 Sol，不改 server 安全策略来迁就消费者。
- Luna：新增必要的 `tests/unit/local-probe.test.ts`、`tests/unit/release-compatibility.test.ts`，适配相关 `tests/unit/release-deployment.test.ts`、`tests/unit/deployment-config.test.ts`；`docs/LUNA.md` 与本任务 ignored 独立测试证据。不得改业务实现；测试消费者在 Terra 交付冻结后才能调整，需向 Sol 明确路径。
- Nova：只读审阅实现、测试、范围、安全及回归；可写 `docs/NOVA.md` 与本任务 ignored 审阅结果，不改实现。
- Sol：本合同、路线图状态、`DEV_STATE.md`、`docs/SOL.md` 与 ignored 证据；控制阶段依赖、范围及最终验收。
- R3 补充：维护预算发现 `contracts.spec.ts` 超出 220 行；允许 Terra 新增 `tests/e2e/helpers/contract-server.ts`，只提取该消费者已有的本地服务器辅助函数，保持测试断言。发布脚本仍须满足 200 行预算，不上调阈值。
- R3 独立测试补充：允许 Luna 适配 `tests/unit/deployment-capacity.test.ts` 对旧 curl/health_payload 的源码断言，继续验证单次健康轮询和完整依赖健康契约。两项未改 CMS 测试的 5 秒超时先原样定向复查；若确认并发负载原因，完整门禁可使用 `VITEST_MAX_WORKERS=2`，不改变覆盖范围或超时判据。
- R4 补充：完整门禁暴露两个额外 fixture 的同类 origin 回归。Terra 增加 `tests/helpers/english-news-fixture.ts`、`tests/helpers/english-whitepapers-fixture.ts` 所有权：显式 ci、沿用 E2E 构建 origin、仅监听端口随机；就绪请求不跟随重定向，终止或超时后取消轮询。普通 E2E 的 build/start 另显式绑定 loopback。五个关联用例必须恢复；语言建议的两个累计超时由 Luna 单独诊断，不放宽超时或移除断言。
- R4 测试组织修正：Luna 原样复测及 trace 证实两个语言用例因独立场景累计导航耗尽 30 秒，未出现业务断言失败。允许 Luna 修改 `tests/e2e/language-suggestion-behavior.spec.ts`，新增 `tests/e2e/language-suggestion-storage.spec.ts` 和 `tests/e2e/helpers/language-suggestion.ts`，按独立偏好/存储场景拆分并共享原有辅助函数；保留全部导航、刷新、焦点、存储和无 JS 断言及 30 秒单例预算，不改业务脚本。完整门禁仍须覆盖所有拆分后的用例。
- R5 补充：R4 完整 E2E 为 299 通过、17 既有跳过、2 失败；两个失败是同一整烫车间故障用例，旧拦截器只识别开发模块或内联脚本，未命中当前外置构建模块。允许 Luna 修改 `tests/e2e/service-redesign-repair.spec.ts` 的故障注入，精确阻断实际车间模块并仍断言恰好一次；保留三工位可读、无增强控件和其余原测试，不修改应用或 CSP。需双端定向复测及完整门禁 exit 0。

## 实现方向

1. 普通 E2E/formal 构建与启动显式 ci；测试子进程环境隔离，保留真正发布环境的严格校验。临时服务器仅改变监听端口，公开 origin 与构建保持一致。
2. formal 使用专用 loopback 启动器和精确可信代理配置，正常请求以可信转发协议取得本地响应；就绪检查也须带同样的协议声明。HTTP 安全负例使用独立请求上下文并禁止重定向跟随。生命周期需覆盖退出、超时、信号及子进程清理。
3. 健康、版本与两条回退分支的内部请求统一采用有超时、不跟随重定向且验证响应的探针。不得把 308 当健康，不增加宽泛的 loopback 绕过。优先复用现有可信代理机制；目标配置不满足时明确失败，不自动改生产信任配置。
4. 用本地夹具验证发布成功/失败/回退与版本匹配。不得通过执行真实 SSH、rsync、PM2、CMS 写入验证脚本。

## 验收与证据

- staging/production 父环境都能启动 CI 测试构建和服务；临时端口 CMS 空结果实际得到 404；formal 元数据仍使用正式 origin。
- 内部健康与版本取得本地正确响应，异常依赖、错误版本、重定向、超时均失败。formal readiness、页面和 API 请求不访问公网。
- 原始 HTTP GET/HEAD 保持 308，unsafe 保持拒绝，不可信转发头无绕过；正式 manifest 缺失或错配仍失败。
- 定向测试、类型、Lint、维护预算、格式通过；隔离环境完整 `npm run verify:release` exit 0。CMS/咨询全部使用本地假服务或明确不可达 loopback；使用最短绝对 TMPDIR 避免 Chromium socket 路径限制，不改变系统设置。
- R5 完整门禁实际父环境为 ci，必须如实标注。另以 staging、production 两种父环境分别运行实际普通 E2E 的 CMS 空结果用例和 formal 配置，核对测试子环境与构建 origin；之前的 HTTPS runtime 矩阵及源码字符串断言不替代这项证据。最后用 production 与当前目标候选 `https://8.138.148.179` 构建并回读 public-site-origin manifest，不能将 loopback CI 包称作正式地址包。
- Terra 交付冻结 → Luna 独立验证 → Nova Review → Sol 验收。失败同 ID 返工；测试通过不表示部署完成。
- 证据目录 `output/optimization/xyy-20261015-03/`，保留命令、失败/复测、变更 hash 和实际限制。

## 当前进度

R5 已完成独立验证：CI 完整 `verify:release` exit 0，883 单测、301 E2E / 17 既有跳过、6 formal 及构建通过；四组 staging/production 父环境普通/formal 矩阵、production HTTPS origin 构建和隔离副本缺 manifest 启动负例通过。19 个候选文件 hash 与 1575 文件范围核对一致。Luna PASS、Nova APPROVED，Sol 已验收本地范围；未进行提交、推送、部署或真实外部写入。
