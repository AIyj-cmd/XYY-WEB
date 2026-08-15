# DEV_STATE

更新时间：2026-08-15

## 协作记录约定

- 每完成一个开发任务、配置调整、验证、提交或部署动作，都要在本文件同步记录完成内容、验证结果、当前状态和剩余事项，保证项目负责人和开发者能够快速确认实际进度。
- 记录以任务结果为单位，不堆砌无助于判断状态的终端命令、重复讨论或临时尝试；失败方案仅在会影响后续决策时保留。
- 使用中性、任务导向的表述，只写需要完成的动作，不使用身份化角色称呼。
- 不记录密码、Token、API Key、私钥、Cookie、真实 `.env` 内容或其他敏感信息。

## 当前目标

- 第一、第二、第三阶段分别作为连续的独立本地提交管理；第三阶段已完成 Directus CMS 模型契约、稳定内容身份、FAQ 单一归属、幂等 setup、严格 verify 和默认 dry-run 迁移工具的本地验收。
- 第三阶段状态为 `PHASE_3_LOCALLY_VERIFIED`、`CMS_CONTRACT_READY`、`MIGRATION_TOOL_READY`、`REAL_CMS_DRY_RUN_NOT_EXECUTED`、`NOT_APPLIED`、`NOT_DEPLOYED`；迁移工具仅通过 mock、fixture 和本地测试，未连接真实 CMS 或修改真实数据库。
- 第四阶段已完成 Web 运行权限残余的本地收口并作为独立本地提交管理：专用双 Token、主契约运行集合、轻量 readiness 与完整失败关闭审计；状态为 `PHASE_4_LOCALLY_VERIFIED`、`RUNTIME_TOKEN_CONTRACT_VERIFIED`、`MOCK_PERMISSION_AUDIT_VERIFIED`、`REAL_PERMISSION_AUDIT_NOT_EXECUTED`、`NOT_PUSHED`、`NOT_DEPLOYED`。

## 当前版本与环境

- 拆分前基线：`62095867ce74aabf6352cc9d08a361d9e217d108`（`6209586 记录验收站发布与运行权限状态`），该提交不包含第一、第二阶段修复。
- 第一阶段提交：`526f5b2 修复 Directus 返回状态语义`，父提交为上述基线。
- 第二阶段提交：`9cb7b426547582a84d865b18bc24397685aefe5c`（`9cb7b42 统一公开业务事实与 CMS 引用`），父提交为 `526f5b2`。
- 第三阶段提交：`ad54a4bd6aaa081f9109ac8ba65f4ff383eb5f5b`（`ad54a4b feat(cms): establish stable content contract and migration tooling`），尚未推送或部署；模型版本为 `2026-08-phase3`，真实 CMS dry-run 尚未执行。
- 验收站：`https://wz.tomatopia.top`。
- 当前 Release：`/var/www/xyy-web/releases/20260814T171015Z`，对应运行代码提交 `3f7f705`。
- 运行状态：PM2 中 `xyy-web` 在线，Web 端口为 `50031`。
- 健康状态：首页、`/healthz`、Directus ping、robots、sitemap 和 llms.txt 已通过发布后检查，`contactStorage: ok`。
- 当前数据库：PostgreSQL 16。Oracle 19c 迁移脚本已准备，但尚未迁移或完成恢复验证。

## 已完成

- 首页、产品、关于、案例、新闻、期刊及仓配专题页的响应式和动效问题已修复。
- 页面、组件、数据、样式、浏览器控制器、Directus 查询和服务端运行逻辑已按职责拆分，并由可维护性预算检查约束。
- CMS 内容可用时以后台数据为准；审核源码只在 CMS 不可用时提供故障回退。
- 首页案例固定为六个已确认品牌；公开运营数据统一从 `src/lib/claims/` 维护。
- `scripts/setup-cms.mjs` 可幂等创建十九个业务集合及初始化内容。
- 官网运行读取集合从 `config/cms-contract.mjs` 的 active 生命周期派生；13个运行集合与5个 legacy、1个 private 集合明确分离，不在运行权限代码中维护第二份数组。
- 内容权限同步：`Website Content Read-Only` 策略只获得运行集合的读取动作，不获得新增、修改或删除权限；实例具备自定义权限授权时可进一步下沉 `published` 过滤。
- 联系表单继续使用独立的“仅创建留言”权限，不允许读取历史留言。

## 关键决策

- Web 代码发布与 Directus 数据库初始化分开执行，避免发布过程自动修改数据库。
- 管理员 Token 只临时用于建模和权限配置，不进入网站运行环境或 Git。
- 网站运行时使用两枚不同 Token：内容只读 Token、联系表单仅创建 Token。
- 后台已发布数据优先于静态回退内容，避免后台修改后前端仍显示旧数据。
- CMS 成功返回空数据代表运营侧当前没有已发布内容，必须保持为空；只有网络失败、超时和 HTTP 5xx 才能启用审核静态回退。
- HTTP 401/403 和非法响应必须明确失败，不能用静态内容掩盖权限或数据契约问题。
- 正式环境必须发布同一 Git 提交、完整资源包和对应 CMS 模型，不能只同步前端构建文件。

## 核心维护文件

- 页面与组件：`src/pages/`、`src/components/`。
- 内容与事实：`src/data/`、`src/lib/claims/`。
- Directus 请求与查询：`src/lib/directus-client.ts`、`src/lib/directus/request-state.ts`、`src/lib/directus-queries.ts`、`src/lib/directus-content-queries.ts`。
- 案例详情状态：`src/pages/cases/[slug].astro`。
- 服务端运行逻辑：`server/`、`server/runtime-permissions.mjs`。
- CMS 初始化：`scripts/setup-cms.mjs`。
- CMS 权限同步：`scripts/lib/content-policy-sync.mjs`、`scripts/sync-content-policy-permissions.mjs`。
- 发布：`scripts/deploy.sh`、`ecosystem.config.cjs`。
- 内容模型与维护说明：`docs/CMS_CONTENT_MODEL.md`、`docs/MAINTAINABILITY.md`。

## 已验证结果

- Astro：319 个文件，0 错误、0 警告、0 提示。
- ESLint：通过。
- Prettier：通过。
- 可维护性检查：464 个项目文件通过。
- 资源检查：55 个引用资源和 103 个部署资源完整。
- Vitest：24 个测试文件、137 项测试通过。
- Playwright：38 项通过，6 项按项目配置跳过。
- 正式域名契约：3 项通过。
- 生产构建：通过。
- `npm run verify:release`：完整通过。
- 服务器生产依赖安装：0 个已报告漏洞。
- 测试日志中的 Directus `fetch failed` 来自刻意使用不可达 CMS 验证回退和健康失败关闭，不是发布故障。

## 已知问题与未完成事项

- Directus 状态语义修复与事实唯一来源治理已拆分为两个本地提交，但均未推送或部署，也未连接生产 CMS；线上状态不能由本地测试结果推断。
- 本轮 E2E 使用本地隔离的空 Directus 响应验证案例真实 404，生产环境仍需在后续发布流程中单独验收。
- 代码已支持新的 `claimKey` 契约及旧首页统计的受控兼容路径；真实 CMS 内容迁移尚未执行。
- 注册表中的 16 项全局公开事实均有结构化来源引用、审核人和审核日期，但仓库内未找到可独立核验的正式来源附件；全部 16 项的统计周期仍为 `null`，现有备注只如实说明缺失、待补录或不适用，不能据此声称证据闭环已经完成。
- 案例专属指标目前没有统一的来源文件、审核时间、公开授权和统计周期字段；需要在后续阶段设计独立的案例证据模型，不能机械并入全局 claims。

