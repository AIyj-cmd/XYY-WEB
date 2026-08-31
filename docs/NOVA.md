# Nova

返回 [Sol 调度入口](SOL.md)。

## Role

Quality / Architecture / Code Review Agent。

模型：`gpt-5.6-sol`；推理等级：`high`。

## Responsibilities

- Code、Architecture、Security、Scope 与 Maintainability Review。
- API/CMS contract、数据边界、重复实现和既有架构一致性检查。
- 回归覆盖合理性、不必要重构、复杂度和隐蔽风险检查。

## Boundaries

- 默认只 Review，不主动重写 Terra 的业务实现，不直接命令 Terra。
- APPROVED、REJECTED、冲突和升级全部返回 Sol。
- Nova 不是部署代理；不修改生产环境、不写生产 CMS、不操作数据库，不处理 PostgreSQL → Oracle 19c。
- 遵守根目录 `AGENTS.md`，不泄露 Secret，不使用破坏性 Git 操作。

## Review Workflow

1. 接收 Task ID、Scope、Acceptance Criteria、Terra diff、Luna 结果和相关架构上下文。
2. 检查 Scope、职责边界、重复实现、统一数据源、CMS/API 契约、安全、复杂度与测试覆盖。
3. 给出 `APPROVED` 或 `REJECTED`，以具体证据说明阻断项和剩余风险。
4. 结果只返回 Sol；返工 Review 沿用原 Task ID。

## APPROVED Contract

- Task ID 与 Review Scope。
- `Result: APPROVED`。
- 已检查的 Architecture、Security、Maintainability、Contract 和 Test Coverage。
- Remaining Risks 与 Handoff。

## REJECTED Contract

- Task ID 与 Review Scope。
- `Result: REJECTED`。
- 具体发现、影响、证据、严重度和建议返工范围。
- Remaining Risks 与 Handoff；不得直接指挥 Terra。

## Work Log

首次真实参与任务时复制以下模板；重新 Review 继续更新原 Task ID。

### XYY-20260821-03

Status: APPROVED

Review Scope: Review `/product`、`SPECIALTY_LINKS` 当前 9 个服务专题页、`/cases`、`/news`、`/senlinqikan` 的共享底部 CTA 实现，以及 `/yundao-zhineng-jijian` 的旧 CTA 保留边界、相关产品样式清理和定向 Playwright 覆盖；不包含详情页、首页、关于页、CMS、Server、部署或生产环境。

Architecture: `ConversionCTA.astro` 将产品页既有 CTA 的结构收敛为单一组件，页面只提供语义化文案；视觉变量和响应式规则集中在仅由该组件导入的 `src/styles/conversion-cta.css`，全部选择器以 `.conversion-cta` 为根命名空间。服务页通过既有导航权威清单 `SPECIALTY_LINKS` 精确门控当前 9 条下拉路由，排除路由继续走原 `service-cta` 分支。未发现重复实现、无效 Astro 模式、死样式或不必要的跨层依赖。

Security: 所有内容均由内部静态属性经 Astro 默认转义输出，主行动链接固定为 `/contact`，未使用 `set:html`、外部输入、Secret、CMS 写入、API、数据库或生产操作。`aria-labelledby`、唯一标题 ID、语义化 `section` / `aside` / `ol` 和可见键盘焦点路径有效。

Maintainability: Sol 完整验证发现初版 `ConversionCTA.astro` 228 行超过 180 行预算后，同一 Task ID 返工将不变样式外移；复审确认组件为 71 行、专用 CSS 为 155 行，`npm run check:maintainability` 对 526 个文件通过。CSS 只有组件唯一导入入口，产品页旧 CTA 样式入口和已废弃选择器已同步删除，数字化服务页仍需的旧样式保留。Props 清晰且当前所有调用均提供两行标题和三项准备信息；未将数量固化为 tuple 是非阻断的未来误用风险，现有路由矩阵测试已约束本次调用。

Contract Risks: `/product` 原标题、说明、按钮和三项准备信息保持不变，视觉基线关键尺寸、颜色与 760px 响应式断点等价迁移；当前 `SPECIALTY_LINKS` 恰好 9 条且全部启用新 CTA，`/yundao-zhineng-jijian` 保持原 CTA。栏目页仅替换底部转化区域并使用页面专属静态文案；未绕过 `src/lib/claims/`，未改变 CMS/API/数据契约。

Test Coverage Review: Luna 初测及样式外移后 Re-test 均为 PASS。初测定向 4-spec Playwright 共 13 passed、1 个既有配置 skip；返工后 Chromium/mobile CTA spec 为 2 passed，并再次检查 13 条目标路由的样式实际生效、唯一 CTA、无横向溢出、console/page error、代表页桌面/移动视觉和排除路由旧 CTA。Nova 初审复核 `npm run typecheck`：368 个文件，0 errors、0 warnings、0 hints；返工复审独立运行 `npm run check:maintainability` 通过，`git diff --check` 通过。

Result: APPROVED

Re-review after maintainability fix: APPROVED

Remaining Risks: CTA 文案仍为静态页面内容，未来若要求 CMS 可编辑需另立数据契约任务；外置 CSS 是类名前缀隔离而非 Astro 编译期 scoped CSS，但其唯一组件导入和 `.conversion-cta` 根命名空间使当前泄漏风险为 LOW。未做逐像素视觉快照或独立平板宽度矩阵，但共享组件、既有 760px 断点及 Luna 返工后代表页截图已覆盖本次主要风险。

Handoff: 返工复审仍为 APPROVED，维护预算阻断已关闭；返回 Sol 做最终验收，无其他阻断项，不需要再次返工，不涉及部署。

### XYY-20260822-01

Status: APPROVED

Review Scope: Review 提交 `eac67903d1e65437b74f9b4ee74890dad01e3843` 在本地、GitHub `main` / 功能分支与测试站 `https://wz.tomatopia.top` 的发布一致性；核对发布前门禁、失败尝试边界、原子发布身份、Luna 发布后结果及生产/CMS/数据库隔离。不执行推送、部署、CMS 写入、数据库或生产操作。

Architecture: 本地 `main`、`origin/main`、本地功能分支与远端功能分支均指向 `eac67903d1e65437b74f9b4ee74890dad01e3843`；`main` reflog 明确记录从 `ba07fd4` 快进合并，远端通过普通 push 更新，未发现强推或历史改写。测试站 `/version` 实时返回同一完整 SHA、`releaseId=20260821T170201Z-eac6790`、`environment=staging` 与 `cmsSchemaVersion=2026-08-cms-hardening`，`/healthz` 返回 `status=ok`。现有发布脚本在首次 SSH 前执行完整本地门禁，因此两次门禁失败均发生在远端预检、上传和切换之前；最终发布沿用既有原子 Release、身份核对和健康失败回滚路径。

Security: 提交变更未发现凭据赋值或 Secret；测试站回读和 Luna 验收均为只读，没有表单提交、CMS 写入或数据库操作。发布身份明确为 `staging`，审查证据未显示正式主站、DNS、TLS、Nginx、生产环境变量或手工 PM2 配置变更。`CI=1` 在 Playwright 配置中只把 worker 收敛为 1 并禁止复用既有 Web Server，测试清单、30 秒用例超时和断言保持不变，不构成绕过失败断言。

Maintainability: 本任务未新增业务实现；发布内容仍是已由 Terra、Luna、Nova 和 Sol 验收的三个关闭任务。首次非 CI 模式超时涉及 `about-cases` 总用例时限而非断言不匹配，使用单 worker 的 CI 运行符合项目既有配置并降低共享本地资源争用。强制 `RELEASE_ID` 的重试被 Release Identity 单元 fixture 在本地正确阻断，随后恢复脚本生成身份是正确闭环。

Contract Risks: GitHub 实际为该 SHA 触发了 CI Run `32505147175`，结论为 `failure`，与“没有 GitHub Actions 触发”的交接声明不一致。失败点是 `npm run format:check` 检出 `tests/unit/image-cache-contract.test.ts` 格式不合规；候选 Release Identity、依赖审计和 `verify:release` 步骤因此全部跳过。该文件不是本提交引入的变化，父提交 `ba07fd4` 的 CI 也因同一问题失败，但当前 `main` 仍然是红色，不能据此宣称 GitHub 发布门禁通过。本地 `verify:release` 未包含 `format:check`，因此本地全绿不能替代该 CI 结果。

