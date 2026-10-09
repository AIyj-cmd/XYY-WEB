# XYY-20261004-01 — HTTP 缓存依赖漏洞修复

- 风险：HIGH；用户“修复这个问题”授权修复上一轮生产依赖 audit 阻塞。仅本地实现、验证和状态同步；发布任务 XYY-20261003-04 的目标及范围仍待确认。
- 基线：HEAD `5beb6a22b846e779ffa03b636d5e9cf4b8241ea5`；原有脏文件、两轮已验收安全修复和全部历史证据保留。快照：`output/security/xyy-20261004-01/sol/baseline.json`。
- 根因：Astro 7.2.8 引用 http-cache-semantics 4.2.0；GHSA-ch52-4w7c-c8xp / CVE-2026-93748。2026-10-04 npm 官方元数据最新仍为 4.2.0，公告无已发布补丁。上游 PR 58/60 尚未合并，只作为参考，不能冒称官方修复版。

## Scope 与所有权

- Terra：`package.json`、`package-lock.json`；新增 `scripts/vendor/http-cache-semantics/` 的最小本地源码包（源代码、BSD 许可证、清晰本地版本、来源及补丁说明）；新增 `tests/unit/http-cache-semantics*.test.ts`；必要时仅对第三方原样源码增加 `eslint.config.mjs`、`.prettierignore` 的精确排除；追加 `docs/TERRA.md`；证据 `output/security/xyy-20261004-01/terra/`。
- Luna：独立测试，仅可新增/修正本任务测试文件、追加 `docs/LUNA.md` 和写 `output/security/xyy-20261004-01/luna/`；不得改实现。
- Nova：只读审阅实现、安装/审计证据、独立测试及 Scope，追加 `docs/NOVA.md` 和写 `output/security/xyy-20261004-01/nova/`。
- Sol：本合同、`DEV_STATE.md`、追加 `docs/SOL.md` 及本任务 Sol 证据；最终验收。
- 所有角色不得再委派，不得恢复/覆盖其他人的改动。

## 实现要求和 AC

1. 使用仓库内可审阅的 4.2.0 最小安全补丁，并通过 npm override 让 Astro 实际加载它。保留原许可证、原版本来源和改动说明；不得伪称官方已修复，不得通过降级 Astro、修改 audit 阈值或忽略公告解决。
2. 必须阻止共享 Set-Cookie（无 public/immutable 明确许可）、proxy-revalidate、no-cache、不可存储响应的 max-stale 绕过；同类 stale-while-revalidate、stale-if-error 和 TTL 入口不能重新放行受限响应，包括 Vary 通配及共享 s-maxage 的过期限制。错误回退须检查请求匹配及 no-cache；保留显式 public 的授权响应、合法 public/private 缓存、普通过期 max-stale、成功 304 和序列化行为。
3. 红/绿测试证明旧版本可复现、实际安装的新版本阻断，包含数值与无限 max-stale、失败重新验证及正反对照。真实 Astro 图片消费者合成测试确认受限响应 TTL 为 0、普通图片缓存正常。
4. 锁文件改动仅关联本依赖；离线安装与符合现有部署文件布局的独立生产安装可重现，未遗漏本地包。`npm audit --omit=dev` 必须实际执行并报告真实结果；明确本地包不受 npm 公告扫描覆盖，安全修复成立依据为源码和行为测试。
5. 本次 `npm run verify` 通过；不修改页面，独立验证聚焦缓存、安装、构建，无需无关全浏览器矩阵。生产发布前仍须在最终发布候选运行 verify:release。
6. Terra → Luna PASS → Nova APPROVED → Sol 验收；所有既有范围外文件/证据、Git HEAD 和索引保持，独立本地记录不宣称已提交、推送或部署。

## 排除与输入

- 不修开发依赖的其他历史告警，不修改应用业务、代理信任、CMS、数据库、环境变量、部署脚本、CI 门禁、线上服务或 Git 历史。
- 输入：现有 package/lock、Astro `dist/assets/build/remote.js`、原 4.2.0 源码、旧复现 `output/security/xyy-20261003-02/reproduction/sol/dependency-repro.mjs`（只读）、官方公告和上游 PR 58/60。
- 来源：https://github.com/advisories/GHSA-ch52-4w7c-c8xp 、https://github.com/kornelski/http-cache-semantics/pull/58 、https://github.com/kornelski/http-cache-semantics/pull/60 。
- 本地包位于 scripts 内以沿用现有部署上传布局。不得删除 node_modules 或全量复制仓库；磁盘余量有限。网络/TLS 沙箱失败必须走工具升级，不能关闭 TLS 验证。

## 当前结果

- 本地代码 ACCEPTED；发布验证 BLOCKED，未满足全部 AC，不标记整个任务 CLOSED。Terra → Luna R1 FAIL → Terra R2 → Luna R2 本地 PASS → Nova 代码 APPROVED → Sol 本地代码验收。
- 11 个配置、依赖源码和测试文件：package/lock、ESLint 与 Prettier 对单一第三方源码的精确排除、vendor 四文件、三份缓存回归测试。原 package 的所有既有内容保持；lock 仅根依赖、本地 link 和 vendor 条目变化。
- 最终 verify exit 0：102 files / 673 tests、类型/lint/维护/assets/build 通过；实际 Astro 消费者、受限策略序列化、304、SIE 请求匹配和合法缓存正例通过。R1 的 Vary 空格/private 边界失败已沿同 ID 修复，原失败证据保留。
- AC4 环境阻塞：offline production ci 为 ENOTCACHED；联网 ci 多包 TLS/连接/超时错误，精确停止后的退出码 143，不作为安装成功。两次联网 audit 超时，curl 官方端点空查询为过期证书错误；没有降低 TLS 或 audit 门禁，没有可用的零告警结果。
- 1432 个范围外文件、77 份旧证据、四日志原前缀、HEAD 与索引保持。Terra 新日志曾插入旧条目前，已仅移动本任务段到 EOF 并恢复精确前缀；失败检查保留。
- 未提交、推送、部署；无真实 CMS/数据库/询盘或环境配置变更。网络恢复后补齐生产 ci 与 audit；最终发布候选还须 verify:release 及准确目标/范围确认。当前安装验证不代表干净服务器安装、生产运行或所有依赖均无漏洞。
- 证据：`terra/r2/` 红绿日志，`luna/r2/` 独立矩阵与 verify，`nova/review.json`，`sol/production-audit-attempt1.json`、`production-audit-attempt2.json`、`audit-connectivity-probe.json`、`production-install-network.json`、`final-status.json`（均相对本任务 output 目录）。