- 验收站 Directus 12.1.1 已建立两套独立运行策略和静态令牌：18个内容集合只读、`contact_leads` 仅创建；运行权限审计已经通过。
- 管理令牌已移出 Web `.env` 并保存在服务器独立的受限维护环境文件中；Web `.env` 只保留两枚运行令牌且权限为600。
- Directus 12 Community 当前未授权自定义权限规则，不能在策略层设置 `status=published` 过滤或字段级限制；官网所有内容查询显式过滤已发布状态，联系接口只接受表单白名单字段。不得通过修改许可代码绕过该限制。
- 新版本首次服务器发布因旧运行环境不符合新的权限健康契约而自动回滚；权限拆分与Directus 12兼容修复完成后已重新发布成功。
- 正式域名是否已同步运行代码提交 `3f7f705`、完整资源和最新 Directus 内容模型，本轮没有重新验证。
- Oracle 19c 仍是待执行的独立数据库迁移方案，当前不能描述为已经上线。

## 已放弃或替换的方案

- 不再手工逐个补十五项权限，改为幂等脚本同步，避免漏配和口径不一致。
- 不再让静态兜底覆盖后台已发布内容，避免后台修改无法生效。
- 不把一枚高权限共享 Token 作为长期网站凭据。
- 不把代码发布与数据库初始化合并成不可控的一步。

## 项目结构审查（2026-08-14）

- 已对 `src/`、`scripts/`、`server/` 和 `deploy/` 完成依赖与目录结构审查；结构图共覆盖 748 个节点、1312 条关系。`scripts/` 与 `server/` 未发现循环依赖，现有页面、组件、运行服务和部署脚本总体已具备清晰职责边界，不需要进行全项目重写。
- 已向项目负责人说明本轮发现项的含义、用户影响与处理优先级；这些项目多数属于未来容易引发漏配、性能浪费或维护困难的结构风险，并不表示当前网站已经全部发生故障。代码修复尚未开始。
- 审查时发现 CMS 集合清单存在重复来源：运行时只读集合与 CMS 建模集合分别维护，新增集合后可能漏配权限；该项已在下方“第一批结构优化”中完成共享契约和完整性测试。
- 审查时确认一条类型依赖环：`src/data/about/types.ts` 经 `src/lib/directus.ts` 与 `src/lib/directus-content-queries.ts` 相互引用；该循环已在第一批优化中解除，`directus.ts` 继续仅作为兼容门面。
- 审查时发现 `/healthz` 单次会产生约二十个 Directus 请求；该项已在第一批优化中收敛为3个请求，逐集合读取验证保留在发布验收脚本中。
- 十二个仓配专题路由已共享页面布局，但静态回退内容仍重复写在各 Astro 页面中。后续可把每页配置迁入类型化的 `src/data/service-pages/`，路由只保留页面组装和独有内容，同时由同一数据源生成 CMS 初始化快照，降低页面与种子数据漂移风险。
- `src/styles/` 有 124 个 CSS 文件，其中存在较多仅转发两到五行导入的多层入口。现有单文件体积合理，不应重新合并成巨型样式文件；建议保留每个功能一个公开入口，并把嵌套导入层级压到一层。
- `public/` 约 158 MB，其中森林期刊 PDF 约 133 MB。当前发布脚本已复用未变化文件，短期部署可接受；长期应在附件上传、备份和恢复流程稳定后，将 PDF 迁入 Directus 文件库或对象存储，减少 Git 历史和发布包体积。
- `DEV_STATE.md` 与 `docs/PROJECT_STATUS.md` 同时记录项目现状，后者含有过时 Release 和测试数据。后续应以本文件作为唯一实时状态入口，将旧状态文档归档或改为指向本文件，README 也应直接链接本文件。
- 本次仅完成只读结构审查和状态记录，没有修改业务代码、接口、路由、页面或部署配置，也没有重新运行测试；上一节列出的已验证结果仍对应当前提交 `7fd7a8a`。

## 第一批结构优化（2026-08-14）

- 新增 `config/cms-collections.mjs` 作为18个公开内容集合、1个私有联系集合和19个全量CMS集合的统一名称契约；运行权限、权限同步和模型契约测试改为共用该清单。
- 新增集合完整性测试：CMS模型定义必须与共享契约完全一致、不得重名，`contact_leads` 必须保持在公开内容集合之外。
- `/healthz` 从逐一读取18个集合改为 Directus ping 加两枚令牌的权限映射检查，单次下游请求由约20次降为3次；任一内容集合不是受限只读权限，或联系令牌不能创建留言时仍失败关闭。逐集合真实读取和越权检查继续由 `cms:verify-runtime-permissions` 承担。
- 关于页仓点类型改为直接依赖 `src/lib/directus-types.ts`，解除 `about/types → directus兼容门面 → 内容查询 → about/types` 的导入循环；重新生成源码依赖图后确认无导入循环。
- 原子发布清单已加入 `config/`，并增加部署契约测试，避免本地构建正常但服务器缺少共享配置。
- README、CMS内容模型、维护性说明和生产修复交接文档已同步到新结构与健康检查语义。
- 全量 `npm run verify` 通过：Astro检查309个文件无错误、ESLint通过、454个文件通过维护性预算、55个引用资源与103个部署资源完整、21个测试文件共98项单元测试通过、生产构建通过。
- Playwright本地回归结果为35项通过、4项按配置跳过、1项桌面案例页在并发运行中加载超时；该用例随后单独重跑并在1.6秒内通过，移动端同用例也已通过，暂未发现与本轮改动相关的浏览器回归。
- 本轮未修改业务数据、页面文案、接口、路由或数据库，未提交Git、未推送、未部署。

## 对话文档整理（2026-08-14）

- 新增 `docs/CONVERSATION_SUMMARY.md`，按主题汇总本次长对话中的技能库、官网设计、产品页、Directus、数据库、部署、安全、代码结构、测试、关键决策和下一步任务。
- 新增 `docs/CONVERSATION_TIMELINE.md`，从项目窗口最早的技能库讨论开始，按时间阶段记录用户目标、执行结果、方案替换、验证状态和未完成事项。
- 文档区分当前方案、历史方案和未执行事项，不记录任何密码、Token或真实环境变量；当前实时状态仍以本文件为准。

## 发布与案例资源稳定性（2026-08-15）

- `02bad39` 与案例资源修复提交 `5f5ec44` 已推送到 GitHub `main`。
- 阻断原因为案例详情Hero继续依赖六张Unsplash外部图片；DOM已经完整返回，但外部图片连接长时间未结束，Playwright等待页面 `load` 事件超过30秒。该问题在发布门禁中连续影响桌面与移动端，不能继续按偶发超时忽略。
- 六张已确认案例封面已保存为本地WebP资源并统一写入案例事实数据，首页回退卡片和案例详情继续共用同一图片来源，页面不再依赖Unsplash可用性。
- 修复后案例详情桌面与移动端定向回归均通过，加载耗时约1.1至1.2秒；资源检查通过。随后完整门禁36项通过、4项按配置跳过，正式域名契约3项通过、生产构建通过。