Test Coverage Review: 发布脚本最终门禁证据为 45 个 Vitest 文件 / 292 项测试通过、39 项 E2E 通过 / 7 项跳过、3 项正式契约通过及构建通过；Luna 发布后独立验证 `/version`、`/healthz`、13 条目标路由的桌面与移动共 26/26 PASS，排除路由保持旧 CTA。Nova 另行实时回读 13 条目标路由均为 HTTP 200 且恰好一个共享 CTA，排除路由没有共享 CTA。上述证据足以证明当前测试站运行内容，但不足以把 GitHub CI 状态记录为通过。

Initial Result: REJECTED

Initial Remaining Risks: 测试站当前 Release 健康且与本地和 GitHub SHA 一致，运行风险较低；阻断项是 GitHub `main` CI 红色和交接状态不准确。若修正格式并形成新提交，则本地、GitHub 和测试站 SHA 会再次分叉，必须重新执行 CI、测试站发布身份核对与 Luna/Nova 验收后才能关闭本任务。

Initial Handoff: 返回 Sol。沿用 `XYY-20260822-01` 闭环 GitHub 格式门禁；由 Sol 决定返工调度，Nova 不直接修改测试或业务代码、不部署。完成后需提供绿色 GitHub CI、新目标 SHA 的三方一致性和必要的发布后测试证据，再交 Nova Re-review。

#### Re-review after formatting remediation

Review Scope: 仅复审 `tests/unit/image-cache-contract.test.ts` 的格式返工、Terra 实现记录和 Luna 独立复测；不重新扩大到业务实现，不执行提交、推送或部署。

Architecture: 唯一代码差异是将 `readProjectFile` 的单行箭头函数表达式按 Prettier 拆为两行；调用、返回值、URL 构造、编码参数、测试结构和断言均未改变。没有应用代码、运行时依赖、API/CMS 契约或发布脚本变化。

Security: 纯空白与换行格式调整不引入输入面、网络访问、凭据、权限或数据边界变化；未发现 Secret 或生产操作。

Maintainability: 修复精确作用于 GitHub CI 指定的唯一格式失败文件，没有顺手重构。Nova 独立运行 `npx prettier --check tests/unit/image-cache-contract.test.ts` 通过；完整 `npm run format:check` 已由 Terra 与 Luna 分别验证通过。

Contract Risks: 原 CI 阻断是该文件不符合项目 Prettier 输出；当前工作树内容已符合 Prettier，能够关闭该确定性格式失败。修复不改变测试契约或应用发布内容。

Test Coverage Review: Terra 与 Luna 均报告目标测试 8/8 PASS 和 `git diff --check` PASS；Nova 独立复跑同一测试为 1 个文件、8 项通过，并确认 `git diff --check` 通过。对纯格式调整，该覆盖充分。

Result: APPROVED

Remaining Risks: 返工尚未提交和推送，因此 GitHub 对新 SHA 的实际 CI 结果、三方新 SHA 一致性及测试站新 Release 身份仍待 Sol 后续验证；这些是发布流程后续门禁，不是当前格式修复的代码阻断。

Handoff: 返回 Sol；该最小返工可以提交并推送。需等待 GitHub 新 SHA CI 全部通过；由于提交将改变 SHA，随后应重新发布测试站并由 Luna / Nova 核对新 `/version`、健康状态及必要回归后再关闭 `XYY-20260822-01`。

#### Final release review after staging release 539bfd4

Review Scope: 最终 Review 应用提交 `539bfd44c05d81b5b7a1246cb009beec4c58f4c1` 的 GitHub CI、Git 引用、测试站 Release Identity、健康状态、目标路由、Luna 发布后回归和部署边界；只读审查，不修改应用代码、不推送、不部署。

Architecture: 本地 `HEAD` / `main`、`origin/main` 及远端 `codex/unified-cta-governance-20260822` 均指向 `539bfd44c05d81b5b7a1246cb009beec4c58f4c1`。该提交相对初次发布 SHA 只包含 Prettier 格式修复与 Terra/Luna/Nova 同 Task ID 工作记录，没有应用运行逻辑变化。测试站 `/version` 实时返回同一应用 SHA、`releaseId=20260821T235850Z-539bfd4`、`environment=staging` 与 `cmsSchemaVersion=2026-08-cms-hardening`；`/healthz` 返回 HTTP 200、`status=ok`、`contactStorage=ok`。

Security: GitHub CI 的依赖审计通过；测试站发布身份明确为 `staging`。本轮发布及 Luna 验收没有 CMS 写入、表单提交或数据库操作；审查证据未显示正式主站、DNS、TLS、Nginx、生产环境变量或手工 PM2 配置变更。未发现 Secret 或权限边界扩大。

Maintainability: 原 CI 格式失败已沿用 `XYY-20260822-01` 以单文件机械格式化闭环，没有修改断言或业务实现。GitHub CI Run `32538099712` 的 Check formatting、候选 Release Identity、生产依赖审计和 Release verification 全部成功，证明此前被跳过的门禁已经实际恢复，而非仅依赖本地结果。

Contract Risks: 共享 CTA、CMS/API、`src/lib/claims/` 与发布契约均未因格式修复改变。测试站 `/version` 精确匹配 GitHub 应用提交，环境和 CMS Schema 口径正确；未发现版本冒用、跨环境发布或数据契约漂移。原 GitHub 红灯和错误的“未触发 Actions”状态声明已经由当前绿色 Run 和本记录关闭。

Test Coverage Review: GitHub Release verification 全部成功；Luna 对当前 Release 完成 13 条目标路由 × 桌面/移动共 26/26 PASS，覆盖唯一 CTA、联系入口、三项准备信息、双栏/单栏响应式、无溢出及 console/page error，排除路由保持旧 CTA。Nova 独立公网回读确认 13 条目标路由均 HTTP 200 且恰好一个共享 CTA，`/yundao-zhineng-jijian` 为 HTTP 200 且共享 CTA 为 0；`git diff --check` 通过。

Result: APPROVED

Remaining Risks: 当前未提交变化仅为 Luna 与 Nova 的最终工作日志，不改变应用 Release。若 Sol 将最终状态文档另行提交并推送，GitHub 仓库 HEAD 可合理领先测试站应用 SHA 一个纯文档提交；最终报告应分别标明“仓库状态提交”和“测试站应用提交”，不得把文档提交误报为已部署应用。CTA 动画首帧和未来 CMS 可编辑需求仍是既有非阻断范围。

Handoff: 返回 Sol 做最终验收、状态文档收口与 GitHub 同步。`XYY-20260822-01` 的应用发布、CI、staging 身份、健康检查和发布后回归均无剩余阻断；无需再次修改业务代码或重复部署纯文档变化。

### XYY-20260824-01

Status: APPROVED

Review Scope: Review XYY-WEB `/api/contact` 到 XYY-xiansuo `/api/integrations/website-leads` 的最终两仓 diff（含 untracked route / tests）、Terra 返工记录、Luna 首次 FAIL 与最终 Re-test PASS、两端 Auth / payload / owner / duplicate / audit / health / release 契约及生产边界。用户既有 `.codex/config.toml` 变化不归属本 Task；审查未修改业务实现、未连接生产、未部署、未 push / merge，也未执行 CMS、Oracle 或生产 SQLite 操作。

Architecture: 运行时主链路设计正确：浏览器仍只调用 `/api/contact`，原 body/content-type/rate-limit/honeypot/privacy/validation 保留；XYY-WEB 服务端以单次 5 秒 HTTPS 请求调用专用 Integration route，没有 Directus 双写。XYY-xiansuo 路由与员工 JWT 路由分离，服务端解析 active owner，lead 与 `website_integration` audit 同一 SQLite transaction，审计失败会回滚。Directus `cmsContent` 与 Xiansuo `contactStorage` 健康依赖已拆分，没有删除 CMS 内容健康检查。Graphify 的现有图谱也确认 `contact.ts → storage.ts` 与 `health.mjs → health-contract` 为本次跨边界主路径。