## Directus 12 权限兼容与发布尝试（2026-08-15）

- `5f5ec44` 的验收站发布完成全部本地门禁和远端依赖安装后，新版 `/healthz` 因网站仍使用管理级兼容令牌返回503；原子发布脚本自动恢复到 `20260814T135305Z`，旧版恢复后健康检查为200，未留下半发布状态。
- 验收站实际 Directus 版本确认为12.1.1；Community 许可允许生产运行，但 `custom_permission_rules_enabled` 未授权，因此创建已发布内容过滤或字段级权限会被官方许可门禁拒绝。首次权限拆分在写入 Web 环境前停止，没有泄露或替换令牌。
- 已按实例真实能力建立 `Website Content Read-Only` 与 `Website Contact Create-Only` 两套策略、两个独立运行用户和两枚不同静态令牌；前者只能读取18个内容集合，后者只能创建 `contact_leads`，二者访问系统集合和对方集合均返回401/403。
- 项目权限契约已兼容两种合法模式：具备授权时读取权限为 `partial` 并下沉已发布过滤；Community 模式读取权限为 `full` 但仍只限指定集合和读取动作，应用查询继续统一过滤 `status=published`。联系字段白名单继续由服务端接口强制执行。
- 定向单元测试3个文件共16项通过；两枚运行令牌的真实权限审计通过。随后完整发布门禁通过：Astro 309个文件无问题、ESLint通过、454个文件通过维护性预算、55个引用资源与103个部署资源完整、21个测试文件共100项单元测试通过、Playwright 36项通过且4项按配置跳过、正式域名契约3项通过、生产构建通过。
- 权限兼容提交 `3f7f705` 已推送到 GitHub `main`。首次推送遇到GitHub HTTPS短暂超时，连通性恢复后重试成功，远端与本地提交一致。
- 验收站原子发布成功切换到 `/var/www/xyy-web/releases/20260814T171015Z`；PM2 `xyy-web` 在线、无重启，内部和外部 `/healthz` 均返回200与 `contactStorage: ok`，首页、Directus ping、robots、sitemap、llms.txt及本地案例封面资源均通过发布后检查。

## Directus 返回状态语义修复（2026-08-15）

- 本轮基于 Git SHA `62095867ce74aabf6352cc9d08a361d9e217d108` 开展，最终形成独立本地提交 `526f5b2`；未推送、未部署、未修改真实 Directus 或数据库。
- 统一内容请求语义：HTTP 成功且响应结构合法为 `success`，空数组或空单例保持为空；网络连接失败、超时和 HTTP 5xx 为 `unavailable`；401/403 为 `unauthorized`；其他异常 4xx、非法 JSON、缺少 `data` 或数据类型错误为 `invalid`。
- 所有集合和单例内容读取统一经过 Directus 请求适配层，并使用集中维护的 3000ms 超时；测试可以临时注入更短超时，且每个测试后都会恢复默认请求器和超时。
- 只有 `unavailable` 可以使用审核静态回退，并输出带集合、操作、原因和可选 HTTP 状态的 `[directus:fallback]` 日志；相同降级日志在短时间内去重。401/403 与非法响应会抛出包含集合和错误类型的明确错误。
- 案例列表在 CMS 正常返回空数据时保持为空；案例 slug 不存在或取消发布时返回真正的 HTTP 404，不再 302 跳转或恢复静态详情。CMS 网络失败、超时或 5xx 时，审核静态案例仍可访问。
- 修改范围：Directus 客户端与两组查询、状态错误适配器、Directus 门面、案例详情路由，以及相关 Vitest、Playwright 契约测试；未修改视觉、业务文案、公开数字、CMS 模型、权限、部署、Oracle 或依赖版本。
- 测试先行证据：旧实现下定向 Vitest 为12项失败、2项通过；案例空 CMS 的 Playwright 契约为1项失败、1项通过，失败原因均符合待修语义。实现后5个Directus定向测试文件共33项通过，案例与回退定向 Playwright 3项通过；另有一条空记录校验测试先失败再由统一客户端校验修复。
- 首次完整发布验证因新增测试文件332行超过220行维护预算而失败；随后按成功/空数据与故障分类职责拆成195行和157行两个测试文件，没有放宽预算或删除断言。
- 最终实际验证：`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run test:e2e`、`npm run test:formal-contract`、`npm run build`、`npm run verify:release` 均通过；最终为311个Astro文件无问题、456个文件通过维护预算、112项单元测试通过、37项E2E通过且5项按配置跳过、3项正式域名契约通过、生产构建通过。

### 第一阶段文件范围

- 已修改：`DEV_STATE.md`、`src/lib/directus-client.ts`、`src/lib/directus-content-queries.ts`、`src/lib/directus-queries.ts`、`src/lib/directus.ts`、`src/pages/cases/[slug].astro`、`tests/e2e/contracts.spec.ts`、`tests/unit/directus-content-resilience.test.ts`、`tests/unit/directus-resilience.test.ts`。
- 第一阶段新增且仍未跟踪：`src/lib/directus/request-state.ts`、`tests/unit/directus-error-semantics.test.ts`。
- `DEV_STATE.md`、两组 Directus 查询、案例契约测试和 `directus-resilience.test.ts` 在第二阶段继续发生修改，因此属于两阶段共享文件；不能仅凭最终 `git diff` 自动归属某一个阶段。

## 公开业务事实唯一来源与 CMS 防漂移治理（2026-08-15）

- 本轮以第一阶段提交 `526f5b2` 为父提交，形成独立的第二阶段本地提交；未推送、未部署、未连接或修改真实 Directus，也未修改数据库、权限、页面视觉、公开审核值或依赖版本。
- 第一阶段前置条件已确认：Directus 请求能够区分 `success`、`unavailable`、`unauthorized` 和 `invalid`，成功空数据不回退，401/403 与非法响应明确失败，案例取消发布返回真实 404；相关定向测试 18 项全部通过。
- `src/lib/claims.ts` 继续作为稳定公开入口，新增注册表验证、页面范围校验、审核状态与过期校验、统一展示值拆分、严格占位符插值、CMS 首页统计解析和旧格式映射等小型职责模块，避免事实解析重新堆入巨型文件。
- 全局公开事实只能从 claims 注册表读取；调用方必须通过 `getApprovedClaim()`、`getClaimText()` 或 `getClaimPresentation()` 并传入明确页面范围。`CLAIM_TEXT` 仅作为兼容导出保留，运行时只包含确实允许 `*` 全站使用的事实，不能绕过页面权限。
- CMS 首页统计的新契约使用 `claimKey`；CMS 即使同时提交冲突的 `value` 或 `unit`，页面仍使用审核注册表的值，并输出去重的兼容警告。旧记录只能通过集中、受测试保护的稳定数字 ID 映射；禁止按 CMS 数值、标签、单位、说明、其他自由文本或当前排序猜测事实。没有稳定 ID 或映射未命中时明确判为非法。
- 旧格式兼容层是上线迁移期间的临时措施，只支持 `LEGACY_HOMEPAGE_CLAIM_BY_ID` 中明确列出的旧记录 ID。自由文本指纹映射已删除，并有“文本完全匹配但缺少稳定 ID 仍失败”的回归测试。待真实 CMS 全部写入合法 `claimKey`、迁移结果经过验收并确认没有旧记录后，应删除 ID 映射与 `[claims:legacy]` 警告路径。
- CMS 文本占位符必须以 `interpolateClaims(value, { pageScope, source })` 解析；未知、未审核、已过期或当前页面越权的 claim 均明确失败，不再原样输出 `{{...}}`。错误只包含 claimKey、页面范围和有限来源定位，不包含 Token 或完整 CMS 正文。
- 首页统计、FAQ、服务 seed、首页可见文本、品牌数据、案例页公共文案、SEO/JSON-LD 与 `llms.txt` 已改为引用同一 claims 注册表；数据卡的值和单位由统一 presentation 层拆分，防止重复单位。
- CMS seed 生成源改为保存 `claimKey` 或 `{{claimKey}}`，生成前统一验证引用；`npm run cms:generate-faq-seeds` 成功生成 17 个页面的 100 条 FAQ，`npm run cms:generate-content-seeds` 成功生成 12 个服务页、14 期期刊、6 个案例详情及关于/站点内容。两个生成输出 `scripts/data/approved-faq-seeds.mjs` 和 `scripts/data/approved-cms-page-seeds.mjs` 与 Git 中现有内容一致，没有产生工作树差异。
- CMS 字段 Schema 未修改：`scripts/data/core-content-collection-definitions.mjs`、`scripts/setup-cms.mjs`、`server/runtime-permissions.mjs` 和 `scripts/data/cms-admin-translations.mjs` 相对 HEAD 均无差异；`scripts/data/content-management-collection-definitions.mjs` 只有首页统计字段的后台说明文字由硬编码 `150+` 改为引用审核事实注册表，没有增加、删除或更改字段名、类型、接口、选项、关系或权限。
- 漂移检查覆盖 `src/**/*.{astro,ts,tsx}`、`scripts/**/*.{mjs,json}` 和测试源码，并对非业务百分比等明确场景设置窄范围排除；页面、seed 和测试不得重新维护一份全局审核数字。案例专属指标继续留在案例域，只记录证据缺口。
- 测试先行证据：新增测试在旧实现下因缺少严格插值模块和 presentation API、未知 claimKey 被接受、CMS 值直接透传而失败；实现后新增两组核心契约测试 18 项全部通过。
- 实际验证结果：阶段一前置定向测试 18 项通过；自由文本指纹回归测试在修复前按预期 1 项失败、4 项通过，删除指纹后 claims 定向测试 3 个文件共 26 项通过；单元测试 24 个文件共 137 项通过；`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run test:e2e`、`npm run test:formal-contract`、`npm run build` 和 `npm run verify:release` 全部通过。最终门禁为 319 个 Astro 文件无问题、464 个文件通过维护预算、38 项 E2E 通过且 6 项按项目配置跳过、3 项正式域名契约通过、生产构建通过。
- 首次完整门禁发现三个已有或本轮触及的文件超过维护预算；通过复用类型和抽取测试夹具完成拆分，未提高阈值、未删除测试、未降低断言。测试期间出现的 `[directus:fallback]` 网络日志来自本地不可达 CMS 的受控降级验证，不代表真实环境已经连接或验证。

### 第二阶段文件范围

- Claims：`src/lib/claims.ts`、`src/lib/claims/cms.ts`、`src/lib/claims/interpolation.ts`、`src/lib/claims/legacy-mapping.ts`、`src/lib/claims/presentation.ts`、`src/lib/claims/validation.ts`、`src/lib/claims/fulfillment-performance.ts`、`src/lib/claims/fulfillment-scale.ts`、`src/lib/claims/quality.ts`。
- Directus 契约：`src/lib/directus-content-queries.ts`、`src/lib/directus-interpolation.ts`、`src/lib/directus-queries.ts`、`src/lib/directus-types.ts`。
- 页面与数据：`src/data/brand/core.ts`、`src/data/brand/home.ts`、`src/data/home/cms-fallbacks.ts`、`src/data/home/faqs.ts`、`src/pages/cases.astro`、`src/pages/index.astro`、`src/pages/llms.txt.ts`。
- Seed 与生成：`scripts/data/approved-homepage-stats.mjs`、`scripts/data/approved-services.mjs`、`scripts/data/cms-seed-config.mjs`、`scripts/data/content-management-collection-definitions.mjs`、`scripts/generate-cms-content-seeds.mjs`、`scripts/generate-faq-seeds.mjs`、`scripts/lib/claim-reference-validation.mjs`、`scripts/migrate-unified-content.mjs`、`scripts/sync-approved-cms-content.mjs`。
- 测试：`tests/e2e/contracts.spec.ts`、`tests/e2e/home-product.spec.ts`、`tests/formal/production-origin.spec.ts`、`tests/unit/claims-contract.test.ts`、`tests/unit/claims.test.ts`、`tests/unit/cms-sync.test.ts`、`tests/unit/directus-resilience.test.ts`、`tests/unit/directus.test.ts`、`tests/unit/homepage-claims-contract.test.ts`。
- 状态记录：`DEV_STATE.md`。
- 第二阶段新增文件：`scripts/lib/claim-reference-validation.mjs`、`src/lib/claims/cms.ts`、`src/lib/claims/interpolation.ts`、`src/lib/claims/legacy-mapping.ts`、`src/lib/claims/presentation.ts`、`src/lib/claims/validation.ts`、`tests/unit/claims-contract.test.ts`、`tests/unit/homepage-claims-contract.test.ts`。

### 第二阶段准确验证命令

- `npx vitest run tests/unit/homepage-claims-contract.test.ts`：删除自由文本指纹前为 1 项失败、4 项通过，证明相同自由文本在没有稳定 ID 时会被旧实现错误接受。
- `npx vitest run tests/unit/homepage-claims-contract.test.ts tests/unit/claims-contract.test.ts tests/unit/claims.test.ts`：3 个文件、26 项通过。
- `npm run cms:generate-faq-seeds`：成功，生成 17 个页面的 100 条 FAQ；生成文件无 Git 差异。
- `npm run cms:generate-content-seeds`：成功，生成 12 个服务页、14 期期刊、6 个案例详情及关于/站点内容；生成文件无 Git 差异。
- `npm run format:check`：通过。
- `npm run typecheck`：319 个文件，0 错误、0 警告、0 提示。
- `npm run lint`：通过。
- `npm run test`：24 个文件、137 项通过、0 失败、0 跳过。
- `npm run test:e2e`：38 项通过、0 失败、6 项按项目配置跳过。
- `npm run test:formal-contract`：3 项通过、0 失败、0 跳过。
- `npm run build`：通过。
- `npm run verify:release`：通过；聚合门禁再次完成类型、Lint、464 个文件维护预算、55 个引用资源、103 个部署资源、137 项单元测试、38 项 E2E、3 项正式域名契约和生产构建。

### 两阶段提交拆分与独立验证