Security: Integration 仅接受独立 Bearer Token；空、短、错误、非 Bearer 和员工 JWT 均失败关闭。配置 Token trim 后要求至少 32 UTF-8 bytes，Xiansuo 对两端 SHA-256 固定长摘要使用 `timingSafeEqual`，请求 Token 不被 trim 改写。owner/created_by 不在公开 schema，伪造字段被 strict schema 拒绝；URL/body/response/客户端不承载 Secret，未发现真实凭据。Luna 首轮发现的 SQLite 错误详情泄露已修复：路由局部固定返回 `{ code: 1, msg: '线索接收失败', data: null }`，Re-test 证明不含 `SQLITE`、trigger 详情、Token、电话或 stack，且 lead 已回滚。

Maintainability: 新增一个局部 Integration route 与一个官网 storage adapter，复用 `getDb()`、`assertActiveOwner()`、`todayDate()` 和既有 API envelope，未引入 Redis、MQ、OAuth、API gateway、通用 CRM connector 或新数据库抽象。电话先删除空白/连字符再校验、查重和存储，格式变体无法绕过唯一索引；duplicate 不更新旧线索。当前主要维护缺口不在运行码，而在下述两端发布/环境契约没有与新设计收敛。

Contract Risks:

- **HIGH — XYY-WEB 官方生产 Web 环境模板与预备入口仍是旧 Directus contact 契约。** `deploy/production/web/web.env.example:5` 仍只给出 `DIRECTUS_CONTACT_TOKEN`，没有 `XIANSUO_API_URL` / `XIANSUO_INGEST_TOKEN`；`deploy/production/web/prepare-web-server.sh:13-17` 仍强制“两枚 Directus Token 或 legacy Token”；`deploy/production/web/README.md:24-26` 仍把联系写入说明为 Directus。按当前官方步骤准备 `.env` 后，根 `scripts/deploy.sh:55` 又会因缺少 Xiansuo 配置拒绝发布。这使当前 diff 不能满足“环境变量最终契约可按现有发布路径落地”的 Acceptance Criteria。
- **MEDIUM — XYY-xiansuo API 的 PM2 运行契约未显式纳入两个 Integration 变量。** `deploy/.env.example` 已新增两项，但 `deploy/ecosystem.config.cjs:17-52` 的 `xiansuo-api.env` 没有 `WEBSITE_LEAD_INGEST_TOKEN` 和 `WEBSITE_LEAD_OWNER_ID`；Nova 以隔离假值读取该 config，两个 `hasOwn` 均为 `false`。当前 deploy shell 可能通过启动环境继承它们，但这没有被 PM2 配置或契约测试固化，与该仓库对 API 进程变量显式列举的做法不一致，无法作为可重现的发布保证。
- **MEDIUM — 当前 CMS 运行说明仍宣称联系表单使用 Directus Token，且 `/healthz` 检查两枚 Directus Token。** `docs/CMS_CONTENT_MODEL.md:46-69` 与实际新代码直接冲突。历史 `contact_leads` 集合、Schema 和必要维护权限可以保留，但文档必须区分“历史/维护”与“当前 Web 运行写入目标”，否则会引导下次环境准备恢复旧路径。

Test Coverage Review: Luna 最终 PASS 证据充分覆盖运行代码：XYY-WEB `verify` 为 46 files / 305 tests，Playwright 为 39 passed / 7 configured skips（含桌面/移动），formal 为 3 passed；XYY-xiansuo build 通过、178 tests 通过，两仓 `git diff --check` 通过。Auth、strict payload、null/max length、owner 伪造、无效 owner、手机/座机、格式变体 duplicate、transaction rollback、错误脱敏、员工 JWT 语义及 Web 下游 400/401/403/500/network/timeout/invalid JSON 均有证据。但现有测试只检查根 `scripts/deploy.sh` 和浏览器/CI 配置，没有检查 XYY-WEB `deploy/production/web/{web.env.example,prepare-web-server.sh,README.md}` 的新契约，也没有检查 XYY-xiansuo `deploy/ecosystem.config.cjs` 的 Integration env 传递；因此全绿未能暴露本次阻断。

Result: REJECTED

Remaining Risks: 运行时 API 实现未发现其他阻断；尚未进行两个正式系统的真实 HTTPS 端到端联调，未验证真实 owner ID、Secret 注入、发布顺序、回滚和网络可达性。这些生产动作仍需未来单独明确授权，不影响当前必须先修复仓库内发布契约的结论。Oracle / Directus 历史 `contact_leads` 未修改、未迁移、未删除，也未双写。

Handoff: 返回 Sol。建议沿用 `XYY-20260824-01` 对两端发布/环境契约与当前 CMS 说明做最小收敛，并增加能防止两类漂移的契约测试；由 Sol 决定返工调度。任何改动后仍需 Luna Re-test，通过后再交 Nova Re-review；Nova 不直接指挥 Terra，也不执行部署。

#### Re-review after production configuration and documentation contract remediation

Review Scope: Re-review 原三项 REJECTED 阻断的最小返工与两仓最终完整 diff：XYY-WEB 正式 Web 环境模板、prepare 脚本、部署说明、CMS 内容模型和新契约测试；XYY-xiansuo PM2 API env 显式传递与实际 CJS load 测试。同时复核前轮已通过的运行时 Auth、事务、错误脱敏、健康检查、Oracle / Directus 历史边界和 Scope。用户既有 `.codex/config.toml` 仍排除在本 Task 之外。

Architecture: 官方 Web 准备链路已与根部署入口收敛：`web.env.example`、`prepare-web-server.sh` 和 `scripts/deploy.sh` 一致要求 `DIRECTUS_CONTENT_TOKEN`、HTTPS `XIANSUO_API_URL` 与非空 `XIANSUO_INGEST_TOKEN`，不再要求旧 `DIRECTUS_CONTACT_TOKEN` 或 legacy `DIRECTUS_TOKEN`。Xiansuo `xiansuo-api.env` 已显式从受控运行环境传递 `WEBSITE_LEAD_INGEST_TOKEN` 和 `WEBSITE_LEAD_OWNER_ID`，不提供 fallback 或默认 owner。Graphify 所示 `contact.ts → storage.ts` 与 `health.mjs → health-contract` 运行路径未被返工改写；浏览器仍只请求 `/api/contact`，Directus 仍只承担 CMS 内容。

Security: 模板中 Integration Token 保持空值，仓库没有真实 Secret；新测试仅使用 `randomBytes(32)` 产生的隔离临时 Token，且恢复 process env 和 `require.cache`。PM2 配置仅原样传递环境值，不硬编码、不弱默认、不把 Token 放入浏览器。前轮 Bearer 固定摘要比较、空/短/错误/员工 JWT 失败关闭、owner/created_by 服务端控制以及 SQLite 错误细节脱敏证据仍有效。未发现 query/body/client/log Secret 或新的公开写入绕过。

Maintainability: 返工只收敛现有发布契约和当前文档，未调整业务 route、数据库 Schema、CMS 脚本或员工 API。`production-web-contact-config.test.ts` 固化 Web 模板 / prepare / root deploy 的一致性和旧 Token 排除；`deploy-ecosystem.test.ts` 通过实际加载 CJS config 证明 PM2 值传递，没有仅靠文本搜索声称通过。未引入新依赖、新框架或不必要抽象。

Contract Risks: 原 HIGH Web 环境模板/预备入口冲突、MEDIUM Xiansuo PM2 env 未固化、MEDIUM CMS 文档旧语义均已关闭。`docs/CMS_CONTENT_MODEL.md` 现在明确历史 `contact_leads` 保留、不接收新写入、不迁移，Web 运行时仅使用 Directus 内容 Token，健康依赖分为 `cmsContent` 与 `contactStorage`。历史 Directus contact 维护工具保留不等于新线索双写；最终 diff 没有 Oracle/SQLite Schema、历史记录迁移、删除或清空。

Test Coverage Review: Luna Re-test 为 PASS：XYY-WEB `npm run verify` 共 47 files / 306 tests，`format:check`、`bash -n prepare-web-server.sh` 和 diff check 通过；XYY-xiansuo build 及 179 tests 通过，diff check 通过。Nova 独立复跑 Web 新契约测试为 1/1 PASS，`bash -n` 和 diff check 通过；独立复跑 Xiansuo PM2 实际加载测试为 1/1 PASS，diff check 通过。前轮 Web E2E 39 passed / 7 configured skips、formal 3 passed 以及 Auth/payload/owner/duplicate/transaction/error-envelope 全量证据在运行代码未改动的前提下仍有效。

Result: APPROVED

Remaining Risks: 当前只是本地实现与契约验证，不代表生产已切换。真实上线仍需受控生成同一枚密码学随机 Token，选择 active Xiansuo owner，先部署 Xiansuo 后部署 Web，并在明确授权的变更窗口验证真实 HTTPS、健康检查、线索落库、日志与回滚。当前 prepare/deploy 预检只验证 Token 非空，少于 32 bytes 会由运行时健康检查失败关闭并阻止新 Release 存活；这是可接受的非阻断运维风险，可在未来获授权的部署 Task 中再加强早期预检。

Handoff: Re-review `APPROVED`，原三项 Nova 阻断已关闭；返回 Sol 对照 Acceptance Criteria 做最终验收与状态收口。无需再次返工，不涉及部署、push、merge、PM2、生产 CMS / Oracle / SQLite 操作。

### XYY-20260824-02

Status: APPROVED

Review Scope: 独立 Review `XYY-20260824-01` 已验收实现发布到 XYY-xiansuo 与 XYY-WEB staging 的版本身份、环境与 Secret 边界、active owner、Integration 鉴权、direct smoke / duplicate、真实浏览器 E2E、字段与审计、无 Directus 双写、健康检查、Git 同步、回滚证据和正式主站未切换事实。审查只执行 Git、HTTP、SSH 服务状态与文件元数据等只读检查；未读取或输出 Token 值，未修改业务实现、生产配置、CMS、Oracle 或数据库，未部署、push、merge 或操作 PM2。

Architecture: Xiansuo `xiansuo-api.service` 实时为 `active/running`、`NRestarts=0`，`ExecStart` 精确指向 `/opt/xiansuo-releases/3c3eb1baa82a942c4a5f867a50d3e640b8497a5c/server/dist/index.js`，`RELEASE_SHA` 与 GitHub `main` 一致，数据库可写路径仍是原 `/var/lib/xiansuo/7bb238...`，没有 Schema 或 migration 切换。Web `current` 精确指向 Release `20260824T090653Z-4c1f313`，manifest、外部 `/version` 与 GitHub `main` 均为 `4c1f31346ebe19664bccfec13d69841bd31a5e4e` / `staging`；`/healthz` 同时为 `cmsContent=ok`、`contactStorage=ok`。浏览器证据显示两次请求均只到 staging `/api/contact`，没有直接访问 Xiansuo；新留言只进入 Xiansuo，Directus 只读计数为 0，符合无双写边界。

Security: Xiansuo Integration health 无 Authorization 实时返回 401；Luna 已独立验证受控服务 Token 为 200、无 Token与伪员工 JWT 均为 401。运行环境文件 `/etc/xiansuo/xiansuo-api.env` 和 `/var/www/xyy-web/.env` 均为 `600 root:root`，预部署备份目录为 `700 root:root`。远端 Token 为受控生成的至少 32-byte Secret，Nova 未读取其值；Luna 的 journal、两端 release tree、Web PM2 日志扫描以及 Nova 对两仓 tracked/worktree 文档与 diff 的无值扫描均未发现 Secret 泄露。owner ID 2 已由 Luna 证明为 active member `jj`，请求无法覆盖 owner/created_by；员工 API 未认证仍为 401，现有权限检查返回 403，没有扩大员工 JWT 权限。

Maintainability: 本 Task 没有代码缺陷或业务返工，因而没有机械调度 Terra。Web 使用既有 `scripts/deploy.sh` 原子 current symlink、双健康与 release identity 门禁；新 Release 的 `.previous_target` 精确保留旧 Release `20260821T235850Z-539bfd4`，脚本在启动、健康、身份或外部检查失败时恢复该目标。Xiansuo 保留旧 Release `7bb238f76e35e11e298d32175f8d406383e4e0f6`，并有 `/var/backups/xiansuo/XYY-20260824-02-predeploy` 受控备份。首次缺少本地构建 CMS Token、第二次既有四 worker E2E 超时都在远端发布前停止；隔离复测通过后，最终完整 `CI=1 verify:release` 通过才执行成功发布，没有形成半发布状态。

Contract Risks: direct smoke 线索 ID 8 的首次创建与第二次 `duplicate=true` 已验证；真实 UI 线索 ID 9 两次页面成功，但 Xiansuo 仅有一条 lead、一条 `website_integration` create audit、0 follow-up，字段、日期、source/status/intent、owner/created_by、source_note 与 demand_note 均符合契约且未覆盖。Xiansuo `/api/health` 与 Web 双依赖健康均为 200；正式 `56xyy.com` 主页和 robots 哈希仍精确等于发布前基线，未提交正式主站表单。Oracle 未执行命令、未改 Schema，历史 Directus / Oracle `contact_leads` 未迁移、删除或写入。

Test Coverage Review: Luna 最终 PASS 覆盖服务 Token / 无鉴权 / 伪员工 JWT、direct create / duplicate、active owner、字段与 audit、桌面和 390×844 移动端真实 Chromium、浏览器网络边界、Xiansuo 与 Directus 只读计数、员工权限、主站完整性和 Secret 扫描。实现门禁证据为 Web 47 files / 306 tests、39 E2E passed / 7 configured skips、3 formal passed、构建及格式通过；Xiansuo build 与 179 tests 通过；两仓 `git diff --check` 通过。Nova 另行实时核对两仓远端 `main` / feature ref、服务 release identity、健康响应、旧 Release / `.previous_target`、备份权限和主站哈希，结果均与 Luna 证据一致。

Result: APPROVED

Remaining Risks: 正式主站 `56xyy.com` 尚未执行切换，本 Task 仅激活 Xiansuo 与 Web staging；测试线索 ID 8 和 ID 9 按审计约定保留并标记 TEST ONLY / DO NOT FOLLOW，员工不得业务跟进。

Handoff: 返回 Sol 做 `XYY-20260824-02` 最终验收与状态收口。当前发布版本、健康、数据契约、无双写、Secret、回滚和主站边界均无剩余阻断；无需业务返工或重复部署。

### XYY-YYYYMMDD-NN

Status:

Review Scope:

Architecture:

Security:

Maintainability:

Contract Risks:

Test Coverage Review:

Result:

Remaining Risks:

Handoff:

### XYY-20260824-04

Status: APPROVED

Review Scope: XYY-WEB Git 同步、CI、staging 版本/manifest/进程/回滚一致性，以及 XYY-xiansuo 三方一致且未重启的 HIGH 风险只读发布 Review。

Architecture: Web 本地和 GitHub main/feature 均为 `2c75bcd0d3878f4877afac1cc07c4dfa18913360`，从 `c831f84` 线性快进；staging current、外部 `/version`、manifest 与进程 cwd 一致为 `20260825T054116Z-2c75bcd`，previous target 有效。Xiansuo 本地、GitHub 与 runtime 均为 `3c3eb1baa82a942c4a5f867a50d3e640b8497a5c`。

Security: 目标增量无敏感凭据模式命中，不含 `.env`、备份或运行配置；未读取 Token。同步增量只涉及 Codex 配置和工作账，不进入 staging 应用发布 allowlist。

Maintainability: 没有业务实现、依赖或部署脚本变更；staging 运行代码与已验收祖先业务实现等价。两仓工作区干净，无本地/远端漂移；Xiansuo systemd 启动时间早于本次 Web Release，证明未重复部署或重启。

Contract Risks: Web 双依赖健康、核心路由与真实 404 均正常；Xiansuo health 正常、systemd active/running、`NRestarts=0`。未涉及 claims、CMS/Directus contract、数据库或 Oracle。

Test Coverage Review: GitHub CI Run `32788366421` 成功；Luna PASS 覆盖版本、健康、核心路由、回滚、PM2/systemd、Xiansuo 三方一致与 Secret Scope；Nova 独立复核 Git ancestry、GitHub refs、live manifest/symlink/process 和运行状态，证据一致。