- 第一阶段已独立提交为 `526f5b2 修复 Directus 返回状态语义`，包含10个文件；第二阶段以该提交为父提交，包含39个文件。共享查询和测试文件按具体代码块拆分，没有把 claims API、`claimKey` 或页面范围校验混入第一阶段。
- 在独立临时 worktree 检出 `526f5b2` 后，`npx vitest run tests/unit/directus-error-semantics.test.ts tests/unit/directus-content-resilience.test.ts tests/unit/directus-resilience.test.ts` 为3个文件、18项通过；`npm run typecheck` 检查311个文件，0错误、0警告、0提示。
- 临时 worktree 首次执行 `npm ci` 长时间无进展后被中止；残留的部分依赖目录一度被 Astro 当成项目文件扫描并导致内存耗尽。将该临时目录移出 worktree 后，第一阶段 typecheck 正常通过，证明该失败来自临时验证环境而不是提交代码。临时 worktree 与残留依赖目录均已清理。
- 第二阶段提交前重新执行 `npm run format:check` 与 `npm run test`，结果为格式通过、24个测试文件共137项通过。两个提交均仅存在于本地，未推送、未部署。

## Directus CMS 模型契约与迁移准备（第三阶段，2026-08-15）

- 基线为第二阶段本地提交 `9cb7b426547582a84d865b18bc24397685aefe5c`。开始前工作树干净；第一、第二阶段快照保存为 `/tmp/xyy-phase1-2-status.txt` 与 `/tmp/xyy-phase1-2-tracked.patch`，两者均为空文件且 SHA-256 均为 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`。开始时没有未跟踪文件，因此未创建空压缩包。
- 前置回归通过：Directus 状态分类、成功空数据、401/403/invalid、案例真实 404、claims、claimKey、占位符、首页统计和事实漂移相关 6 个测试文件共 44 项通过，确认第一、第二阶段没有退化。
- 审查发现原实现存在 `config/cms-collections.mjs → scripts/data/cms-contract.mjs` 的运行反向依赖，已将唯一机器可读主契约移动为 `config/cms-contract.mjs`，模型版本为 `2026-08-phase3`。当前运行 import graph 为 `server/runtime-permissions.mjs → config/cms-collections.mjs → config/cms-contract.mjs`；`scripts/data/cms-contract-definitions.mjs` 仅在脚本侧绑定字段定义，`config/` 与 `server/` 不再依赖 `scripts/`。最小发布包测试只复制真实发布目录 `config/` 与 `server/`，可以成功导入运行权限模块。
- 集合生命周期分类：13 个 active（`homepage_content`、`faq_pages`、`services`、`warehouses`、`cases`、`news`、`faqs`、`publications`、`service_pages`、`about_content`、`about_history`、`about_honors`、`site_settings`）；5 个 legacy（`homepage_stats`、`case_details`、`case_stats`、`service_stats`、`service_features`）；1 个 private（`contact_leads`）。private 集合不参与内容 seed 或合同迁移。
- 稳定身份规则：沿用 `key`、`slug`、`issue` 等既有不可变字段；为 `warehouses`、`faqs`、`about_history`、`about_honors`、`service_features` 定义只读、必填、唯一 `content_key`；为 `homepage_stats`、`case_stats`、`service_stats` 定义只读、必填、唯一 `metric_key`。所有新 seed key 均显式存在于审核源数据；问题、标题、标签、名称、排序、年份、数组索引、显示文案、数字和单位不再生成稳定身份，并有改文案、改排序、改年份仍保持同一身份的测试。
- FAQ 归属以 `faq_page` 关系为唯一权威来源，前端按 `faq_page.key` 查询；seed 保存 `faqPageKey` 并在 setup 时解析当前环境真实关系 ID。`page_key` 暂时保留为只读 legacy 字段，只用于迁移核对；真实 CMS 完成关系迁移、验证全部一致且新代码不再读取后方可删除。
- setup 只创建缺失集合、安全缺失字段和关系，并按稳定身份补齐缺失 seed；已匹配的集合和字段元数据不会重复写入，已存在的运营正文不会被覆盖。有数据集合缺少 required+unique 身份字段时，迁移按“创建 nullable/非 unique 字段 → 回填 → 重新读取验证无 null → 验证无重复 → 收紧 required → 增加 unique → 完整 verify”分阶段执行；中途失败可以安全重跑，完成后第二次计划为零变更。现有字段 type、required、unique、default、singleton、relation target、on_delete 不兼容时明确返回 `migration_required`。
- 第三阶段提交前审查复现了 Singleton Seed 覆盖风险：稳定身份不一致时，旧实现会把审核 seed 整条 PATCH 到现有单例。当前 setup 只允许在稳定身份为空且所有 seed 管理的业务字段均无内容时初始化 Singleton；身份相同的现有 Singleton 始终 no-op，不同步或补齐正文；身份缺失或不一致但已有内容时返回 `singleton_migration_required`，且错误不包含运营正文。setup-cms 不是运营正文同步工具；运营内容只能通过 Directus 后台、受控内容同步或显式迁移维护。修复前新增回归测试为 6 项失败、11 项通过；修复后 Singleton/Setup 两个定向测试文件共 18 项通过，第三阶段 9 个定向文件共 63 项通过。最终 `npm run verify:release` 以状态码 0 完成：337 个 Astro 文件无诊断、482 个文件通过维护预算、193 项单元测试通过、38 项 E2E 通过且 6 项按配置跳过、3 项正式域名契约通过、生产构建通过。真实 CMS 未执行 dry-run 或迁移；第三阶段作为独立本地提交管理，尚未推送或部署。
- verify 输出模型版本、集合总数与 active/legacy/private 数量，并阻塞字段、关系、singleton、稳定身份缺失或重复等关键契约错误。已确认的旧字符串文件字段进入显式 allowlist，必须输出原因和删除条件；未知例外仍然阻塞。
- 新增 `npm run cms:migrate-contract`。默认只读 dry-run；`--apply` 还必须提供与模型版本完全一致的确认值。每个旧 ID 映射必须同时包含 collection、record ID、target stable key 与 expected-before 精确断言；只先按 ID 选中记录，再验证内容，验证不一致即 `manual_mapping_required`。旧 `homepage_stats` 通过审核记录 ID 精确回填 `metric_key`，首页单例内嵌 stats 只有携带稳定 ID 且满足同一审核断言时才能回填 `claimKey`；缺少稳定 ID 时禁止按数组顺序推断。其他迁移只接受稳定 slug/key/issue、审核 seed key或人工确认的精确记录 ID 映射，禁止使用文本寻找记录。
- apply 前会将受影响的非 private 集合保存到 Git 已忽略的 `output/cms-migrations/`，写入 SHA-256 后才允许外部修改。Directus API 不提供跨请求原子事务，因此实现采用 fail-fast、逐步幂等、保留快照和安全重跑，不声称原子迁移；apply 后自动验证剩余变更、稳定身份、FAQ 关系、claimKey 和完整 Schema。
- seedPolicy 已统一：active 为 `normal`，legacy 为 `migration_only`，private 为 `never`。`case_details`、`case_stats`、`service_stats`、`service_features` 等 legacy Schema 仅为旧数据迁移、核对和必要回滚保留，全新 CMS 不再 Seed legacy 内容；`contact_leads` 不参与 seed、内容读取、迁移或快照，verify 只检查它的集合、字段和关系 Schema。
- CMS 生成结果已重新生成并保留第三阶段差异：17 个页面的 100 条 FAQ 增加显式稳定 `content_key` 与 `faqPageKey`；12 个服务页、14 期期刊、6 个案例详情以及 history、honor 内容使用显式稳定身份。生成文件仍由脚本产生，没有直接手改 generated 输出；legacy case/service 指标不再进入新 seed 输出。
- 测试先行证据：验收补强前，legacy 集合仍被 normal seed、FAQ key 仍由数组索引生成的测试按预期失败；实现后第三阶段定向测试 9 个文件、86 项通过，第一、第二阶段回归 6 个文件、44 项通过。Schema 分阶段迁移拆分后的 3 个定向文件共 16 项通过，覆盖创建、回填、远端无空值/无重复校验、约束收紧、中断重跑、零变更和快照边界。
- 最终验证：两项 CMS seed 生成命令分别生成 17 页/100 条 FAQ 与 12 个服务页、14 期期刊、6 个案例详情；`npm run format:check` 通过；`npm run typecheck` 检查 336 个文件，0 错误、0 警告、0 提示；`npm run lint` 通过；维护性预算检查 481 个文件通过；`npm run test` 为 31 个文件、183 项通过；`npm run test:e2e` 为 38 项通过、6 项按配置跳过；`npm run test:formal-contract` 为 3 项通过；`npm run build` 通过；`npm run verify:release` 以状态码 0 完成；`git diff --check` 通过。
- 真实 CMS 尚未执行 dry-run 或 apply；没有连接真实 Directus、修改真实 Schema 或迁移真实内容。第三阶段代码、测试和文档已完成本地验收并作为独立本地提交管理，但尚未推送或部署，不能描述为“CMS 已迁移”。

### 第三阶段主要文件范围

- 主契约与定义：`config/cms-contract.mjs`、`config/cms-collections.mjs`、`scripts/data/cms-contract-definitions.mjs`、`scripts/data/*collection-definitions.mjs`、`scripts/data/cms-field-builders.mjs`、`scripts/data/cms-seed-config.mjs`。
- setup/verify 运行时：`scripts/setup-cms.mjs`、`scripts/verify-production-cms.mjs`、`scripts/lib/cms-setup-runtime.mjs`、`scripts/lib/cms-seed-runtime.mjs`、`scripts/lib/cms-navigation-runtime.mjs`、`scripts/lib/cms-contract-runtime.mjs`。
- 迁移：`scripts/migrate-cms-contract.mjs`、`scripts/lib/cms-contract-migration.mjs`、`scripts/lib/cms-contract-schema-migration.mjs`、`scripts/lib/cms-contract-snapshot.mjs`、`package.json` 的 `cms:migrate-contract` 脚本。
- FAQ 读取：`src/lib/directus-queries.ts`、`src/lib/directus-types.ts`。
- Seed 生成：`scripts/generate-faq-seeds.mjs`、`scripts/generate-cms-content-seeds.mjs`、`scripts/data/service-page-slugs.mjs`、两份 generated seed 及稳定仓库 seed。
- 测试：`tests/unit/cms-contract.test.ts`、`tests/unit/cms-contract-runtime.test.ts`、`tests/unit/cms-contract-migration.test.ts`、`tests/unit/cms-contract-schema-migration.test.ts`、`tests/unit/cms-contract-snapshot.test.ts`、`tests/unit/cms-seed-identity.test.ts`、`tests/unit/cms-setup-contract.test.ts`，以及直接调整的 setup、Directus 和最小发布包既有测试。
- 文档：`docs/CMS_CONTENT_MODEL.md`、`DEV_STATE.md`。

## Web 运行权限残余收口（第四阶段，2026-08-15）

- 基线为第三阶段独立提交 `ad54a4bd6aaa081f9109ac8ba65f4ff383eb5f5b`；开始前工作树干净。第四阶段完成后作为独立本地提交管理，未推送、未部署，未主动执行真实 CMS 权限审计，也未修改真实 Token、策略或数据。首次未隔离构建曾向本机既有 Directus 配置发出一次 `site_settings` 只读请求并收到403，不能表述为“完全未连接真实 CMS”；后续完整验收均使用本机不可达地址和虚拟 Token 隔离运行。
- 确认并修复三项运行风险：内容读取与联系写入不再回退 `DIRECTUS_TOKEN`；缺少任一专用 Token 或两枚专用 Token 相同时运行契约失败；内容运行集合由主 CMS 契约的 active 生命周期派生，排除5个 legacy、`contact_leads` private 集合及显式 `runtimeRead=false` 的 active 集合。`DIRECTUS_TOKEN` 继续仅供 setup、迁移和管理权限脚本使用。
- `/healthz` 继续只执行1次 Directus ping 和2次 `/permissions/me`，证明服务就绪、双 Token 存在且不同、13个运行集合可读、联系 Token 可创建留言；不逐集合请求内容，也不冒充完整最小权限审计。
- `cms:verify-runtime-permissions` 负责完整 mock 可验证契约：内容 Token 可读取全部运行集合且无写动作，不能读取 legacy、private、咨询或系统集合；联系 Token 仅可创建 `contact_leads`，不能读取/修改/删除/分享留言，不能读取运行、legacy 或系统集合。允许端点必须返回2xx，禁止端点只有401/403可证明拒绝；2xx、404和网络错误均失败关闭，网络错误标记为 `permission_verification_unreachable`。
- Directus 12 Community 的集合 create 权限可能返回 `fields=['*']`，因此字段限制模式明确为 `application_enforced`；服务端只把 `name`、`phone`、`company`、`email`、`service`、`message` 写入 Directus，浏览器提交的 `status`、`source`、时间和系统字段会被丢弃，不声称 CMS 已实施不存在的字段级策略。
- 集合导出消费者已逐项核查：`CMS_CONTENT_COLLECTIONS` 只供 Web 运行权限与 `Website Content Read-Only` 权限同步使用，二者都需要13个运行集合；`CMS_ALL_COLLECTIONS` 只用于19个 Schema 定义的完整性校验；`CMS_LEGACY_COLLECTIONS` 只用于负权限映射与拒绝探测；`CMS_PRIVATE_COLLECTIONS` 只用于边界断言。未发现把运行集合误用于 Schema、seed、迁移或快照的消费者。
- 测试先行证据：旧实现下4个定向测试文件为8项失败、18项通过，另有权限审计测试因脚本导入即调用 `process.exit(1)` 无法运行；失败证据包括共享 Token 实际用于留言 POST、health 对相同 Token 继续请求下游、运行集合无法排除 legacy，以及审计缺少可注入的失败关闭语义。修复后5个定向测试文件共37项通过；`npm run format:check` 与 `npm run typecheck` 已通过。
- 首次未隔离环境执行完整门禁时，本机既有 Directus 配置在构建 `/404.html` 读取 `site_settings` 时返回403，门禁据此正确失败；未执行权限审计、写请求或数据修改。随后显式使用本机不可达地址和两枚虚拟且不同的测试 Token 重新执行 `npm run verify:release`，退出码为0：338个 Astro 文件无诊断、ESLint通过、483个文件通过维护预算、55个引用资源与103个部署资源完整、33个单元测试文件共206项通过、38项 E2E 通过且6项按配置跳过、3项正式域名契约通过、两次生产构建通过，`git diff --check` 通过。该结果只证明本地代码和 mock/fixture 权限契约，不代表真实运行权限已重新审计。

## 发布身份与运行可追溯治理（第五阶段，本地验收完成）

- 基线为第四阶段独立提交 `54fa9e64642403548f2c3e04f0242e427445aa30`；开始前工作区干净。本阶段只建立 Release Identity、`/version`、部署版本核对、CI 候选身份、测试环境隔离证明和性能观察基线，不修改 CMS、运行权限、页面或性能实现。
- 已新增唯一 Release Identity 契约：字段为 `schemaVersion`、完整 Git SHA、派生短 SHA、包含短 SHA 的 Release ID、UTC 构建时间、显式环境和从 CMS 主契约读取的模型版本；Manifest 拒绝未知字段，不能携带 Token、密码、Cookie、私钥、内部地址或部署路径。
- 部署入口现在会在构建、SSH 和上传之前拒绝已修改、已暂存或未跟踪文件，生成与当前提交绑定的 `release-manifest.json` 并放入独立 Release 根目录；新版本切换和带 Manifest 的回滚都必须同时通过 `/healthz` 与版本身份核对。旧 Release 没有 Manifest 时保留首次兼容回滚，但输出 `legacy_previous_release_identity_unavailable`，不能声称身份已验证。
- `/version` 与 `/healthz` 职责分离：前者返回不可缓存的公开 Release 身份，Manifest 缺失或非法时安全返回503；后者继续只证明 Directus 与双 Token 权限映射就绪。外部健康检查支持精确核对 Git SHA、Release ID、环境和 CMS 模型版本；未提供预期值时只验证基本结构，不声称目标版本匹配。
- CI 使用 `github.sha` 和 `environment=ci` 生成候选 Manifest，仍只有 `contents: read` 权限，不具备生产部署能力；CI、Playwright 与正式域名契约显式覆盖不可达 Directus 地址和虚拟双 Token，不依赖开发者机器的 `.env`。
- 测试先行证据：实现前两个新增定向测试文件因缺少契约、Manifest 生成器、`/version`、脏工作区门禁、版本核对和 CI SHA 绑定而失败。首次失败测试在重构前导入旧 `scripts/health-check.mjs` 时，旧脚本的顶层副作用对现有验收地址执行了一次只读健康检查；未写入数据、未部署、未修改服务器。脚本现已改为仅在 CLI 直接执行时发起请求，测试导入不再访问网络。
- 最终本地验证：4个 Release/部署/健康定向测试文件共43项通过；可维护性检查曾发现 `scripts/deploy.sh` 超出200行预算1行，已通过压缩同一职责代码恢复到预算内。`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test` 和 `npm run verify:release` 均通过；聚合门禁为343个 Astro 文件无诊断、488个文件通过维护预算、55个引用资源与103个部署资源完整、35个单元测试文件共230项通过、38项 E2E 通过且6项按配置跳过、3项正式域名契约通过、生产构建通过，`git diff --check` 通过。第五阶段作为独立本地提交管理，提交 SHA 以 Git 历史为准；当前状态为 `PHASE_5_LOCALLY_VERIFIED`、`RELEASE_IDENTITY_CONTRACT_VERIFIED`、`VERSION_ENDPOINT_VERIFIED`、`MOCK_DEPLOYMENT_IDENTITY_VERIFIED`、`PERFORMANCE_BASELINE_RECORDED`、`REAL_DEPLOYMENT_NOT_EXECUTED`、`REAL_VERSION_NOT_VERIFIED`、`LOCALLY_COMMITTED`、`NOT_PUSHED`、`NOT_DEPLOYED`。
- 已登记用户提供的 2026-08-15 桌面 PageSpeed 实验室基线：性能82、无障碍100、最佳做法100、SEO100、FCP 0.8秒、LCP 1.9秒、TBT 0毫秒、CLS 0、Speed Index 4.0秒；无 CrUX 数据且无法确认当时 Git SHA。本阶段没有修改任何性能代码，真实部署后需结合 `/version` 重新采集。

## 下一步

1. 人工审查两个连续的本地提交，重点确认成功空数据、案例 404、页面范围、CMS `claimKey`、旧格式映射和严格占位符符合运营预期。
2. 对真实 CMS 先完成独立数据库备份，再使用第三阶段工具执行只读 dry-run；人工审核所有 `manual_mapping_required`、稳定身份、FAQ 关系和 claimKey 计划后，才可决定是否 apply。
3. 真实 apply 后运行完整 verify，并确认第二次 dry-run 为 0 changes；达成前不得删除 `page_key`、旧首页统计 ID 映射或 legacy 文件字段例外。
4. 建立案例专属 evidence 模型，明确来源文件、统计周期、审核时间和公开授权；在依据不足前不得将案例指标并入全局 claims，也不得补造证据。
5. 人工审查第五阶段 Release Identity、`/version`、部署与回滚身份核对 Diff；审查通过后再决定是否建立独立提交和执行真实部署。本轮代码治理到此结束，不创建第六阶段。
6. 补齐 16 项全局事实的正式来源附件和统计周期；对于确实不适用统计周期的事实，应由业务审核后形成明确证明，而不是由代码推断。

## 真实环境契约收口补丁（2026-08-15，不是第六阶段）

- 基线为已发布提交 `1c3c81e336d3fc67de74ccd5d550981c9603052d`，开始前工作区干净。本补丁仅收口 CMS 目标契约和 dry-run 计划，当前仍未提交、未推送、未 apply、未部署。
- 真实预检确认5个 legacy 集合不参与运行读取或 seed，因此取消 `homepage_stats.metric_key`、`case_stats.metric_key`、`service_stats.metric_key`、`service_features.content_key` 的新增、映射、必填与唯一要求；legacy 继续保留现有 Schema，但 verify 不读取其记录，也不再产生人工映射。
- Active 要求保持不变：`warehouses.content_key`、`faqs.content_key`、`about_history.content_key`、`about_honors.content_key` 与 `homepage_content.stats.claimKey` 仍必须经人工确认；FAQ 继续以 `faq_page` 关系为唯一页面归属。
- 该轮曾按预检快照将 `cases.metrics`、`news.summary`、`news.published_at` 视为 string；真实 Apply 后的严格复核确认最终 Schema 分别为 text、text、timestamp，后续“Verify 契约漂移收口”已以真实迁移结果更正这项历史判断。
- 迁移读取边界：正常内容快照只包含 active 迁移集合；private `contact_leads` 只读取字段元数据并只允许上述两个默认值的 schema-only 计划，不读取、快照、修改或回填任何留言记录。
- 测试先行证据：旧实现下4个定向测试文件共14项失败、30项通过，失败准确覆盖 legacy 人工映射、legacy 身份字段、三项类型升级、private 记录读取边界和缺失安全 Schema 计划；实现后5个定向测试文件共45项通过。维护性预算曾因新增用例令两个测试文件超过220行而失败，随后按“真实环境契约收口”职责拆出专用测试文件，没有提高阈值或删除断言。
- 本地验证使用不可达 Directus 地址与两枚虚拟 Token 隔离执行：Prettier、Astro typecheck、ESLint、维护性、资源检查、245项 Vitest、38项 Playwright（6项按配置跳过）、3项正式域名契约、构建和 `npm run verify:release` 全部通过。未隔离的首次聚合构建因开发机既有 CMS Token 对 `site_settings` 返回403而正确失败，未发生写请求；隔离重跑退出码为0。
- 真实验收 CMS 只读复检：`cms:verify` 不再因4个 legacy 身份字段或 `cases.metrics`、`news.summary`、`news.published_at` 的 string 类型失败；它仍按预期阻塞4个 active 身份字段、`news.slug` unique 和两项联系默认值。默认 `cms:migrate-contract` dry-run 产生144项 `manual_mapping_required`（仓库12、FAQ100、发展历程9、荣誉15、首页 claimKey 8），legacy 映射0；`singleton_migration_required`、重复身份、关系错误与 contract review 均为0。Schema 计划为4个 active nullable 身份字段、`news.slug` unique 和两项 private schema-only 默认值。
- 范围外状态不变：内容 Token 仍有5条 legacy read 权限待精确撤销；数据库和附件备份虽已完成同机校验，但 `offsite_backup_missing`。两项均未在本补丁中处理，并继续阻止真实 apply。

任何密码、Token、API Key、私钥、Cookie 和真实 `.env` 都不得写入本文档或提交到 Git。

## Verify 契约漂移收口（2026-08-15）

- 基线提交为 `f2d47bd47060db5e6d4dd42b8fae6861f76facc1`。144项 Active 身份与 claimKey、5条 legacy read 权限、真实 migration Apply 和运行权限审计均已完成；本轮不再执行 Apply，也不修改真实 CMS、内容或权限。
- 根因是 `scripts/data/cms-contract-definitions.mjs` 在权威 collection definitions 之后又把 `cases.metrics`、`news.summary`、`news.published_at` 覆盖为 string，同时 `faqs.page_key` 与 `about_honors.image` 的 definitions 没有表达真实 required 状态；migration planner 不规划这些反向变更，因此第二次 dry-run 已为零，但 verify 仍读取了漂移后的契约。
- 最终严格契约与已迁移 Schema 对齐：`cases.metrics=text`、`news.summary=text`、`news.published_at=timestamp`、`faqs.page_key required=true`、`about_honors.image required=true`。没有增加 allowlist、warning 或 verify 跳过；错误类型和 required 状态仍由严格回归测试阻断。
- 测试先行证据：旧实现下五项目标断言和五项反向漂移断言共10项失败；修复后5个定向测试文件共47项通过。新增严格漂移测试拆为独立文件以维持220行维护预算，没有提高阈值或删减断言。
- 隔离环境完整门禁通过：349个 Astro 文件无诊断、38个 Vitest 文件257项通过、E2E 38项通过且6项按配置跳过、正式域名契约3项通过、构建和 `npm run verify:release` 均成功。直接使用开发机 `.env` 的首次构建因本机内容 Token 对 `site_settings` 返回403而停止；按 CI 契约显式覆盖不可达 Directus 和虚拟双 Token 后完整通过，未发生 CMS 写入。
- 真实 CMS 只读结果：`npm run cms:verify` 为19个集合、0 warning、0 failure；`npm run cms:migrate-contract` 为0项内容变更、0项 Schema 变更。本轮修复作为独立提交管理，提交 SHA 以 Git 历史为准；真实 CMS 未再次 Apply，staging 尚未部署。

## Active 身份映射最终收口（2026-08-15）

- 当前基线为 `b726ccba2bbd4c25bfc705193195380683b9dee1`。本轮只修正审核映射的 expected-before 语义并装载已确认的144项 Active 身份，不新增 Schema、legacy 治理或迁移框架。
- expected-before 现在只对旧审查流程已经定义的 comparable business fields 生成 canonical SHA-256；FAQ 额外纳入权威 `faq_page.key`。Directus 更新时间、系统用户和其他不参与身份审核的元数据变化不再误判为身份丢失，业务字段或 FAQ 页面关系变化仍会阻断。
- FAQ 100条继续使用旧审查包中同一 record ID 对应的 content_key，并以当前业务字段和 `faq_page.key` 刷新 canonical precondition；仓库1–3保留原审核结果，仓库7–12按已审核 record ID 到 stable key 的连续性保留身份，仓库4–6使用与 record ID 绑定的随机 UUID 风格 content_key。发展历程9条、荣誉15条和首页8项 claimKey 决策保持原样。
- 已批准映射集中在 `scripts/data/approved-cms-contract-mappings.mjs`，迁移仍通过现有 `cms-contract-migration` 实现按 record ID、stable key 和 canonical hash 三重校验；没有运行时文本匹配或新建第二套迁移机制。
- 本地定向验证为4个文件26项通过；完整隔离门禁为348个 Astro 文件无诊断、ESLint通过、493个文件满足维护预算、37个 Vitest 文件250项通过、Playwright 38项通过且6项按配置跳过、正式域名契约3项通过、两轮生产构建通过，`npm run verify:release` 与 `git diff --check` 均通过。
- 当前状态：代码尚未提交或推送；真实 dry-run 尚未使用新映射重跑；真实 CMS 未 apply、权限未变更、staging 未部署。
- 新映射的真实 CMS 默认 dry-run 已只读执行成功：137条内容 PATCH 计划覆盖仓库12、FAQ100、发展历程9、荣誉15及首页单例1条整体 stats PATCH（内含8个 claimKey），另有4个 Active 身份字段各3阶段共12条 Schema 计划；没有 `manual_mapping_required`、`singleton_migration_required`、重复稳定身份、关系错误、contract review 或 legacy mapping。真实 CMS 仍未 apply，运行权限与 staging 尚未变更。
- 首次真实 Apply 已生成迁移前快照并完成普通 Active 集合的幂等身份写入，但在首页单例处因使用普通集合的 `/items/homepage_content/1` 路由被 Directus 拒绝；流程在首页 claimKey 和约束收紧前安全停止。当前实现改为单例专用 `/items/homepage_content` PATCH，并增加精确路由回归测试；需要重新完成本地门禁、GitHub CI、Apply 后 verify 和零变更 dry-run 后才能视为迁移完成。

## Staging 字段类型迁移阻塞修复（2026-08-15）

- 基线提交为 `518445ddd784947def7f202f07950b12448dae46`。真实 staging 已完成 Active 身份与 claimKey 内容迁移、身份约束和 `about_honors.image` 必填约束；当前只剩 `cases.metrics`、`news.summary`、`news.published_at` 三个字段类型变更，网站仍保持在迁移前 Release，尚未部署本轮代码。
- 根因已从 staging 安装的 Directus 12.1.1 实现确认：`PATCH /fields/{collection}/{field}` 只有请求体包含 `schema` 时才进入数据库列变更路径；旧实现只发送 `{ type }`，因此 API 返回成功但数据库类型没有变化。修复保持目标类型不变，仅在三个受控类型变更请求中增加空 `schema` 触发器，不新增迁移框架或其他 Schema 目标。
- 测试先行：回归断言先改为要求 `{ type, schema: {} }`，旧实现按预期1项失败；实现修复后3个迁移定向测试文件共23项通过。隔离环境 `npm run verify:release` 通过：350个 Astro 文件无诊断、38个 Vitest 文件260项通过、E2E 38项通过且6项按配置跳过、正式域名契约3项通过、生产构建通过，`git diff --check` 通过。
- 当前状态：修复尚未提交、推送或部署；三项真实字段类型尚未重试，`cms:verify` 与零变更 dry-run 仍需在本提交 CI 通过后验证。未修改运行权限、CMS 内容、映射、页面或业务数字。