Result: APPROVED

Remaining Risks: `/version` 标识包含工作账与 Agent 配置的同步提交，实际业务运行代码与祖先 `4c1f313` 等价；这是预期的发布审计语义。按 Scope 未访问 `56xyy.com`，不对正式主站实时状态新增断言。

Handoff: 返回 Sol 最终验收；无需 Terra 返工、重复部署或重启 Xiansuo。

### XYY-20260825-01

Status: REJECTED

Review Scope: Review XYY-xiansuo `server/src/routes/website-leads.ts` 与 `server/test/website-leads-integration.test.ts` 的实际 diff、Terra 交付、Luna PASS、XYY-WEB `ContactInquiryFields.astro`、CMS `contact_leads.service` choices、Web 校验与服务端传输边界。审查未修改业务实现，未部署、push、commit，未连接或写入生产 CMS / SQLite / 数据库，也未执行 Schema、迁移、配置或既有数据操作。

Architecture: 将五个 Web 稳定服务码在 Xiansuo `sourceNote()` 写入/显示边界转换为中文，位置和职责总体合理；Web 仍传输稳定码，浏览器、Web API、Xiansuo Integration、lead/audit 事务和唯一存储路径均未改写，也未绕过 Directus 内容边界或 `src/lib/claims/`。但当前普通对象下标映射没有把任意未知字符串与对象原型键隔离，破坏了该边界承诺的 passthrough 语义。

Security: diff 未改变 Bearer 鉴权、Token 比较、strict payload、owner/created_by 服务端控制、duplicate、事务回滚或固定错误响应；未发现 Secret、日志泄露、权限扩大、客户端凭据、生产配置或生产操作。原型键碰撞不会导致代码执行或对象写入型 prototype pollution，但会让公开输入生成错误的持久化 `source_note`，属于数据完整性问题。

Maintainability: 业务改动局部且没有新增依赖、Schema、抽象或重复写入路径；五项映射与 Web 表单及 CMS choices 精确一致。不过 `Record<string, string>` 的类型声明掩盖了普通对象继承属性仍可被索引命中的运行时事实，当前 fallback 表达式不能保证未知值原样保留。

Contract Risks: **阻断 — 未知/自定义服务值并非全部原样保留。** `WEBSITE_SERVICE_LABELS[lead.service] ?? lead.service` 对 `toString`、`constructor`、`__proto__` 等允许通过两端 80 字符字符串校验的值会读取 `Object.prototype`，分别写成原生函数文本或 `[object Object]`，而不是输入值。Nova 最小复现确认 `future-service-code` 正常，但上述三值均发生替换；Web 服务端目前也不把 service 限制为五个枚举，因此该路径可由公开请求到达。五个已知 code/label、null、email-only、message/source/status/owner/duplicate/auth 等其余契约未发现漂移。

Test Coverage Review: Luna 的 targeted 8/8、Xiansuo build、full 180/180 和 Web contact contract 21/21 证据有效；Nova 复跑 Xiansuo targeted 仍为 8/8。新增循环生成 `13500138000` 至 `13500138004`，均满足中国大陆手机号正则且与本文件其他测试号码唯一；测试通过响应 ID 查询 SQLite `leads.source_note`，确实证明持久化结果，而非只断言响应或 helper。现有测试覆盖五个稳定码、中文自定义、普通未知值、null 与 email-only，但只使用 `future-service-code` 代表未知值，未覆盖对象原型键碰撞，因此全绿没有证明“所有未知/自定义值保持原值”。

Result: REJECTED

Remaining Risks: 阻断关闭后仍有一项非阻断演进风险：未来 Web 新增稳定服务码时，Xiansuo 会按原值保存，需在同一契约中确认中文标签。本 Task 尚未部署或验证生产运行环境，符合当前生产边界。

Handoff: 返回 Sol。当前实现未完全满足 unknown/custom passthrough Acceptance Criteria；由 Sol 决定最小返工与回归调度。Nova 不直接指挥 Terra，不执行部署或生产数据操作。

#### Re-review after unknown service passthrough remediation

Review Scope: Re-review 同一 Task 的最终完整 diff、Terra `Map` 返工、Luna Re-test PASS，以及原型键、五项稳定码、中文/普通未知值、null、email-only 和既有 Integration 回归。最终业务 diff 仍仅为 XYY-xiansuo `server/src/routes/website-leads.ts` 与 `server/test/website-leads-integration.test.ts`；Web 工作树只有 Terra、Luna、Nova 日志，无业务代码变化。

Architecture: 服务标签仍只在 Xiansuo `sourceNote()` Integration 写入/显示边界转换，Web 继续传输稳定码，未新增第二存储路径、共享状态、Schema 或跨层抽象。普通对象已替换为 `Map<string, string>`，`.get()` 只命中五项显式键，所有其他合法字符串可靠走原值 fallback，原 REJECTED 的对象原型边界已关闭。

Security: `Map` 返工不改变 Bearer 鉴权、strict payload、owner/created_by、duplicate、lead/audit transaction、错误脱敏或员工 JWT；原型键不会触发继承属性读取，也不存在 prototype pollution 写入。最终 diff 无 Secret、生产配置、权限、数据库/迁移、CMS、部署或运行环境操作。

Maintainability: 最小返工复用语言内建 `Map`，没有新增依赖、helper、通用字典层或不必要重构。五项 code/label 与 `ContactInquiryFields.astro`、CMS `contact_leads.service` choices 继续精确一致；未来新增稳定码仍按明确契约演进，不会静默猜测标签。

Contract Risks: 原阻断已关闭。`toString`、`constructor`、`__proto__` 与普通未知值、中文自定义值均按原字符串写入；五项稳定码转换为既定中文；null 与 email-only 行为保持。message、source、status、intent、owner、created_by、duplicate、audit 与鉴权路径没有业务 diff。未发现剩余阻断性 API/CMS 或数据边界风险。

Test Coverage Review: Luna Re-test 为 targeted 8/8、Xiansuo build、full 180/180、两仓 diff check PASS；Nova 独立复跑 targeted 8/8 并复核两仓 diff check PASS。原型键测试使用合法且唯一的 `13500138990` 至 `13500138992`，通过响应 ID 查询 SQLite `leads.source_note` 并逐项断言原值；五项映射测试的 `13500138000` 至 `13500138004` 同样合法唯一且验证持久化结果。全量测试继续覆盖 Auth、payload、active owner、duplicate/phone normalize、audit/rollback、错误脱敏和员工 JWT，测试范围与实际风险匹配。

Result: APPROVED

Remaining Risks: 未来 Web 新增稳定服务码时，Xiansuo 会安全保留原值，仍需另行确认并同步中文标签。本次是本地代码与契约验收，不代表已部署或验证生产运行环境。

Handoff: Re-review `APPROVED`，原 Nova REJECTED 阻断已关闭；返回 Sol 做同一 Task 的最终验收与状态收口。无需进一步业务返工，Nova 未部署、push、commit 或操作生产 CMS/数据库。

### XYY-20260825-02

Status: APPROVED

Task ID: XYY-20260825-02

Review Scope: 对 XYY-xiansuo 服务标签本地化提交 `a5f82b96b271e266af58ca14b505ad026f050244` 的两文件实际 diff、GitHub / 本地 / 生产 release 身份、systemd 与环境文件边界、旧 release 和部署前 unit 回滚资产、重启健康、真实 staging 浏览器 E2E、生产 SQLite 只读数据证据、Secret / Schema / CMS / Oracle / 主站 Scope 以及 Xiansuo 红色 CI 进行最终 HIGH 风险发布 Review。Nova 只执行源码、Git、GitHub、HTTP、SSH 服务状态、日志和 SQLite read-only 核对；未部署、push、commit、修改配置或写生产数据。

Architecture: 目标 commit 相对 `3c3eb1b` 只修改 `server/src/routes/website-leads.ts` 与对应 Integration 测试；五项 Web 稳定码仍只在 Xiansuo `source_note` 写入/显示边界经安全 `Map` 转换，浏览器继续只调用 Web staging `/api/contact`，没有新存储路径、CMS / claims 绕行、Schema 或跨层重构。生产 `ExecStart`、`WorkingDirectory`、`RELEASE_SHA`、本地和 GitHub `main` / feature 均精确对应 `a5f82b9...`；release 中源码及编译 JS 哈希与本地目标产物一致。运行 DB 仍为原 `/var/lib/xiansuo/7bb238.../app.db`，Web staging 仍运行 `2c75bcd`，符合仅文档同步而不重复发布 Web 应用的边界。

Security: Integration 无 Authorization 实时返回 401，目标 diff 未改变 Bearer 定时比较、至少 32-byte 配置要求、strict payload、服务端 owner / created_by 控制、事务或固定错误包络。生产环境文件仍为 `/etc/xiansuo/xiansuo-api.env`、`600 root:root`，mtime 为前一日，unit 继续只引用该路径；Nova 未读取 Token 值。两目标提交的敏感值模式扫描无命中，日志核对未发现凭据值或业务 Secret。数据库目录为 700、DB/WAL/SHM 为 600；没有权限扩大、客户端 Token、环境编辑、Schema / migration、Oracle、Directus 或 `56xyy.com` 变更证据。

Maintainability: 改动保持最小，两文件、无依赖、无复制存储和无不必要抽象；Web 表单与 CMS choices 的五项稳定码/中文标签和 Xiansuo 映射一致，未知、自定义及对象原型键继续可靠 passthrough。systemd 当前 `active/running`、`NRestarts=0`；旧不可变 release `3c3eb1b...` 与 `/var/backups/xiansuo/XYY-20260825-02/xiansuo-api.service.pre` 同时保留，备份 unit 精确指回旧 release 并复用同一环境文件，回滚身份明确。环境文件未随本次发布改写。

Contract Risks: 生产 read-only 查询确认手机号 `01000000025` 仅一条 lead（ID 12），`source_note` 为 `咨询服务：鞋服云仓\n邮箱：test@example.com` 且不含稳定码，需求含 `[XYY-20260825-02 LABEL TEST]`，create audit 恰一条、follow-up 为零。Playwright trace 恰一条 `POST https://wz.tomatopia.top/api/contact` 返回 200、无浏览器直连 Xiansuo，截图显示成功 UI。重启窗口 14:45:17 的一次 health 502 与同秒 upstream connection refused 对应，14:45:19 已恢复 200；当前公网 health 200、服务无重启或回滚迹象，因此该瞬时 502 不构成持续发布故障。

Test Coverage Review: Luna 发布后独立 QA 为 PASS；预部署证据为 Xiansuo build、180/180、H5 build，以及 Web `npm run verify` 306/306。Nova 独立复跑目标 Integration 8/8 和 TypeScript `--noEmit` 均通过，并核对目标 GitHub CI 中该 Integration 新测试通过。Xiansuo Run `32818086795` 的 179/180 红灯由未改的 `phase45-pilot-readiness.test.ts:118` 在 workflow 固定 Node 22 下调用不存在的 `DatabaseSync.serialize()` 导致；基线 `3c3eb1b` Run `32711350101` 在同一位置、同一错误下为 178/179，且本次 diff 对失败测试和 workflow 均为零。该 API 只在测试中用于只读性断言，不在发布运行路径；生产虽然同为 Node 22，但当前 runtime health 和真实写入路径已验证。因此这是已继承、与本 Scope 无因果关系的 CI / Node 兼容治理风险，记录为非阻断，不在本发布 Task 中扩展修复。

Result: APPROVED

Remaining Risks: Xiansuo `main` 的全局 CI 仍为红色，并因 server test 提前失败而跳过后续 CI job steps；虽然本次没有依赖、Gateway、H5 或 workflow 变更，且对应本地门禁与生产 E2E 已覆盖实际增量风险，这仍削弱后续分支保护和发布信号可信度。应由独立维护 Task 统一 Node 22/24 测试契约并恢复全绿，不能把当前 APPROVED 解读为永久豁免。测试线索 ID 12 按审计约定保留为 `TEST ONLY / DO NOT FOLLOW`。

Handoff: 最终发布 Review `APPROVED`，返回 Sol 对照 Acceptance Criteria 完成验收与状态收口。无需 Terra 返工、重复部署或回滚；本结论不授权部署 Web staging / `56xyy.com`、生产配置编辑、CMS / Oracle / 数据库写入，也不关闭独立 CI 兼容治理风险。

### XYY-20260830-01

Status: APPROVED

Task ID: XYY-20260830-01

Review Scope: 对服务专题页 Seed 生成缺失 `stats` / `features`、9 条仓配下拉专题页 `stats` / `features` / `img_src` 定向修复工具、共用 CMS 同步运行时的 dry-run 备份扩展、生成输出、README、package script、Terra diff 和 Luna PASS 做 HIGH 风险最终 Review。Nova 读取了任务合同、相关 CMS Schema / runtime authority、Seed 来源与测试，只执行只读检查、聚焦测试和格式检查；除本日志外未修改业务实现，未连接真实 Directus，未部署、push、提交、写 CMS、操作数据库或执行 Oracle 工作。

Architecture: `generate-cms-content-seeds.mjs` 继续以 10 个审核源码专题页为单一 Seed 来源，并仅补齐原先遗漏的 `page.stats` 与 `page.features`；生成 diff 除 10 页结构数组外没有其他内容漂移。定向模块将目标固定为与 `SPECIALTY_LINKS` 精确一致的 9 个 slug，读取使用 `GET /items/service_pages?limit=-1&sort=slug`，没有错误依赖不存在的 `sort` 字段。`planServicePageStructureRepair()` 先对全部 Seed 执行 4 stats、6 features、子字段非空和 `img_src` 非空校验，再对全部当前记录执行唯一 slug、空 `hero_image`、`published` 门禁；只有完整 `map()` 成功返回后才进入 PATCH 循环，因此不存在预检到一半即开始写入。运行时 `getServicePageContent()`、Directus authority / fallback 和 `hero_image` 优先级没有 diff；工具通过拒绝已配置 `hero_image` 避免修复一个运行时不会生效的 `img_src`。

Security: CLI 只从环境读取 `DIRECTUS_URL` / `DIRECTUS_TOKEN`，日志仅输出经过 `URL.host` 和安全字符过滤的 endpoint label、记录 ID 与变更字段名，不输出 Authorization、Token 或响应正文。dry-run 与 apply 都把读取到的 `service_pages` 快照写入 Git 忽略的 `output/cms-sync/`，新文件显式使用 `0600`；文件名 host 已去除路径、凭据和非安全字符。PATCH payload 由模块内固定三字段白名单 `stats`、`features`、`img_src` 构造，不包含 status、slug、hero、标题或其他 CMS 字段。diff 不含 Secret、运行环境、权限、Schema、迁移、数据库、Oracle、部署或主站应用发布变更。

Maintainability: 改动复用既有 `createDirectusAdminClient`、`createCmsSyncRuntime`、`findUniqueRecord`、`buildPatch` 和生成器，没有复制 HTTP、鉴权或通用同步实现；`writeBackup(snapshot, { includeDryRun })` 的默认值保持原同步命令只在 apply 备份的兼容行为。修复工具按任务域独立成小模块和薄 CLI，无依赖升级或不必要重构。用户预存未提交的 `DEV_STATE.md` / `docs/SOL.md` 变更保持原样，Terra 实现范围没有覆盖或重写它们。

Contract Risks: Seed 的 9 个目标结构与对应源码 props 精确相等，缓存规避后的 9 个 `img_src` 映射与任务合同一致；修复不创建、删除、发布、归档或清空记录。apply 后重新读取完整集合，并同时复核三字段零差异及唯一、published、空 `hero_image` 门禁；重复执行时已一致字段生成空 patch，支持幂等补齐。Directus 的 9 次 PATCH 不是事务，脚本会在任一请求或最终回读失败时非零退出，但不会自动回滚已成功 PATCH；README 已如实要求保留原始备份、重跑 dry-run、幂等补齐并完成零差异验证，没有伪装成原子操作。未发现 CMS/API 契约、数据 authority 或职责边界漂移。

Test Coverage Review: Luna 独立结果为 PASS：生成器连续两次 SHA 稳定；聚焦 3 files / 24 tests、全量 `npm run verify` 48 files / 316 tests、typecheck、lint、maintainability、assets、build、format 和 diff check 全部通过；隔离 mock CLI dry-run 只有一次显式 `sort=slug` GET、计划 9 个 PATCH、实际 0 PATCH，并生成 `0600` 备份；staging / main 的 9 页只读矩阵建立了修复前后目标基线。Nova 独立复跑同一聚焦套件为 24/24 PASS，并复核完整格式检查与 `git diff --check` 通过。测试覆盖目标集合、源 Seed 相等、图片映射、三字段白名单、dry-run、缺失 / 重复 slug、不完整 Seed、hero 门禁和非 published 门禁；apply 后回读和中途失败恢复主要由小型 CLI 控制流、共用 runtime 与人工运行手册覆盖，未在本任务连接真实 Directus。

Result: APPROVED

Remaining Risks: 本结论只批准代码与受控工具合同，不代表生产缺陷已经修复。生产仍需用户明确授权并由获授权操作方使用短期管理 Token：先执行默认 dry-run、人工确认 endpoint、9 条目标与三字段计划及备份，再执行 `--apply` 并保存最终零差异输出。9 次 PATCH 的非事务窗口、并发 CMS 编辑以及网络在 PATCH 后但回读前中断仍可能形成“已部分或全部写入但命令失败”的状态；此时不得盲目回滚或重置 CMS，应依据首次备份和新的 dry-run 幂等续跑。当前测试没有对真实 Directus 执行 apply，也没有自动化注入第 N 次 PATCH 失败或并发运营编辑；这些是生产变更窗口的剩余操作风险，不是当前实现阻断。

Handoff: 最终 Review `APPROVED`，返回 Sol 对照 Acceptance Criteria 做最终验收并决定是否向用户申请生产 CMS dry-run / apply 的独立明确授权。无需 Terra 返工；Nova 不授权也不执行部署、生产 CMS 写入、CMS reset、Schema / 数据库 / Oracle 操作，且不修改主站运行时 CMS authority / fallback。

### XYY-20260831-02

Status: REJECTED

Task ID: XYY-20260831-02

Review Scope: 对 News 无时区发布时间修复、`POST /api/integrations/news/batch` 服务端批量发布接口、三项 Token 隔离、Directus 写入适配、环境模板、README、Terra 最终 diff 和 Luna Re-test PASS 进行 HIGH 风险 Review。Nova 读取任务合同、相关 News 查询/渲染清洗链路与全部新增测试，只执行源码、Git diff、官方 Directus 批量写入契约核对和聚焦测试；除本日志外未改写业务实现，未部署、push、提交、写 CMS、修改环境、操作数据库或执行 Oracle 工作。

Architecture: News 公开读取已把数据库 `$NOW` 比较替换为应用侧统一解析：Directus 无 offset 时间按 Asia/Shanghai 编辑时间解释，带 `Z` / offset 时间按绝对时刻解释；列表和分类在未来时间过滤后排序、分页，详情使用相同可见性判断，显示日期固定为 Asia/Shanghai。`limit: -1` 会随 News 数据增长扩大单次读取，但当前集合很小，且实现如实记录了未来采用有界查询或数据库时区规范化的触发条件，当前可接受。发布接口限定为一个固定 News batch create 路径，没有引入 UI、任意集合、文件上传、更新、删除、Schema、图片/CMS 修复或第二数据源。

Security: Bearer 调用凭据使用 SHA-256 digest 后恒时比较；`NEWS_PUBLISH_API_TOKEN`、`DIRECTUS_NEWS_WRITE_TOKEN`、`DIRECTUS_CONTENT_TOKEN` 均要求至少 32 UTF-8 bytes、三者存在且两两不同，并在任何 fetch 前失败关闭。请求、响应、日志和 client bundle 未暴露 Token；接口没有 CORS/browser exposure。文章 HTML 继续只在既有 `sanitizeRichText()` 后进入 `set:html`。但 Directus 写入 URL 存在阻断性传输安全缺口：`src/lib/news-publishing/storage.ts:16-24` 只拒绝 URL credentials、query 和 hash，不限制 protocol/host，因此 `DIRECTUS_URL=http://非回环主机` 仍会在 `storage.ts:84-88` 通过明文 HTTP 发送高权限写入 Bearer Token。环境变量虽由运维控制，配置错误仍会直接泄露服务端 Secret；HIGH 风险写入口必须 fail closed，而不能仅依赖 README 推荐使用 `127.0.0.1`。

Maintainability: 时间 parser 对日历、闰年、小时、毫秒、ISO separator 和最大 `±14:00` offset 使用单一实现；校验、鉴权、HTTP、storage 与 route 职责分离，没有新增依赖或复制 Directus 通用读取逻辑。批量 create 为单次有限 10 秒请求且无重试；官方 Directus `createMany` 契约为同一事务内顺序创建，因此未发现部分成功被伪装为整体失败的具体问题。新增模块和测试均通过维护性预算。阻断修复应保持局部：Directus URL 只允许 HTTPS，或仅对明确 loopback 主机放行 HTTP，避免引入通用网络抽象。

Contract Risks: 请求严格限定顶层 `articles` 和每篇七个字段，1 MiB、1–20 篇、字段类型/长度、四个 category、canonical slug、文件 UUID、带时区 ISO 时间及批内重复 slug 均受校验；`status=published` 与默认当前时间由服务端控制。Directus 成功结果只接受数量匹配且 ID 为正安全整数，唯一冲突稳定映射 409，其他下游异常统一为非敏感 502。当前唯一阻断是非回环明文 HTTP 可发送写 Token。生产启用仍需另行授权创建最小 `news` create 权限 Token，并以真实 Directus smoke 确认该权限可返回所需 ID；本 Task 没有执行此生产动作。

Test Coverage Review: Luna 首轮 FAIL 准确发现并关闭无效日期归一化、三 Token 隔离不完整和无效 ID false success；最终 Re-test 为聚焦 5 files / 78 tests、完整 `npm run verify` 51 files / 372 tests、format、diff check 和 client Secret scan 全部 PASS。Nova 独立复跑同一聚焦 5 files / 78 tests并复核 `git diff --check`、Secret 扫描通过。测试覆盖时间边界、列表/分类/详情、鉴权、字段白名单、大小/批量、Token 缺失/短值/复用、严格 payload、timeout、duplicate、下游错误与 ID 契约；但没有覆盖 `DIRECTUS_URL` 的 protocol/host 传输安全边界，因此全绿未证明写 Token 不会走非回环明文 HTTP。

Result: REJECTED

Remaining Risks: 除上述阻断外，`limit: -1` 是当前小数据量下已接受的扩展性风险；批量发布代码尚未配置真实 Secret、Directus 权限或生产环境，不能视为 API 已激活。正式启用前还需对 Oracle-backed Directus 执行受控 smoke，核对 offset 写入后的发布时间 round-trip 与 ID 响应，但不得在本次代码 Review 中自行写生产 CMS。

Handoff: 返回 Sol。由 Sol 决定在原 Task ID 下派发最小返工：仅允许 HTTPS Directus URL，或仅为明确 loopback 放行 HTTP；补充非回环 HTTP、非 HTTP scheme 在 fetch 前失败关闭，以及合法 HTTPS/loopback 路径测试。修复后须按既有闭环重新经 Luna Re-test，再交 Nova Re-review。Nova 不直接指挥 Terra，也不执行部署、生产环境、CMS、数据库、Oracle 或 Git 操作。

#### Re-review after Directus write URL transport remediation

Review Scope: 复审同一 Task 的最终完整 diff、Terra 对 Nova 唯一 URL 传输安全阻断的局部返工、Luna 第二轮 Re-test PASS，以及 News 时间、Token、payload、Directus response、范围与生产边界。Nova 未改写业务实现，只执行源码/diff 检查、聚焦 5 files / 90 tests、格式和 diff check；未部署、push、提交、配置环境、写 CMS、操作数据库或执行 Oracle 工作。

Architecture: 原有 News 可见性与 batch create 架构没有被返工扩大。`directusNewsUrl()` 继续保留已有 Directus base path 并只追加固定 `/items/news`；远端地址只允许 `https:`，HTTP 只允许 URL 解析结果和原始文本同时明确为 `localhost`、`127.0.0.1` 或 `[::1]`。该双重检查拒绝数值 IP 别名、尾缀 lookalike、解析归一化绕过和其他 scheme，没有引入 DNS、网络探测或通用 URL 抽象。

Security: 原 REJECTED 已关闭。非回环 HTTP、`localhost.evil.test`、`127.0.0.1.evil.test`、整数形式 IPv4、FTP、userinfo、query 和 hash 均在构造 Authorization header 和执行 fetch 前失败关闭；合法远端 HTTPS及三个明确 loopback HTTP 地址可用。三项至少 32-byte 且两两独立的服务端 Token、Bearer 恒时比较、无 CORS/client exposure、无日志/响应 Secret 和最小权限写入契约保持不变。未发现新的 SSRF 输入面：Directus URL 只来自受控服务器环境，不来自请求 payload。

Maintainability: 修复只在 storage URL builder 增加一个小型 loopback allowlist 和一条可审计正则；没有修改通用 Directus 读取、联系 Integration、页面或 CMS Schema。实现覆盖 IPv4、IPv6、hostname 与 base path，复杂度与 HIGH 风险 Secret 传输边界相称。`limit: -1` 的既有小数据量扩展性风险仍被如实记录，不由本轮返工扩大。

Contract Risks: News 时间解析、严格 article whitelist、1 MiB / 20 篇限制、server-controlled `published`、带 offset ISO、UUID、slug/category、10 秒单次批量事务写入、409 duplicate、正安全整数 ID 和非敏感错误语义均保持。合法 URL 测试确认 `/cms` base path 精确生成 `/cms/items/news`；拒绝性测试确认不安全地址不会收到 Directus write Token。未发现剩余阻断性 API/CMS 合同风险。

Test Coverage Review: Luna 第二轮 Re-test 为聚焦 5 files / 90 tests、完整 `npm run verify` 51 files / 384 tests、format、diff、client Secret 与 Scope 检查全部 PASS。Nova 独立复跑聚焦 5 files / 90 tests、`npm run format:check` 和 `git diff --check` 全部通过。新增 URL 矩阵覆盖远端 HTTPS、三个回环 HTTP、base path、非回环/伪回环 HTTP、数值别名、其他 scheme、userinfo、query、hash及 fetch-before-secret 边界，和原阻断风险精确对应。

Result: APPROVED

Remaining Risks: 公开 News 仍会读取全部已发布候选再在应用侧过滤；当前数据量小，文章规模显著增长时才触发独立性能/时区规范化任务。API 仍只是本地实现就绪：生产启用必须另获授权，创建不同的高熵调用/写入 Token、最小 `news` create 权限，并以真实 Directus smoke 验证 ID 与发布时间 round-trip；当前未配置或写入生产 CMS。

Handoff: Re-review `APPROVED`，Nova 唯一 REJECTED 阻断已关闭；返回 Sol 对照 Acceptance Criteria 完成最终验收与日志收口。无需进一步 Terra 返工；本结论不授权部署、push、生产环境编辑、CMS/数据库/Oracle 操作，也不代表批量发布 API 已在生产激活。

### XYY-20260831-03

Status: APPROVED

Task ID: XYY-20260831-03

Review Scope: 对已验收应用提交 `b91a7b20d96adf086cc2ec50aea1a8dd77ecd199` 的 GitHub `main` / CI、分支清理、staging 原子 Release `20260831T081814Z-b91a7b2`、公开版本与双依赖健康、News 桌面/移动发布后证据、批量发布 API 未配置时的失败关闭、回滚目标和生产边界执行 HIGH 风险发布 Review。Nova 仅执行源码、Git、GitHub、公开 HTTP 与 staging 文件路径的只读核对；除本日志外未修改业务实现，未部署、改配、写 CMS、操作数据库或执行 Oracle 工作。

Architecture: 本地 `main`、`origin/main`、GitHub 唯一远端分支和 staging `/version` 均精确对应应用提交 `b91a7b2...`；运行 Release 为 `20260831T081814Z-b91a7b2`，`environment=staging`、CMS Schema 为 `2026-08-cms-hardening`。`/healthz` 同时确认 `cmsContent=ok` 与 `contactStorage=ok`，没有把 CMS 内容依赖和联系线索存储依赖混为一体。News 页面继续从既有 Directus 读取路径获取已发布内容并由统一 Shanghai 时间边界过滤；新增 API 仍是固定 `/api/integrations/news/batch` 服务端写入入口，没有产生浏览器写入、第二数据源、任意集合或部署时 CMS 写入。

Security: staging 未配置 `NEWS_PUBLISH_API_TOKEN` 与 `DIRECTUS_NEWS_WRITE_TOKEN`；无认证请求实时返回 HTTP 503 和通用 `{"error":"发布服务暂不可用"}`，证明配置检查在鉴权和 Directus fetch 前失败关闭，未泄露 Token、内部 URL、stack 或下游响应。提交中的环境模板只保留空值或非真实占位符；Luna 的 client bundle 检查未发现三项服务端 Token、Xiansuo Token 或 Bearer 内容。目标实现继续要求 caller / write / content 三 Token 均至少 32 UTF-8 bytes 且两两不同，远端 Directus 写 Token 只可走 HTTPS、HTTP 仅限明确 loopback。发布未编辑主站、生产 CMS、数据库、Oracle、DNS、TLS、Nginx 或主站 PM2。

Maintainability: 发布提交严格对应已完成 Luna PASS / Nova APPROVED 的 `XYY-20260831-02` 实现，没有部署期热修、ad-hoc 启动方式、依赖或额外架构。GitHub CI Run `33371936252` 为 `completed/success` 且 `headSha` 精确匹配目标提交；合并后的临时和历史已合并分支已清理，本地与远端均只保留 `main`。部署沿用既有 Release 目录、原子 symlink 和 manifest 身份校验，未发明新的发布机制。

Contract Risks: staging `/news` 实时 HTTP 200，Luna 独立桌面/移动 Chromium 检查均为 3 篇已发布文章、控制台 0 error / 0 warning，联系页仍只提交 `/api/contact`，代表性页面均 200。批量发布能力代码已部署但因写入凭据未配置而明确处于 `INACTIVE / FAIL-CLOSED`；因此本次没有验证真实 batch create、Directus 最小 create 权限、duplicate 或发布时间 round-trip，也不能把 staging 发布描述为“批量发布 API 已启用”。这与用户本次仅推送、分支清理和 staging 部署的 Scope 一致，不构成发布阻断。

Test Coverage Review: 实现提交发布前及部署脚本内的 `npm run verify:release` 均通过，最终门禁为 51 个测试文件、384 项单测、39 项 E2E（7 项按配置跳过）、3 项正式域名契约及生产构建；GitHub CI 同 SHA 成功。Luna 发布后独立 PASS 覆盖精确版本/Release、双依赖健康、News 桌面/移动与控制台、联系边界、代表性页面、API 通用 503、GitHub/main/分支清理和生产边界。Nova 复核实时 `/version`、`/healthz`、`/news`、503 响应、GitHub CI / refs 以及 current symlink；当前 Release 的 `.previous_target` 精确为存在的 `/var/www/xyy-web/releases/20260830T100940Z-82c01ed`，回滚身份明确。

Result: APPROVED

Remaining Risks: staging 批量发布 API 尚未激活；若未来启用，必须另建获授权任务配置彼此不同的高熵调用/写入 Token、Directus 最小 `news` create 权限，并执行受控 CMS smoke、duplicate 与时间 round-trip 验证。GitHub CI 仅有 Actions 运行时 Node 20 强制迁移到 Node 24 的平台弃用提示，当前不影响成功结论，但 workflow action 版本未来需在独立维护任务中升级。正式主站服务专题页的既有 CMS 内容/图片缺失仍是独立的 `XYY-20260830-01` 生产 CMS apply 阻塞，不由本 staging 应用发布修复。

Handoff: 最终发布 Review `APPROVED`，返回 Sol 对照 Acceptance Criteria 完成 `XYY-20260831-03` 验收、状态文档收口和工作账提交。无需 Terra 返工或回滚；本结论不授权启用 batch CMS 写入、不代表 `56xyy.com` 已部署，也不改变生产 CMS / 数据库 / Oracle 边界。
